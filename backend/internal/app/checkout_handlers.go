package app

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/dnlaxe/pyeonhee/backend/internal/payment"
	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

const (
	jobPriceKRW  = 5000
	jobOrderName = "pyeonhee job post"
)

type checkoutRequest struct {
	JobID string `json:"jobId"`
}

type checkoutResponse struct {
	OrderID   string `json:"orderId"`
	Amount    int64  `json:"amount"`
	OrderName string `json:"orderName"`
}

func (a *App) checkout(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<10)

	var req checkoutRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil || req.JobID == "" {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	orderID := rand.Text()
	if err := a.Store.SetJobOrder(r.Context(), req.JobID, orderID, jobPriceKRW); err != nil {
		if errors.Is(err, store.ErrNotPending) {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		writeInternalError(w, "checkout", err)
		return
	}

	writeJSON(w, http.StatusOK, checkoutResponse{
		OrderID:   orderID,
		Amount:    jobPriceKRW,
		OrderName: jobOrderName,
	})
}

type confirmRequest struct {
	JobID      string `json:"jobId"`
	OrderID    string `json:"orderId"`
	PaymentKey string `json:"paymentKey"`
	Amount     int64  `json:"amount"`
}

func (a *App) confirmPayment(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<10)

	var req confirmRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil || req.JobID == "" || req.OrderID == "" || req.PaymentKey == "" {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	job, err := a.Store.GetJob(r.Context(), req.JobID)
	if errors.Is(err, store.ErrNotFound) {
		http.Error(w, "job not found", http.StatusNotFound)
		return
	}
	if err != nil {
		writeInternalError(w, "confirm: get job", err)
		return
	}

	if job.Status == store.StatusPublished && job.OrderID == req.OrderID {
		writePaymentConfirmed(w)
		return
	}
	if job.Status != store.StatusPending {
		http.Error(w, store.ErrNotPending.Error(), http.StatusConflict)
		return
	}
	if job.OrderID == "" || job.OrderID != req.OrderID || job.Amount != req.Amount {
		http.Error(w, "order does not match", http.StatusBadRequest)
		return
	}

	err = a.Payments.Confirm(r.Context(), payment.ConfirmRequest{
		PaymentKey: req.PaymentKey,
		OrderID:    job.OrderID,
		Amount:     job.Amount,
	})
	if errors.Is(err, payment.ErrDeclined) {
		http.Error(w, "payment declined", http.StatusPaymentRequired)
		return
	}
	if err != nil {
		writeInternalError(w, "confirm: provider", err)
		return
	}

	if err := a.Store.PublishJob(r.Context(), job.ID, job.OrderID, req.PaymentKey); err != nil {
		if errors.Is(err, store.ErrNotPending) {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		writeInternalError(w, "confirm: publish", err)
		return
	}

	writePaymentConfirmed(w)
}

func writePaymentConfirmed(w http.ResponseWriter) {
	writeJSON(w, http.StatusOK, map[string]string{"status": store.StatusPublished})
}
