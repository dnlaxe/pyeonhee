package app

import (
	"errors"
	"net/http"
	"sort"

	"github.com/go-chi/chi/v5"

	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

func (a *App) listMarket(w http.ResponseWriter, r *http.Request) {
	items, err := a.Store.ListPublishedMarket(r.Context())
	if err != nil {
		writeInternalError(w, "listMarket", err)
		return
	}

	markets := make([]MarketResponse, 0, len(items))
	for _, item := range items {
		market := toMarketResponse(item)
		market.Images = a.mediaURLs(market.Images)
		markets = append(markets, market)
	}

	sort.SliceStable(markets, func(i, j int) bool {
		if markets[i].Pinned != markets[j].Pinned {
			return markets[i].Pinned
		}
		return markets[i].CreatedAt > markets[j].CreatedAt
	})

	writeJSON(w, http.StatusOK, markets)
}

func (a *App) getMarket(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	item, err := a.Store.GetMarket(r.Context(), id)
	if errors.Is(err, store.ErrNotFound) || (err == nil && item.Status != store.StatusPublished) {
		http.Error(w, "market not found", http.StatusNotFound)
		return
	}
	if err != nil {
		writeInternalError(w, "getMarket", err)
		return
	}

	market := toMarketResponse(item)
	market.Images = a.mediaURLs(market.Images)
	writeJSON(w, http.StatusOK, market)
}
