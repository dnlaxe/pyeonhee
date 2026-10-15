package app

import "github.com/dnlaxe/pyeonhee/backend/internal/store"

type MarketResponse struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Images      []string `json:"images"`
	Tags        []string `json:"tags"`
	Email       string   `json:"email,omitempty"`
	Pinned      bool     `json:"pinned"`
	Status      string   `json:"status"`
	CreatedAt   string   `json:"createdAt"`
}

func toMarketResponse(item store.MarketItem) MarketResponse {
	images := item.Images
	if images == nil {
		images = []string{}
	}
	tags := item.Tags
	if tags == nil {
		tags = []string{}
	}
	market := MarketResponse{
		ID:          item.ID,
		Title:       item.Title,
		Description: item.Description,
		Images:      images,
		Tags:        tags,
		Pinned:      item.Pinned,
		Status:      item.Status,
		CreatedAt:   item.CreatedAt,
	}
	if item.EmailOption == "show" {
		market.Email = item.PosterEmail
	}
	return market
}
