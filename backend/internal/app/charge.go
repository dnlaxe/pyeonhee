package app

import (
	"encoding/json"
	"net/http"

	"github.com/dnlaxe/pyeonhee/backend/internal/payment"
)

func (a *App) charge(w http.ResponseWriter, r *http.Request) {
	var req payment.ChargeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	result, err := a.Payments.Charge(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		writeInternalError(w, "charge: encode", err)
	}

}
