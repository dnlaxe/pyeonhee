package store

import (
	"context"
	"fmt"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type MarketItem struct {
	PK          string   `dynamodbav:"PK"`
	SK          string   `dynamodbav:"SK"`
	EntityType  string   `dynamodbav:"entityType"`
	ID          string   `dynamodbav:"id"`
	Title       string   `dynamodbav:"title"`
	Location    string   `dynamodbav:"location"`
	Price       string   `dynamodbav:"price"`
	Description string   `dynamodbav:"description"`
	Images      []string `dynamodbav:"images"`
	Tags        []string `dynamodbav:"tags"`
	PosterEmail string   `dynamodbav:"posterEmail"`
	EmailOption string   `dynamodbav:"emailOption"`
	Pinned      bool     `dynamodbav:"pinned"`
	Status      string   `dynamodbav:"status"`
	CreatedAt   string   `dynamodbav:"createdAt"`
	OrderID     string   `dynamodbav:"orderId,omitempty"`
	Amount      int64    `dynamodbav:"amount,omitempty"`
	PaymentKey  string   `dynamodbav:"paymentKey,omitempty"`
}

func (s *Store) ListPublishedMarket(ctx context.Context) ([]MarketItem, error) {
	var items []MarketItem
	if err := s.scanPublished(ctx, EntityMarket, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (s *Store) GetMarket(ctx context.Context, id string) (MarketItem, error) {
	var item MarketItem
	err := s.getMeta(ctx, MarketPK(id), &item)
	return item, err
}

func (s *Store) PutMarket(ctx context.Context, item MarketItem) error {
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		return fmt.Errorf("marshal item: %w", err)
	}
	if _, err := s.db.PutItem(ctx, &dynamodb.PutItemInput{
		TableName:           &s.table,
		Item:                av,
		ConditionExpression: new("attribute_not_exists(PK)"),
	}); err != nil {
		return fmt.Errorf("put item error: %w", err)
	}
	return nil
}

func (s *Store) SetMarketOrder(ctx context.Context, marketID, orderID string, amount int64) error {
	_, err := s.db.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName:           &s.table,
		Key:                 metaKey(MarketPK(marketID)),
		UpdateExpression:    new("SET orderId = :orderId, amount = :amount"),
		ConditionExpression: new("attribute_exists(PK) AND #status = :pending"),
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

func (s *Store) PublishMarket(ctx context.Context, marketID, orderID, paymentKey string) error {
	_, err := s.db.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName:           &s.table,
		Key:                 metaKey(MarketPK(marketID)),
		UpdateExpression:    new("SET #status = :published, paymentKey = :paymentKey"),
		ConditionExpression: new("#status = :pending AND orderId = :orderId"),
		ExpressionAttributeNames: map[string]string{
			"#status": "status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":published":  &types.AttributeValueMemberS{Value: StatusPublished},
			":pending":    &types.AttributeValueMemberS{Value: StatusPending},
			":orderId":    &types.AttributeValueMemberS{Value: orderID},
			":paymentKey": &types.AttributeValueMemberS{Value: paymentKey},
		},
	})
	return notPendingOr(err)
}
