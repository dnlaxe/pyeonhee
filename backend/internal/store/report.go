package store

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type ReportItem struct {
	PK            string `dynamodbav:"PK"`
	SK            string `dynamodbav:"SK"`
	EntityType    string `dynamodbav:"entityType"`
	ID            string `dynamodbav:"id"`
	ListingKind   string `dynamodbav:"listingKind"`
	ListingID     string `dynamodbav:"listingId"`
	ListingTitle  string `dynamodbav:"listingTitle"`
	ReporterEmail string `dynamodbav:"reporterEmail"`
	Message       string `dynamodbav:"message"`
	Status        string `dynamodbav:"status"`
	CreatedAt     string `dynamodbav:"createdAt"`
}

func (s *Store) PutReport(ctx context.Context, item ReportItem) error {
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		return fmt.Errorf("marshal report: %w", err)
	}
	if _, err := s.db.PutItem(ctx, &dynamodb.PutItemInput{
		TableName:           &s.table,
		Item:                av,
		ConditionExpression: new("attribute_not_exists(PK)"),
	}); err != nil {
		return fmt.Errorf("put report: %w", err)
	}
	return nil
}
