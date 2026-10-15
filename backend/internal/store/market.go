package store

import "context"

type MarketItem struct {
	PK          string   `dynamodbav:"PK"`
	SK          string   `dynamodbav:"SK"`
	EntityType  string   `dynamodbav:"entityType"`
	ID          string   `dynamodbav:"id"`
	Title       string   `dynamodbav:"title"`
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
