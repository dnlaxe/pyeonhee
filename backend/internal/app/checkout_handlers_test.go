package app

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/dnlaxe/pyeonhee/backend/internal/payment"
	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

func postCheckout(st *fakeStore, body string) *httptest.ResponseRecorder {
	a := &App{Store: st}
	req := httptest.NewRequest(http.MethodPost, "/payments/checkout", strings.NewReader(body))
	rec := httptest.NewRecorder()
	a.checkout(rec, req)
	return rec
}

func TestCheckoutSavesOrder(t *testing.T) {
	st := &fakeStore{}
	rec := postCheckout(st, `{"jobId":"JOB1"}`)

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

	if st.orderJobID != "JOB1" || st.orderAmount != jobPriceKRW {
		t.Fatalf("SetJobOrder(%q, _, %d)", st.orderJobID, st.orderAmount)
	}
	if st.orderID != resp.OrderID {
		t.Fatalf("saved orderId %q, returned %q", st.orderID, resp.OrderID)
	}
}

func TestCheckoutRejects(t *testing.T) {
	tests := []struct {
		name     string
		body     string
		orderErr error
		status   int
	}{
		{"missing jobId", `{}`, nil, http.StatusBadRequest},
		{"client sends amount", `{"jobId":"JOB1","amount":100}`, nil, http.StatusBadRequest},
		{"job not pending", `{"jobId":"JOB1"}`, store.ErrNotPending, http.StatusConflict},
		{"database error", `{"jobId":"JOB1"}`, errors.New("dynamo down"), http.StatusInternalServerError},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := postCheckout(&fakeStore{orderErr: tt.orderErr}, tt.body)
			if rec.Code != tt.status {
				t.Fatalf("status = %d, want %d, body = %q", rec.Code, tt.status, rec.Body.String())
			}
		})
	}
}

func storedJob(status, orderID string) *store.JobItem {
	return &store.JobItem{ID: "JOB1", Status: status, OrderID: orderID, Amount: jobPriceKRW}
}

func postConfirm(st *fakeStore, body string) *httptest.ResponseRecorder {
	a := &App{Store: st, Payments: payment.Mock{}}
	req := httptest.NewRequest(http.MethodPost, "/payments/confirm", strings.NewReader(body))
	rec := httptest.NewRecorder()
	a.confirmPayment(rec, req)
	return rec
}

const goodConfirm = `{"jobId":"JOB1","orderId":"ORDER1","paymentKey":"mock_abc","amount":5000}`

func TestConfirmPublishesJob(t *testing.T) {
	st := &fakeStore{job: storedJob(store.StatusPending, "ORDER1")}
	rec := postConfirm(st, goodConfirm)

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

func TestConfirmIsSafeToRepeat(t *testing.T) {
	st := &fakeStore{job: storedJob(store.StatusPublished, "ORDER1")}
	rec := postConfirm(st, goodConfirm)

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
			`{"jobId":"JOB1","orderId":"ORDER1","paymentKey":"mock_abc","amount":100}`, http.StatusBadRequest},
		{"declined", storedJob(store.StatusPending, "ORDER1"),
			`{"jobId":"JOB1","orderId":"ORDER1","paymentKey":"real_abc","amount":5000}`, http.StatusPaymentRequired},
		{"published by other order", storedJob(store.StatusPublished, "ORDER2"), goodConfirm, http.StatusConflict},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			st := &fakeStore{job: tt.job}
			rec := postConfirm(st, tt.body)
			if rec.Code != tt.status {
				t.Fatalf("status = %d, want %d, body = %q", rec.Code, tt.status, rec.Body.String())
			}
			if st.published {
				t.Fatal("job published on a rejected confirm")
			}
		})
	}
}
