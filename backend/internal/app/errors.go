package app

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/dnlaxe/pyeonhee/backend/internal/app/botcheck"
)

func writeInternalError(w http.ResponseWriter, where string, err error) {
	if err != nil {
		log.Printf("%s: %v", where, err)
	} else {
		log.Printf("%s", where)
	}
	http.Error(w, "internal error", http.StatusInternalServerError)
}

func writeBotCheckError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, botcheck.ErrFailed):
		http.Error(w, "bot check failed", http.StatusUnauthorized)
	case errors.Is(err, botcheck.ErrNotConfigured):
		http.Error(w, "bot check is not configured", http.StatusServiceUnavailable)
	default:
		writeInternalError(w, "bot check", err)
	}
}

func writeValidationErrors(w http.ResponseWriter, errs map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusBadRequest)
	if err := json.NewEncoder(w).Encode(map[string]any{"errors": errs}); err != nil {
		log.Printf("write validation errors: %v", err)
	}
}
