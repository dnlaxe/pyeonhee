package store

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
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
		return fmt.Errorf("put job error: %w", err)
	}
	return nil
}
