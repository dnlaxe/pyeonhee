package app

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

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

func (a *App) createMarket(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxListingBodyBytes)

	var req CreateMarketRequest
	data := json.NewDecoder(r.Body)
	data.DisallowUnknownFields()
	if err := data.Decode(&req); err != nil {
		writeDecodeError(w, err)
		return
	}

	if err := a.BotCheck.Verify(r.Context(), req.Password); err != nil {
		writeBotCheckError(w, err)
		return
	}

	req.normalize()
	if errs := req.validate(); len(errs) > 0 {
		writeValidationErrors(w, errs)
		return
	}

	for _, img := range req.Images {
		if err := a.checkPhoto(r.Context(), img); err != nil {
			if errors.Is(err, errBadPhoto) {
				writeValidationErrors(w, map[string]string{"images": "Upload the photo again."})
				return
			}
			writeInternalError(w, "createMarket", err)
			return
		}
	}

	id := rand.Text()
	if err := a.Store.PutMarket(r.Context(), req.toMarketItem(id, time.Now())); err != nil {
		writeInternalError(w, "createMarket", err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}
