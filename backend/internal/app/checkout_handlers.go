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
	Kind string `json:"kind"`
	ID   string `json:"id"`
}

type checkoutResponse struct {
	OrderID   string `json:"orderId"`
	Amount    int64  `json:"amount"`
	OrderName string `json:"orderName"`
}

const (
	payJob     = "job"
	payMarket  = "market"
	payService = "service"
)

func (a *App) checkout(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<10)

	var req checkoutRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil || req.ID == "" {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}
	kind := req.Kind
	id := req.ID

	var amount int64
	var orderName string
	var err error

	orderID := rand.Text()

	switch kind {
	case payJob:
		amount, orderName = jobPriceKRW, jobOrderName
		err = a.Store.SetOrder(r.Context(), store.JobPK(id), orderID, amount)
	case payMarket:
		amount, orderName = marketPriceKRW, marketOrderName
		err = a.Store.SetOrder(r.Context(), store.MarketPK(id), orderID, amount)
	case payService:
		amount, orderName = servicePriceKRW, serviceOrderName
		err = a.Store.SetOrder(r.Context(), store.ServicePK(id), orderID, amount)
	default:
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
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
	Kind       string `json:"kind"`
	ID         string `json:"id"`
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

func (a *App) getPayListing(ctx context.Context, kind, id string) (payListing, error) {
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
	if err := dec.Decode(&req); err != nil || req.OrderID == "" || req.PaymentKey == "" || req.ID == "" {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}
	kind := req.Kind
	switch kind {
	case payJob, payMarket, payService:
	default:
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}
	id := req.ID

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
	if err != nil && !errors.Is(err, payment.ErrAlreadyConfirmed) {
		writeInternalError(w, "confirm: provider", err)
		return
	}

	switch kind {
	case payJob:
		err = a.Store.Publish(r.Context(), store.JobPK(listing.id), listing.orderID, req.PaymentKey)
	case payMarket:
		err = a.Store.Publish(r.Context(), store.MarketPK(listing.id), listing.orderID, req.PaymentKey)
	case payService:
		err = a.Store.Publish(r.Context(), store.ServicePK(listing.id), listing.orderID, req.PaymentKey)
	default:
		err = errors.New("unknown pay kind")
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
