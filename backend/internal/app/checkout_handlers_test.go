package app

import (
	"encoding/json"
	"errors"
	"fmt"
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

	if st.orderJobID != store.JobPK("JOB1") || st.orderPrevID != "" || st.orderAmount != jobPriceKRW {
		t.Fatalf("SetOrder(%q, %q, _, %d)", st.orderJobID, st.orderPrevID, st.orderAmount)
	}
	if st.orderID != resp.OrderID {
		t.Fatalf("saved orderId %q, returned %q", st.orderID, resp.OrderID)
	}
}

func TestCheckoutRetryReplacesPendingOrder(t *testing.T) {
	tests := []struct {
		name   string
		st     *fakeStore
		body   string
		wantPK string
	}{
		{
			name:   "job",
			st:     &fakeStore{job: storedJob(store.StatusPending, "ORDER1")},
			body:   `{"kind":"job","id":"JOB1"}`,
			wantPK: store.JobPK("JOB1"),
		},
		{
			name:   "market",
			st:     &fakeStore{market: &store.MarketItem{ID: "M1", Status: store.StatusPending, OrderID: "ORDER1", Amount: marketPriceKRW}},
			body:   `{"kind":"market","id":"M1"}`,
			wantPK: store.MarketPK("M1"),
		},
		{
			name:   "service",
			st:     &fakeStore{service: &store.ServiceItem{ID: "S1", Status: store.StatusPending, OrderID: "ORDER1", Amount: servicePriceKRW}},
			body:   `{"kind":"service","id":"S1"}`,
			wantPK: store.ServicePK("S1"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := postCheckout(tt.st, nil, tt.body)
			if rec.Code != http.StatusOK {
				t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
			}
			var resp checkoutResponse
			if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
				t.Fatal(err)
			}
			if resp.OrderID == "" || resp.OrderID == "ORDER1" {
				t.Fatalf("expected new orderId, got %q", resp.OrderID)
			}
			if tt.st.orderJobID != tt.wantPK || tt.st.orderPrevID != "ORDER1" || tt.st.orderID != resp.OrderID {
				t.Fatalf("SetOrder(%q, %q, %q), want pk=%q prev=ORDER1 order=%q",
					tt.st.orderJobID, tt.st.orderPrevID, tt.st.orderID, tt.wantPK, resp.OrderID)
			}
		})
	}
}

func TestCheckoutMultipleRetriesAndConfirmFlow(t *testing.T) {
	st := &fakeStore{job: storedJob(store.StatusPending, "")}

	decodeOrder := func(rec *httptest.ResponseRecorder) checkoutResponse {
		t.Helper()
		if rec.Code != http.StatusOK {
			t.Fatalf("checkout status = %d body = %q", rec.Code, rec.Body.String())
		}
		var resp checkoutResponse
		if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
			t.Fatal(err)
		}
		return resp
	}
	confirmBody := func(orderID, paymentKey string, amount int64) string {
		return fmt.Sprintf(`{"kind":"job","id":"JOB1","orderId":%q,"paymentKey":%q,"amount":%d}`, orderID, paymentKey, amount)
	}

	// 1st checkout -> declined confirm
	order1 := decodeOrder(postCheckout(st, nil, `{"kind":"job","id":"JOB1"}`))
	if rec := postConfirm(st, nil, confirmBody(order1.OrderID, "declined_1", order1.Amount)); rec.Code != http.StatusPaymentRequired {
		t.Fatalf("decline status = %d, want 402", rec.Code)
	}

	// 1st retry -> 2nd retry (e.g. cancelled)
	order2 := decodeOrder(postCheckout(st, nil, `{"kind":"job","id":"JOB1"}`))
	if order2.OrderID == order1.OrderID || st.orderPrevID != order1.OrderID {
		t.Fatalf("retry 1: order2=%q prev=%q, want != %q and prev=%q", order2.OrderID, st.orderPrevID, order1.OrderID, order1.OrderID)
	}
	order3 := decodeOrder(postCheckout(st, nil, `{"kind":"job","id":"JOB1"}`))
	if order3.OrderID == order2.OrderID || order3.OrderID == order1.OrderID || st.orderPrevID != order2.OrderID {
		t.Fatalf("retry 2: order3=%q prev=%q", order3.OrderID, st.orderPrevID)
	}

	// Stale orders are rejected before publish
	for _, stale := range []checkoutResponse{order1, order2} {
		if rec := postConfirm(st, nil, confirmBody(stale.OrderID, "mock_stale", stale.Amount)); rec.Code != http.StatusBadRequest {
			t.Fatalf("stale confirm (%q) status = %d, want 400", stale.OrderID, rec.Code)
		}
	}

	// Latest order succeeds and publishes
	if rec := postConfirm(st, nil, confirmBody(order3.OrderID, "mock_ok", order3.Amount)); rec.Code != http.StatusOK {
		t.Fatalf("confirm order3 status = %d body = %q", rec.Code, rec.Body.String())
	}
	if !st.published || st.job.Status != store.StatusPublished {
		t.Fatalf("expected published job, got published=%v status=%q", st.published, st.job.Status)
	}

	// Post-publish: retry blocked, winning confirm idempotent, stale confirm conflicted
	if rec := postCheckout(st, nil, `{"kind":"job","id":"JOB1"}`); rec.Code != http.StatusConflict {
		t.Fatalf("post-publish checkout status = %d, want 409", rec.Code)
	}
	if rec := postConfirm(st, nil, confirmBody(order3.OrderID, "mock_ok", order3.Amount)); rec.Code != http.StatusOK {
		t.Fatalf("repeat confirm order3 status = %d, want 200", rec.Code)
	}
	if rec := postConfirm(st, nil, confirmBody(order1.OrderID, "mock_stale", order1.Amount)); rec.Code != http.StatusConflict {
		t.Fatalf("post-publish stale confirm status = %d, want 409", rec.Code)
	}
}

func TestCheckoutRetryStillChecksTTLAndPhotos(t *testing.T) {
	t.Run("expired ttl", func(t *testing.T) {
		expired := storedJob(store.StatusPending, "ORDER1")
		expired.TTL = time.Now().Add(-time.Minute).Unix()
		st := &fakeStore{job: expired}

		rec := postCheckout(st, nil, `{"kind":"job","id":"JOB1"}`)
		if rec.Code != http.StatusGone {
			t.Fatalf("status = %d, want 410, body = %q", rec.Code, rec.Body.String())
		}
		if st.orderID != "" || st.job.OrderID != "ORDER1" {
			t.Fatalf("SetOrder should not run on expired retry: saved=%q job.OrderID=%q", st.orderID, st.job.OrderID)
		}
	})

	t.Run("missing photo", func(t *testing.T) {
		job := storedJob(store.StatusPending, "ORDER1")
		job.Logo = "media/logo.png"
		st := &fakeStore{job: job}

		rec := postCheckout(st, &fakePhotoStore{checkErr: errBadPhoto}, `{"kind":"job","id":"JOB1"}`)
		if rec.Code != http.StatusUnprocessableEntity {
			t.Fatalf("status = %d, want 422, body = %q", rec.Code, rec.Body.String())
		}
		if st.orderID != "" || st.job.OrderID != "ORDER1" {
			t.Fatalf("SetOrder should not run when photo is missing: saved=%q job.OrderID=%q", st.orderID, st.job.OrderID)
		}
	})
}

func TestCheckoutRetryConflicts(t *testing.T) {
	t.Run("concurrent retry on checkout", func(t *testing.T) {
		st := &fakeStore{
			job:      storedJob(store.StatusPending, "ORDER1"),
			orderErr: store.ErrNotPending,
		}
		rec := postCheckout(st, nil, `{"kind":"job","id":"JOB1"}`)
		if rec.Code != http.StatusConflict {
			t.Fatalf("status = %d, want 409, body = %q", rec.Code, rec.Body.String())
		}
		if st.orderPrevID != "ORDER1" {
			t.Fatalf("prevOrderID = %q, want ORDER1", st.orderPrevID)
		}
		if st.job.OrderID != "ORDER1" {
			t.Fatalf("job.OrderID = %q, want ORDER1 unchanged", st.job.OrderID)
		}
	})

	t.Run("retry replaced order before publish", func(t *testing.T) {
		st := &fakeStore{
			job:        storedJob(store.StatusPending, "ORDER1"),
			publishErr: store.ErrNotPending,
		}
		rec := postConfirm(st, nil, goodConfirm)
		if rec.Code != http.StatusConflict {
			t.Fatalf("status = %d, want 409, body = %q", rec.Code, rec.Body.String())
		}
		if st.published {
			t.Fatal("job marked published despite publish conflict")
		}
	})
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
