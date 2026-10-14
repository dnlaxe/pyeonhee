package app

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/dnlaxe/pyeonhee/backend/internal/app/botcheck"
	"github.com/dnlaxe/pyeonhee/backend/internal/config"
	"github.com/dnlaxe/pyeonhee/backend/internal/payment"
)

func TestUnknownRouteNotFound(t *testing.T) {
	a := &App{}
	req := httptest.NewRequest(http.MethodGet, "/nope", nil)
	rec := httptest.NewRecorder()

	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusNotFound)
	}
}

func TestNewRequiresTableName(t *testing.T) {

	_, err := New(context.Background(), config.Config{})
	if err == nil {
		t.Fatal("expected error when TABLE_NAME is empty")
	}
}

func TestListJobsAgainstDynamoDB(t *testing.T) {
	if os.Getenv("TABLE_NAME") == "" {
		t.Skip("TABLE_NAME not set; skipping live DynamoDB check")
	}
	cfg := config.Defaults()
	cfg.TableName = os.Getenv("TABLE_NAME")
	a, err := New(context.Background(), cfg)
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/jobs", nil)
	rec := httptest.NewRecorder()

	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	body := rec.Body.String()
	if body == "" || body[0] != '[' {
		t.Fatalf("expected JSON array, got %q", body)
	}
}

func TestNewPaymentProvider(t *testing.T) {
	p, err := newPaymentProvider(config.Config{PaymentProvider: "mock"})
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := p.(payment.Mock); !ok {
		t.Fatalf("provider = %T, want payment.Mock", p)
	}

	if _, err := newPaymentProvider(config.Config{PaymentProvider: "tosss"}); err == nil {
		t.Fatal("expected error for unknown provider")
	}
}

func TestNewBotChecker(t *testing.T) {
	c, err := newBotChecker(config.Config{BotCheckProvider: "mock"})
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := c.(botcheck.Mock); !ok {
		t.Fatalf("provider = %T, want botCheck", c)
	}

	if _, err := newBotChecker(config.Config{BotCheckProvider: "turnstile"}); err == nil {
		t.Fatal("expected error for unknown provider")
	}
}
