package store

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type JobItem struct {
	PK             string   `dynamodbav:"PK"`
	SK             string   `dynamodbav:"SK"`
	EntityType     string   `dynamodbav:"entityType"`
	ID             string   `dynamodbav:"id"`
	Title          string   `dynamodbav:"title"`
	Location       string   `dynamodbav:"location"`
	EmploymentType string   `dynamodbav:"employmentType"`
	Track          string   `dynamodbav:"track"`
	Tags           []string `dynamodbav:"tags"`
	Area           string   `dynamodbav:"area"`
	Korean         string   `dynamodbav:"korean,omitempty"`
	Description    string   `dynamodbav:"description"`
	Logo           string   `dynamodbav:"logo,omitempty"`
	Pinned         bool     `dynamodbav:"pinned"`
	Status         string   `dynamodbav:"status"`
	CreatedAt      string   `dynamodbav:"createdAt"`
	PosterEmail    string   `dynamodbav:"posterEmail"`
	EmailOption    string   `dynamodbav:"emailOption"`
	OrderID        string   `dynamodbav:"orderId,omitempty"`
	Amount         int64    `dynamodbav:"amount,omitempty"`
	PaymentKey     string   `dynamodbav:"paymentKey,omitempty"`
}

func (s *Store) ListPublishedJob(ctx context.Context) ([]JobItem, error) {
	var items []JobItem
	if err := s.scanPublished(ctx, EntityJob, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func (s *Store) GetJob(ctx context.Context, id string) (JobItem, error) {
	var item JobItem
	err := s.getMeta(ctx, JobPK(id), &item)
	return item, err
}

func (s *Store) PutJob(ctx context.Context, item JobItem) error {
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		return fmt.Errorf("marshal job: %w", err)
	}
	if _, err := s.db.PutItem(ctx, &dynamodb.PutItemInput{
		TableName:           &s.table,
		Item:                av,
		ConditionExpression: new("attribute_not_exists(PK)"),
	}); err != nil {
		return fmt.Errorf("put job: %w", err)
	}
	return nil
}

// SetJobOrder returns ErrNotPending if the job is missing or not awaiting payment.
func (s *Store) SetJobOrder(ctx context.Context, jobID, orderID string, amount int64) error {
	_, err := s.db.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName:           &s.table,
		Key:                 metaKey(JobPK(jobID)),
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

// PublishJob returns ErrNotPending if the job is no longer pending or the order changed.
func (s *Store) PublishJob(ctx context.Context, jobID, orderID, paymentKey string) error {
	_, err := s.db.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName:           &s.table,
		Key:                 metaKey(JobPK(jobID)),
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

func notPendingOr(err error) error {
	var failed *types.ConditionalCheckFailedException
	if errors.As(err, &failed) {
		return ErrNotPending
	}
	return err
}
