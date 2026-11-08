package app

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/dnlaxe/pyeonhee/backend/internal/payment"
	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

const (
	jobPriceKRW      = 5000
	jobOrderName     = "pyeonhee job post"
	marketPriceKRW   = 5000
	marketOrderName  = "pyeonhee market post"
	servicePriceKRW  = 5000
	serviceOrderName = "pyeonhee service post"
)

type checkoutRequest struct {
	JobID     string `json:"jobId"`
	MarketID  string `json:"marketId"`
	ServiceID string `json:"serviceId"`
}

type checkoutResponse struct {
	OrderID   string `json:"orderId"`
	Amount    int64  `json:"amount"`
	OrderName string `json:"orderName"`
}

type payKind string

const (
	payJob     payKind = "job"
	payMarket  payKind = "market"
	payService payKind = "service"
)

func payTarget(jobID, marketID, serviceID string) (kind payKind, id string, ok bool) {
	if jobID != "" {
		kind, id, ok = payJob, jobID, true
	}
	if marketID != "" {
		if ok {
			return "", "", false
		}
		kind, id, ok = payMarket, marketID, true
	}
	if serviceID != "" {
		if ok {
			return "", "", false
		}
		kind, id, ok = payService, serviceID, true
	}
	return kind, id, ok
}

func (a *App) checkout(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<10)

	var req checkoutRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}
	kind, id, ok := payTarget(req.JobID, req.MarketID, req.ServiceID)
	if !ok {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	var amount int64
	var orderName string
	var err error
	orderID := rand.Text()
	switch kind {
	case payJob:
		amount, orderName = jobPriceKRW, jobOrderName
		err = a.Store.SetJobOrder(r.Context(), id, orderID, amount)
	case payMarket:
		amount, orderName = marketPriceKRW, marketOrderName
		err = a.Store.SetMarketOrder(r.Context(), id, orderID, amount)
	case payService:
		amount, orderName = servicePriceKRW, serviceOrderName
		err = a.Store.SetServiceOrder(r.Context(), id, orderID, amount)
	}
	if err != nil {
		if errors.Is(err, store.ErrNotPending) {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		writeInternalError(w, "checkout", err)
		return
	}

	writeJSON(w, http.StatusOK, checkoutResponse{
		OrderID:   orderID,
		Amount:    amount,
		OrderName: orderName,
	})
}

type confirmRequest struct {
	JobID      string `json:"jobId"`
	MarketID   string `json:"marketId"`
	ServiceID  string `json:"serviceId"`
	OrderID    string `json:"orderId"`
	PaymentKey string `json:"paymentKey"`
	Amount     int64  `json:"amount"`
}

type payListing struct {
	id      string
	status  string
	orderID string
	amount  int64
}

func (a *App) getPayListing(ctx context.Context, kind payKind, id string) (payListing, error) {
	switch kind {
	case payJob:
		item, err := a.Store.GetJob(ctx, id)
		if err != nil {
			return payListing{}, err
		}
		return payListing{id: item.ID, status: item.Status, orderID: item.OrderID, amount: item.Amount}, nil
	case payMarket:
		item, err := a.Store.GetMarket(ctx, id)
		if err != nil {
			return payListing{}, err
		}
		return payListing{id: item.ID, status: item.Status, orderID: item.OrderID, amount: item.Amount}, nil
	case payService:
		item, err := a.Store.GetService(ctx, id)
		if err != nil {
			return payListing{}, err
		}
		return payListing{id: item.ID, status: item.Status, orderID: item.OrderID, amount: item.Amount}, nil
	default:
		return payListing{}, store.ErrNotFound
	}
}

func (a *App) confirmPayment(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<10)

	var req confirmRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil || req.OrderID == "" || req.PaymentKey == "" {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}
	kind, id, ok := payTarget(req.JobID, req.MarketID, req.ServiceID)
	if !ok {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	listing, err := a.getPayListing(r.Context(), kind, id)
	if errors.Is(err, store.ErrNotFound) {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	if err != nil {
		writeInternalError(w, "confirm: get", err)
		return
	}

	if listing.status == store.StatusPublished && listing.orderID == req.OrderID {
		writePaymentConfirmed(w)
		return
	}
	if listing.status != store.StatusPending {
		http.Error(w, store.ErrNotPending.Error(), http.StatusConflict)
		return
	}
	if listing.orderID == "" || listing.orderID != req.OrderID || listing.amount != req.Amount {
		http.Error(w, "order does not match", http.StatusBadRequest)
		return
	}

	err = a.Payments.Confirm(r.Context(), payment.ConfirmRequest{
		PaymentKey: req.PaymentKey,
		OrderID:    listing.orderID,
		Amount:     listing.amount,
	})
	if errors.Is(err, payment.ErrDeclined) {
		http.Error(w, "payment declined", http.StatusPaymentRequired)
		return
	}
	if err != nil {
		writeInternalError(w, "confirm: provider", err)
		return
	}

	switch kind {
	case payJob:
		err = a.Store.PublishJob(r.Context(), listing.id, listing.orderID, req.PaymentKey)
	case payMarket:
		err = a.Store.PublishMarket(r.Context(), listing.id, listing.orderID, req.PaymentKey)
	case payService:
		err = a.Store.PublishService(r.Context(), listing.id, listing.orderID, req.PaymentKey)
	}
	if err != nil {
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
