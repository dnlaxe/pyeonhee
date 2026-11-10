package app

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

type contactRequest struct {
	Kind     string `json:"kind"`
	ID       string `json:"id"`
	Email    string `json:"email"`
	Message  string `json:"message"`
	Password string `json:"password"`
}

func (a *App) contact(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<16)

	var req contactRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if err := a.BotCheck.Verify(r.Context(), req.Password); err != nil {
		writeBotCheckError(w, err)
		return
	}

	req.Email = strings.TrimSpace(req.Email)
	req.Message = strings.TrimSpace(req.Message)
	errs := map[string]string{}
	if req.Message == "" {
		errs["email"] = "Enter an email address"
	}
	if req.Message == "" {
		errs["message"] = "Enter a message"
	}
	if req.ID == "" {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if len(errs) > 0 {
		writeValidationErrors(w, errs)
		return
	}

	var (
		posterEmail string
		title       string
		linkPath    string
		status      string
		emailOption string
		err         error
	)

	switch req.Kind {
	case "job":
		item, e := a.Store.GetJob(r.Context(), req.ID)
		err = e
		posterEmail, title, status, emailOption = item.PosterEmail, item.Title, item.Status, item.EmailOption
		linkPath = "/jobs/" + item.ID
	case "market":
		item, e := a.Store.GetMarket(r.Context(), req.ID)
		err = e
		posterEmail, title, status, emailOption = item.PosterEmail, item.Title, item.Status, item.EmailOption
		linkPath = "/market/" + item.ID
	default:
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if errors.Is(err, store.ErrNotFound) {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	if err != nil {
		writeInternalError(w, "contact: get", err)
		return
	}
	if status != store.StatusPublished {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	if emailOption != "hide" {
		http.Error(w, "contact not available", http.StatusConflict)
		return
	}

	base := strings.TrimRight(a.MediaBaseURL, "/")
	link := base + linkPath

	if err := a.Mail.SendContact(r.Context(), posterEmail, req.Email, title, link, req.Message); err != nil {
		writeInternalError(w, "contact: send", err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"status": "sent"})
}
