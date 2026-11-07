package app

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"net/http"
	"time"
)

func (a *App) listService(w http.ResponseWriter, r *http.Request) {
	items, err := a.Store.ListPublishedService(r.Context())
	if err != nil {
		writeInternalError(w, "listService", err)
		return
	}

	services := make([]ServiceResponse, 0, len(items))
	for _, item := range items {
		service := toServiceResponse(item)
		service.Logo = a.mediaURL(service.Logo)
		services = append(services, service)
	}

	writeJSON(w, http.StatusOK, services)
}

func (a *App) createService(w http.ResponseWriter, r *http.Request) {
	var req CreateServiceRequest
	data := json.NewDecoder(r.Body)
	data.DisallowUnknownFields()
	if err := data.Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
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

	if req.Logo != "" {
		if err := a.checkPhoto(r.Context(), req.Logo); err != nil {
			if errors.Is(err, errBadPhoto) {
				writeValidationErrors(w, map[string]string{"logo": "Upload the photo again."})
				return
			}
			writeInternalError(w, "createService", err)
			return
		}
	}

	id := rand.Text()
	if err := a.Store.PutService(r.Context(), req.toServiceItem(id, time.Now())); err != nil {
		writeInternalError(w, "createService", err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}
