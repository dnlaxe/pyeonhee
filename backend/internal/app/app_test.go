package app

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
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

func (f *fakeStore) GetMarket(_ context.Context, _ string) (store.MarketItem, error) {
	if f.market == nil {
		return store.MarketItem{}, store.ErrNotFound
	}
	return *f.market, nil
}

func (f *fakeStore) GetService(_ context.Context, _ string) (store.ServiceItem, error) {
	if f.service == nil {
		return store.ServiceItem{}, store.ErrNotFound
	}
	return *f.service, nil
}

func (f *fakeStore) SetOrder(_ context.Context, pk, orderID string, amount int64) error {
	f.orderJobID, f.orderID, f.orderAmount = pk, orderID, amount
	return f.orderErr
}

func (f *fakeStore) Publish(_ context.Context, _, _, paymentKey string) error {
	f.published, f.publishedKey = true, paymentKey
	return f.publishErr
}

func TestGetService(t *testing.T) {
	a := &App{
		Store: &fakeStore{service: &store.ServiceItem{
			ID:        "svc1",
			Company:   "Visa Help",
			Location:  "Seoul",
			Logo:      "media/services/logo.png",
			Blurb:     "We help with visas.",
			Contact:   "hi@example.com",
			Tags:      []string{"Visa"},
			Status:    store.StatusPublished,
			CreatedAt: "2026-01-02T00:00:00Z",
		}},
		MediaBaseURL: "https://cdn.example",
	}
	req := httptest.NewRequest(http.MethodGet, "/services/svc1", nil)
	rec := httptest.NewRecorder()

	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %s", rec.Code, rec.Body.String())
	}
	body := rec.Body.String()
	if !strings.Contains(body, "Visa Help") {
		t.Fatalf("body = %s", body)
	}
	if !strings.Contains(body, "https://cdn.example/media/services/logo.png") {
		t.Fatalf("logo url missing: %s", body)
	}
}

func TestGetServiceNotFound(t *testing.T) {
	a := &App{Store: &fakeStore{}}
	req := httptest.NewRequest(http.MethodGet, "/services/missing", nil)
	rec := httptest.NewRecorder()

	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusNotFound)
	}
}

func TestGetServiceUnpublished(t *testing.T) {
	a := &App{Store: &fakeStore{service: &store.ServiceItem{
		ID:     "svc1",
		Status: store.StatusPending,
	}}}
	req := httptest.NewRequest(http.MethodGet, "/services/svc1", nil)
	rec := httptest.NewRecorder()

	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusNotFound)
	}
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

func TestCreateListingRejectsOversizedBody(t *testing.T) {
	a := &App{}
	router := a.NewRouter()

	for _, path := range []string{"/jobs", "/market", "/services"} {
		t.Run(path, func(t *testing.T) {
			body := `{"description":"` + strings.Repeat("a", maxListingBodyBytes+1) + `"}`
			req := httptest.NewRequest(http.MethodPost, path, strings.NewReader(body))
			rec := httptest.NewRecorder()

			router.ServeHTTP(rec, req)

			if rec.Code != http.StatusRequestEntityTooLarge {
				t.Fatalf("status = %d, want %d, body = %q", rec.Code, http.StatusRequestEntityTooLarge, rec.Body.String())
			}
		})
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
