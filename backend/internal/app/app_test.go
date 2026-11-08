package app

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/dnlaxe/pyeonhee/backend/internal/config"
	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

type fakeStore struct {
	Store
	job     *store.JobItem
	market  *store.MarketItem
	service *store.ServiceItem

	orderErr    error
	orderJobID  string
	orderID     string
	orderAmount int64

	publishErr   error
	published    bool
	publishedKey string
}

func (f *fakeStore) GetJob(_ context.Context, _ string) (store.JobItem, error) {
	if f.job == nil {
		return store.JobItem{}, store.ErrNotFound
	}
	return *f.job, nil
}

func (f *fakeStore) SetJobOrder(_ context.Context, jobID, orderID string, amount int64) error {
	f.orderJobID, f.orderID, f.orderAmount = jobID, orderID, amount
	return f.orderErr
}

func (f *fakeStore) PublishJob(_ context.Context, _, _, paymentKey string) error {
	f.published, f.publishedKey = true, paymentKey
	return f.publishErr
}

func (f *fakeStore) GetMarket(_ context.Context, _ string) (store.MarketItem, error) {
	if f.market == nil {
		return store.MarketItem{}, store.ErrNotFound
	}
	return *f.market, nil
}

func (f *fakeStore) SetMarketOrder(_ context.Context, marketID, orderID string, amount int64) error {
	f.orderJobID, f.orderID, f.orderAmount = marketID, orderID, amount
	return f.orderErr
}

func (f *fakeStore) PublishMarket(_ context.Context, _, _, paymentKey string) error {
	f.published, f.publishedKey = true, paymentKey
	return f.publishErr
}

func (f *fakeStore) GetService(_ context.Context, _ string) (store.ServiceItem, error) {
	if f.service == nil {
		return store.ServiceItem{}, store.ErrNotFound
	}
	return *f.service, nil
}

func (f *fakeStore) SetServiceOrder(_ context.Context, serviceID, orderID string, amount int64) error {
	f.orderJobID, f.orderID, f.orderAmount = serviceID, orderID, amount
	return f.orderErr
}

func (f *fakeStore) PublishService(_ context.Context, _, _, paymentKey string) error {
	f.published, f.publishedKey = true, paymentKey
	return f.publishErr
}

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
