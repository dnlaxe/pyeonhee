package app

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

type reportRequest struct {
	Kind     string `json:"kind"`
	ID       string `json:"id"`
	Email    string `json:"email"`
	Message  string `json:"message"`
	Password string `json:"password"`
}

func (a *App) report(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxListingBodyBytes)

	var req reportRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		writeDecodeError(w, err)
		return
	}

	if err := a.BotCheck.Verify(r.Context(), req.Password); err != nil {
		writeBotCheckError(w, err)
		return
	}

	req.Email = strings.TrimSpace(req.Email)
	req.Message = strings.TrimSpace(req.Message)
	errs := map[string]string{}
	if req.Email == "" {
		errs["email"] = "Enter an email address."
	} else if utf8.RuneCountInString(req.Email) > maxEmailLength {
		errs["email"] = "Shorten the email address."
	} else if !emailPattern.MatchString(req.Email) {
		errs["email"] = "Enter a full email address, like name@example.com."
	}
	msgLen := utf8.RuneCountInString(req.Message)
	switch {
	case msgLen == 0:
		errs["message"] = "Enter a message."
	case msgLen < minShortMessageLength:
		errs["message"] = "Make the message a little longer."
	case msgLen > maxShortMessageLength:
		errs["message"] = "Shorten the message."
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
		title  string
		status string
		err    error
	)

	switch req.Kind {
	case store.EntityJob:
		item, e := a.Store.GetJob(r.Context(), req.ID)
		err = e
		title, status = item.Title, item.Status
	case store.EntityMarket:
		item, e := a.Store.GetMarket(r.Context(), req.ID)
		err = e
		title, status = item.Title, item.Status
	case store.EntityService:
		item, e := a.Store.GetService(r.Context(), req.ID)
		err = e
		title, status = item.Company, item.Status
	default:
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if errors.Is(err, store.ErrNotFound) {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	if err != nil {
		writeInternalError(w, "report: get", err)
		return
	}
	if status != store.StatusPublished {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	id := rand.Text()
	now := time.Now().UTC().Format(time.RFC3339)
	item := store.ReportItem{
		PK:            store.ReportPartitionKey,
		SK:            store.ReportSK(now, id),
		EntityType:    store.EntityReport,
		ID:            id,
		ListingKind:   req.Kind,
		ListingID:     req.ID,
		ListingTitle:  title,
		ReporterEmail: req.Email,
		Message:       req.Message,
		Status:        store.ReportStatusOpen,
		CreatedAt:     now,
	}

	if err := a.Store.PutReport(r.Context(), item); err != nil {
		writeInternalError(w, "report: put", err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{"id": id, "status": "received"})
}
