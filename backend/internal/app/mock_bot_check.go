package app

import (
	"crypto/subtle"
	"encoding/json"
	"net/http"
)

func (a *App) mockBotCheck(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if a.MockBotCheckPassword == "" {
		http.Error(w, "mock bot check password is not configured", http.StatusServiceUnavailable)
		return
	}

	guess := []byte(body.Password)
	bytes := []byte(a.MockBotCheckPassword)
	if subtle.ConstantTimeCompare(guess, bytes) != 1 {
		http.Error(w, "incorrect password", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(struct {
		Success bool `json:"success"`
	}{Success: true}); err != nil {
		writeInternalError(w, "mock bot check fail", err)
	}
}
