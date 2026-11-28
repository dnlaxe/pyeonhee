package app

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

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
	var pk string
	switch kind {
	case payJob:
		amount, orderName, pk = jobPriceKRW, jobOrderName, store.JobPK(id)
	case payMarket:
		amount, orderName, pk = marketPriceKRW, marketOrderName, store.MarketPK(id)
	case payService:
		amount, orderName, pk = servicePriceKRW, serviceOrderName, store.ServicePK(id)
	default:
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	listing, err := a.getPayListing(r.Context(), kind, id)
	if errors.Is(err, store.ErrNotFound) {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	if err != nil {
		writeInternalError(w, "checkout: get", err)
		return
	}
	if listing.status != store.StatusPending {
		http.Error(w, store.ErrNotPending.Error(), http.StatusConflict)
		return
	}
	if listing.ttl > 0 && time.Now().Unix() > listing.ttl {
		http.Error(w, "listing draft expired", http.StatusGone)
		return
	}
	if len(listing.photos) > 0 {
		if a.Photos == nil {
			writeInternalError(w, "checkout", errors.New("UPLOADS_BUCKET not set"))
			return
		}
		for _, key := range listing.photos {
			if err := a.Photos.CheckUpload(r.Context(), key); err != nil {
				if errors.Is(err, errBadPhoto) {
					http.Error(w, "photo upload missing", http.StatusUnprocessableEntity)
					return
				}
				writeInternalError(w, "checkout: photo", err)
				return
			}
		}
	}

	orderID := rand.Text()
	err = a.Store.SetOrder(r.Context(), pk, listing.orderID, orderID, amount)
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
	email   string
	title   string
	photos  []string
	ttl     int64
}

func (a *App) getPayListing(ctx context.Context, kind, id string) (payListing, error) {
	switch kind {
	case payJob:
		item, err := a.Store.GetJob(ctx, id)
		if err != nil {
			return payListing{}, err
		}
		var photos []string
		if item.Logo != "" {
			photos = []string{item.Logo}
		}
		return payListing{id: item.ID, status: item.Status, orderID: item.OrderID, amount: item.Amount, email: item.PosterEmail, title: item.Title, photos: photos, ttl: item.TTL}, nil
	case payMarket:
		item, err := a.Store.GetMarket(ctx, id)
		if err != nil {
			return payListing{}, err
		}
		return payListing{id: item.ID, status: item.Status, orderID: item.OrderID, amount: item.Amount, email: item.PosterEmail, title: item.Title, photos: item.Images, ttl: item.TTL}, nil
	case payService:
		item, err := a.Store.GetService(ctx, id)
		if err != nil {
			return payListing{}, err
		}
		var photos []string
		if item.Logo != "" {
			photos = []string{item.Logo}
		}
		return payListing{id: item.ID, status: item.Status, orderID: item.OrderID, amount: item.Amount, email: item.Contact, title: item.Company, photos: photos, ttl: item.TTL}, nil
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

	if len(listing.photos) > 0 {
		if a.Photos == nil {
			writeInternalError(w, "confirm", errors.New("UPLOADS_BUCKET not set"))
			return
		}
		for _, key := range listing.photos {
			if err := a.Photos.Promote(r.Context(), key); err != nil {
				writeInternalError(w, "confirm: promote photo", err)
				return
			}
		}
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

	base := strings.TrimRight(a.MediaBaseURL, "/")
	var link string
	switch kind {
	case payJob:
		link = base + "/jobs/" + listing.id
	case payMarket:
		link = base + "/market/" + listing.id
	case payService:
		link = base + "/services/" + listing.id
	default:
		link = base
	}
	if err := a.Mail.SendPublished(r.Context(), listing.email, listing.title, link); err != nil {
		log.Printf("mail.SendPublished failed: %v", err)
	}

	writePaymentConfirmed(w)
}

func writePaymentConfirmed(w http.ResponseWriter) {
	writeJSON(w, http.StatusOK, map[string]string{"status": store.StatusPublished})
}
