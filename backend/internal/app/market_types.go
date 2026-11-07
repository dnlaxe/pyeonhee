package app

import (
	"time"

	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

type MarketResponse struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Location    string   `json:"location"`
	Price       string   `json:"price"`
	Description string   `json:"description"`
	Images      []string `json:"images"`
	Tags        []string `json:"tags"`
	Email       string   `json:"email,omitempty"`
	Pinned      bool     `json:"pinned"`
	Status      string   `json:"status"`
	CreatedAt   string   `json:"createdAt"`
}

type CreateMarketRequest struct {
	Email       string   `json:"email"`
	EmailOption string   `json:"emailOption"`
	Title       string   `json:"title"`
	Location    string   `json:"location"`
	ListingType string   `json:"listingType"`
	Category    string   `json:"category"`
	Price       string   `json:"price"`
	Description string   `json:"description"`
	Images      []string `json:"images,omitempty"`
	Pinned      bool     `json:"pinned"`
	Password    string   `json:"password"`
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
		Location:    item.Location,
		Price:       item.Price,
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

func (r CreateMarketRequest) toMarketItem(id string, now time.Time) store.MarketItem {
	return store.MarketItem{
		PK:          store.MarketPK(id),
		SK:          store.SortKeyMeta,
		EntityType:  store.EntityMarket,
		ID:          id,
		Title:       r.Title,
		Location:    r.Location,
		Price:       r.Price,
		Description: r.Description,
		Images:      r.Images,
		Tags:        []string{r.ListingType, r.Category},
		PosterEmail: r.Email,
		EmailOption: r.EmailOption,
		Pinned:      r.Pinned,
		Status:      store.StatusPending,
		CreatedAt:   now.UTC().Format(time.RFC3339),
	}
}
