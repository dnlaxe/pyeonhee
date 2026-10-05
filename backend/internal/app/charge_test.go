package app

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/dnlaxe/pyeonhee/backend/internal/payment"
)

func TestCharge(t *testing.T) {
	a := &App{Payments: payment.MockPayment{}}
	body := `{"jobId":"demo","amount":5000,"currency":"KRW","method":"mock"}`
	req := httptest.NewRequest(http.MethodPost, "/payments", strings.NewReader(body))
	rec := httptest.NewRecorder()

	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	if rec.Body.String() != "{\"id\":\"mock_demo\",\"status\":\"paid\"}\n" {
		t.Fatalf("body = %q", rec.Body.String())
	}
}

func TestChargeRejectsNonPositiveAmount(t *testing.T) {
	a := &App{Payments: payment.MockPayment{}}
	body := `{"jobId":"demo","amount":0,"currency":"KRW","method":"mock"}`
	req := httptest.NewRequest(http.MethodPost, "/payments", strings.NewReader(body))
	rec := httptest.NewRecorder()

	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	if rec.Body.String() != "charge amount must be positive\n" {
		t.Fatalf("body = %q", rec.Body.String())
	}
}
