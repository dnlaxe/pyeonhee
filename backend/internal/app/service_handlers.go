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

func (a *App) getService(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	item, err := a.Store.GetService(r.Context(), id)
	if errors.Is(err, store.ErrNotFound) || (err == nil && item.Status != store.StatusPublished) {
		http.Error(w, "service not found", http.StatusNotFound)
		return
	}
	if err != nil {
		writeInternalError(w, "getService", err)
		return
	}

	service := toServiceResponse(item)
	service.Logo = a.mediaURL(service.Logo)
	writeJSON(w, http.StatusOK, service)
}

func (a *App) createService(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxListingBodyBytes)

	var req CreateServiceRequest
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

	var specs []PhotoSpec
	if req.Logo != nil {
		specs = []PhotoSpec{*req.Logo}
	}
	keys, uploads, err := a.presignPhotos(r.Context(), specs)
	if err != nil {
		writeInternalError(w, "createService", err)
		return
	}
	var logo string
	if len(keys) == 1 {
		logo = keys[0]
	}

	id := rand.Text()
	if err := a.Store.PutService(r.Context(), req.toServiceItem(id, logo, time.Now())); err != nil {
		writeInternalError(w, "createService", err)
		return
	}

	writeJSON(w, http.StatusCreated, createListingResponse{ID: id, Uploads: uploads})
}
