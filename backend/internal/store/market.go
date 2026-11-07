package store

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
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
