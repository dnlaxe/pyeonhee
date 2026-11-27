package app

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/dnlaxe/pyeonhee/backend/internal/mail"
	"github.com/dnlaxe/pyeonhee/backend/internal/payment"
	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

func postCheckout(st *fakeStore, photos PhotoStore, body string) *httptest.ResponseRecorder {
	a := &App{Store: st, Photos: photos}
	req := httptest.NewRequest(http.MethodPost, "/api/payments/checkout", strings.NewReader(body))
	rec := httptest.NewRecorder()
	a.checkout(rec, req)
	return rec
}

func TestCheckoutSavesOrder(t *testing.T) {
	st := &fakeStore{job: storedJob(store.StatusPending, "")}
	rec := postCheckout(st, nil, `{"kind":"job","id":"JOB1"}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	var resp checkoutResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatal(err)
	}
	if resp.OrderID == "" || resp.Amount != jobPriceKRW {
		t.Fatalf("resp = %+v", resp)
	}

	if st.orderJobID != store.JobPK("JOB1") || st.orderAmount != jobPriceKRW {
		t.Fatalf("SetOrder(%q, _, %d)", st.orderJobID, st.orderAmount)
	}
	if st.orderID != resp.OrderID {
		t.Fatalf("saved orderId %q, returned %q", st.orderID, resp.OrderID)
	}
}

func TestCheckoutVerifiesPhotos(t *testing.T) {
	jobWithLogo := storedJob(store.StatusPending, "")
	jobWithLogo.Logo = "media/logo.png"

	photos := &fakePhotoStore{}
	st := &fakeStore{job: jobWithLogo}
	rec := postCheckout(st, photos, `{"kind":"job","id":"JOB1"}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	if !slices.Equal(photos.checked, []string{"media/logo.png"}) {
		t.Fatalf("checked = %v", photos.checked)
	}

	badPhotos := &fakePhotoStore{checkErr: errBadPhoto}
	st2 := &fakeStore{job: jobWithLogo}
	rec2 := postCheckout(st2, badPhotos, `{"kind":"job","id":"JOB1"}`)
	if rec2.Code != http.StatusUnprocessableEntity {
		t.Fatalf("status = %d, want 422, body = %q", rec2.Code, rec2.Body.String())
	}
	if st2.orderID != "" {
		t.Fatalf("SetOrder should not run when photo is missing, got %q", st2.orderID)
	}
}

func TestCheckoutRejectsExpiredTTL(t *testing.T) {
	expired := storedJob(store.StatusPending, "")
	expired.TTL = time.Now().Add(-time.Minute).Unix()
	st := &fakeStore{job: expired}

	rec := postCheckout(st, nil, `{"kind":"job","id":"JOB1"}`)
	if rec.Code != http.StatusGone {
		t.Fatalf("status = %d, want 410, body = %q", rec.Code, rec.Body.String())
	}
	if st.orderID != "" {
		t.Fatalf("SetOrder should not run on expired draft, got %q", st.orderID)
	}
}

func TestCheckoutRejects(t *testing.T) {
	tests := []struct {
		name     string
		job      *store.JobItem
		body     string
		orderErr error
		status   int
	}{
		{"missing id", storedJob(store.StatusPending, ""), `{}`, nil, http.StatusBadRequest},
		{"client sends amount", storedJob(store.StatusPending, ""), `{"kind":"job","id":"JOB1","amount":100}`, nil, http.StatusBadRequest},
		{"job missing", nil, `{"kind":"job","id":"JOB1"}`, nil, http.StatusNotFound},
		{"job already published", storedJob(store.StatusPublished, "ORDER1"), `{"kind":"job","id":"JOB1"}`, nil, http.StatusConflict},
		{"job not pending on update", storedJob(store.StatusPending, ""), `{"kind":"job","id":"JOB1"}`, store.ErrNotPending, http.StatusConflict},
		{"database error", storedJob(store.StatusPending, ""), `{"kind":"job","id":"JOB1"}`, errors.New("dynamo down"), http.StatusInternalServerError},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := postCheckout(&fakeStore{job: tt.job, orderErr: tt.orderErr}, nil, tt.body)
			if rec.Code != tt.status {
				t.Fatalf("status = %d, want %d, body = %q", rec.Code, tt.status, rec.Body.String())
			}
		})
	}
}

func storedJob(status, orderID string) *store.JobItem {
	return &store.JobItem{ID: "JOB1", Status: status, OrderID: orderID, Amount: jobPriceKRW}
}

func postConfirm(st *fakeStore, photos PhotoStore, body string) *httptest.ResponseRecorder {
	a := &App{Store: st, Photos: photos, Payments: payment.Mock{}, Mail: mail.Nop{}}
	req := httptest.NewRequest(http.MethodPost, "/api/payments/confirm", strings.NewReader(body))
	rec := httptest.NewRecorder()
	a.confirmPayment(rec, req)
	return rec
}

const goodConfirm = `{"kind":"job","id":"JOB1","orderId":"ORDER1","paymentKey":"mock_abc","amount":5000}`

func TestConfirmPublishesJob(t *testing.T) {
	st := &fakeStore{job: storedJob(store.StatusPending, "ORDER1")}
	rec := postConfirm(st, nil, goodConfirm)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	if !st.published {
		t.Fatal("job not published")
	}
	if st.publishedKey != "mock_abc" {
		t.Fatalf("paymentKey = %q", st.publishedKey)
	}
}

func TestConfirmPromotesPhotos(t *testing.T) {
	job := storedJob(store.StatusPending, "ORDER1")
	job.Logo = "media/logo.png"
	st := &fakeStore{job: job}
	photos := &fakePhotoStore{}

	rec := postConfirm(st, photos, goodConfirm)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	if !slices.Equal(photos.promoted, []string{"media/logo.png"}) {
		t.Fatalf("promoted = %v", photos.promoted)
	}
	if !st.published {
		t.Fatal("job not published")
	}
}

func TestConfirmIsSafeToRepeat(t *testing.T) {
	st := &fakeStore{job: storedJob(store.StatusPublished, "ORDER1")}
	rec := postConfirm(st, nil, goodConfirm)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	if st.published {
		t.Fatal("already published job was updated again")
	}
}

func TestConfirmRejects(t *testing.T) {
	tests := []struct {
		name   string
		job    *store.JobItem
		body   string
		status int
	}{
		{"job missing", nil, goodConfirm, http.StatusNotFound},
		{"no checkout yet", storedJob(store.StatusPending, ""), goodConfirm, http.StatusBadRequest},
		{"old order id", storedJob(store.StatusPending, "ORDER2"), goodConfirm, http.StatusBadRequest},
		{"tampered amount", storedJob(store.StatusPending, "ORDER1"),
			`{"kind":"job","id":"JOB1","orderId":"ORDER1","paymentKey":"mock_abc","amount":100}`, http.StatusBadRequest},
		{"declined", storedJob(store.StatusPending, "ORDER1"),
			`{"kind":"job","id":"JOB1","orderId":"ORDER1","paymentKey":"real_abc","amount":5000}`, http.StatusPaymentRequired},
		{"published by other order", storedJob(store.StatusPublished, "ORDER2"), goodConfirm, http.StatusConflict},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			st := &fakeStore{job: tt.job}
			rec := postConfirm(st, nil, tt.body)
			if rec.Code != tt.status {
				t.Fatalf("status = %d, want %d, body = %q", rec.Code, tt.status, rec.Body.String())
			}
			if st.published {
				t.Fatal("job published on a rejected confirm")
			}
		})
	}
}
