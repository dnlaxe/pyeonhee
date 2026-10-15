package store

import "context"

type ServiceItem struct {
	PK         string   `dynamodbav:"PK"`
	SK         string   `dynamodbav:"SK"`
	EntityType string   `dynamodbav:"entityType"`
	ID         string   `dynamodbav:"id"`
	Company    string   `dynamodbav:"company"`
	Location   string   `dynamodbav:"location"`
	Logo       string   `dynamodbav:"logo"` // image URL for now
	Blurb      string   `dynamodbav:"blurb"`
	Contact    string   `dynamodbav:"contact"`
	Webpage    string   `dynamodbav:"webpage,omitempty"`
	Tags       []string `dynamodbav:"tags"`
	Status     string   `dynamodbav:"status"`
	CreatedAt  string   `dynamodbav:"createdAt"`
}

func (s *Store) ListPublishedService(ctx context.Context) ([]ServiceItem, error) {
	var items []ServiceItem
	if err := s.scanPublished(ctx, EntityService, &items); err != nil {
		return nil, err
	}
	return items, nil
}
