package store

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

const (
	SortKeyMeta = "META"

	StatusPending   = "pending"
	StatusPublished = "published"

	EntityJob     = "job"
	EntityMarket  = "market"
	EntityService = "service"
)

var (
	ErrNotFound   = errors.New("not found")
	ErrNotPending = errors.New("listing is not awaiting payment")
)

type DynamoDB interface {
	GetItem(ctx context.Context, params *dynamodb.GetItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.GetItemOutput, error)
	PutItem(ctx context.Context, params *dynamodb.PutItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.PutItemOutput, error)
	Scan(ctx context.Context, params *dynamodb.ScanInput, optFns ...func(*dynamodb.Options)) (*dynamodb.ScanOutput, error)
	UpdateItem(ctx context.Context, params *dynamodb.UpdateItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.UpdateItemOutput, error)
}

type Store struct {
	db    DynamoDB
	table string
}

func New(db DynamoDB, table string) *Store {
	return &Store{db: db, table: table}
}

func NewFromAWS(ctx context.Context, table string) (*Store, error) {
	cfg, err := awsconfig.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}
	return New(dynamodb.NewFromConfig(cfg), table), nil
}

func JobPK(id string) string     { return "JOB#" + id }
func MarketPK(id string) string  { return "MARKET#" + id }
func ServicePK(id string) string { return "SERVICE#" + id }

func metaKey(pk string) map[string]types.AttributeValue {
	return map[string]types.AttributeValue{
		"PK": &types.AttributeValueMemberS{Value: pk},
		"SK": &types.AttributeValueMemberS{Value: SortKeyMeta},
	}
}

type PublishedListings struct {
	Jobs     []JobItem
	Market   []MarketItem
	Services []ServiceItem
}

func (s *Store) ListPublishedListings(ctx context.Context) (PublishedListings, error) {
	var out PublishedListings
	var startKey map[string]types.AttributeValue

	for {
		res, err := s.db.Scan(ctx, &dynamodb.ScanInput{
			TableName:        &s.table,
			FilterExpression: new("SK = :meta AND #status = :published"),
			ExpressionAttributeNames: map[string]string{
				"#status": "status",
			},
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":meta":      &types.AttributeValueMemberS{Value: SortKeyMeta},
				":published": &types.AttributeValueMemberS{Value: StatusPublished},
			},
			ExclusiveStartKey: startKey,
		})
		if err != nil {
			return PublishedListings{}, fmt.Errorf("scan listings: %w", err)
		}

		for _, raw := range res.Items {
			entity, ok := raw["entityType"].(*types.AttributeValueMemberS)
			if !ok {
				continue
			}
			switch entity.Value {
			case EntityJob:
				var item JobItem
				if err := attributevalue.UnmarshalMap(raw, &item); err != nil {
					return PublishedListings{}, fmt.Errorf("unmarshal job: %w", err)
				}
				out.Jobs = append(out.Jobs, item)
			case EntityMarket:
				var item MarketItem
				if err := attributevalue.UnmarshalMap(raw, &item); err != nil {
					return PublishedListings{}, fmt.Errorf("unmarshal market: %w", err)
				}
				out.Market = append(out.Market, item)
			case EntityService:
				var item ServiceItem
				if err := attributevalue.UnmarshalMap(raw, &item); err != nil {
					return PublishedListings{}, fmt.Errorf("unmarshal service: %w", err)
				}
				out.Services = append(out.Services, item)
			}
		}

		if len(res.LastEvaluatedKey) == 0 {
			break
		}
		startKey = res.LastEvaluatedKey
	}

	return out, nil
}

func (s *Store) scanPublished(ctx context.Context, entity string, out any) error {
	res, err := s.db.Scan(ctx, &dynamodb.ScanInput{
		TableName:        &s.table,
		FilterExpression: new("SK = :meta AND #status = :published AND entityType = :entity"),
		ExpressionAttributeNames: map[string]string{
			"#status": "status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":meta":      &types.AttributeValueMemberS{Value: SortKeyMeta},
			":published": &types.AttributeValueMemberS{Value: StatusPublished},
			":entity":    &types.AttributeValueMemberS{Value: entity},
		},
	})
	if err != nil {
		return fmt.Errorf("scan %s: %w", entity, err)
	}
	if err := attributevalue.UnmarshalListOfMaps(res.Items, out); err != nil {
		return fmt.Errorf("unmarshal %s: %w", entity, err)
	}
	return nil
}

func (s *Store) getMeta(ctx context.Context, pk string, out any) error {
	res, err := s.db.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: &s.table,
		Key:       metaKey(pk),
	})
	if err != nil {
		return fmt.Errorf("get %s: %w", pk, err)
	}
	if res.Item == nil {
		return ErrNotFound
	}
	if err := attributevalue.UnmarshalMap(res.Item, out); err != nil {
		return fmt.Errorf("unmarshal %s: %w", pk, err)
	}
	return nil
}

func (s *Store) SetOrder(ctx context.Context, pk, orderID string, amount int64) error {
	_, err := s.db.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName:           &s.table,
		Key:                 metaKey(pk),
		UpdateExpression:    new("SET orderId = :orderId, amount = :amount"),
		ConditionExpression: new("attribute_exists(PK) AND #status = :pending AND attribute_not_exists(orderId)"),
		ExpressionAttributeNames: map[string]string{
			"#status": "status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":orderId": &types.AttributeValueMemberS{Value: orderID},
			":amount":  &types.AttributeValueMemberN{Value: strconv.FormatInt(amount, 10)},
			":pending": &types.AttributeValueMemberS{Value: StatusPending},
		},
	})
	return notPendingOr(err)
}

func (s *Store) Publish(ctx context.Context, pk, orderID, paymentKey string) error {
	_, err := s.db.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName:        &s.table,
		Key:              metaKey(pk),
		UpdateExpression: new("SET #status = :published, paymentKey = :paymentKey"),
		ExpressionAttributeNames: map[string]string{
			"#status": "status",
		},
		ConditionExpression: new("#status = :pending AND orderId = :orderId"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":published":  &types.AttributeValueMemberS{Value: StatusPublished},
			":pending":    &types.AttributeValueMemberS{Value: StatusPending},
			":orderId":    &types.AttributeValueMemberS{Value: orderID},
			":paymentKey": &types.AttributeValueMemberS{Value: paymentKey},
		},
	})
	return notPendingOr(err)
}

func notPendingOr(err error) error {
	var failed *types.ConditionalCheckFailedException
	if errors.As(err, &failed) {
		return ErrNotPending
	}
	return err
}
