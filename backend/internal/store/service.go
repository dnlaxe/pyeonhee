package store

import (
	"context"
	"fmt"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type ServiceItem struct {
	PK         string   `dynamodbav:"PK"`
	SK         string   `dynamodbav:"SK"`
	EntityType string   `dynamodbav:"entityType"`
	ID         string   `dynamodbav:"id"`
	Company    string   `dynamodbav:"company"`
	Location   string   `dynamodbav:"location"`
	Logo       string   `dynamodbav:"logo"`
	Blurb      string   `dynamodbav:"blurb"`
	Contact    string   `dynamodbav:"contact"`
	Webpage    string   `dynamodbav:"webpage,omitempty"`
	Tags       []string `dynamodbav:"tags"`
	Status     string   `dynamodbav:"status"`
	CreatedAt  string   `dynamodbav:"createdAt"`
	OrderID    string   `dynamodbav:"orderId,omitempty"`
	Amount     int64    `dynamodbav:"amount,omitempty"`
	PaymentKey string   `dynamodbav:"paymentKey,omitempty"`
}

func (s *Store) ListPublishedService(ctx context.Context) ([]ServiceItem, error) {
	var items []ServiceItem
	if err := s.scanPublished(ctx, EntityService, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (s *Store) PutService(ctx context.Context, service ServiceItem) error {
	av, err := attributevalue.MarshalMap(service)
	if err != nil {
		return fmt.Errorf("marshal service: %w", err)
	}
	if _, err := s.db.PutItem(ctx, &dynamodb.PutItemInput{
		TableName:           &s.table,
		Item:                av,
		ConditionExpression: new("attribute_not_exists(PK)"),
	}); err != nil {
		return fmt.Errorf("put service: %w", err)
	}
	return nil
}

func (s *Store) GetService(ctx context.Context, id string) (ServiceItem, error) {
	var item ServiceItem
	err := s.getMeta(ctx, ServicePK(id), &item)
	return item, err
}

func (s *Store) SetServiceOrder(ctx context.Context, serviceID, orderID string, amount int64) error {
	_, err := s.db.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName:           &s.table,
		Key:                 metaKey(ServicePK(serviceID)),
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

func (s *Store) PublishService(ctx context.Context, serviceID, orderID, paymentKey string) error {
	_, err := s.db.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName:           &s.table,
		Key:                 metaKey(ServicePK(serviceID)),
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
