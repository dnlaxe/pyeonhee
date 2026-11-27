package app

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/dnlaxe/pyeonhee/backend/internal/botcheck"
	"github.com/dnlaxe/pyeonhee/backend/internal/config"
	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

type fakeStore struct {
	Store
	listings    store.PublishedListings
	listingsErr error

	job       *store.JobItem
	market    *store.MarketItem
	service   *store.ServiceItem
	report    *store.ReportItem
	reportErr error

	orderErr    error
	orderJobID  string
	orderID     string
	orderAmount int64

	publishErr   error
	published    bool
	publishedKey string
}

func (f *fakeStore) ListPublishedListings(_ context.Context) (store.PublishedListings, error) {
	if f.listingsErr != nil {
		return store.PublishedListings{}, f.listingsErr
	}
	return f.listings, nil
}

func (f *fakeStore) GetJob(_ context.Context, _ string) (store.JobItem, error) {
	if f.job == nil {
		return store.JobItem{}, store.ErrNotFound
	}
	return *f.job, nil
}

func (f *fakeStore) PutJob(_ context.Context, item store.JobItem) error {
	f.job = &item
	return nil
}

func (f *fakeStore) GetMarket(_ context.Context, _ string) (store.MarketItem, error) {
	if f.market == nil {
		return store.MarketItem{}, store.ErrNotFound
	}
	return *f.market, nil
}

func (f *fakeStore) PutMarket(_ context.Context, item store.MarketItem) error {
	f.market = &item
	return nil
}

func (f *fakeStore) GetService(_ context.Context, _ string) (store.ServiceItem, error) {
	if f.service == nil {
		return store.ServiceItem{}, store.ErrNotFound
	}
	return *f.service, nil
}

func (f *fakeStore) PutService(_ context.Context, item store.ServiceItem) error {
	f.service = &item
	return nil
}

func (f *fakeStore) PutReport(_ context.Context, item store.ReportItem) error {
	if f.reportErr != nil {
		return f.reportErr
	}
	f.report = &item
	return nil
}

func (f *fakeStore) SetOrder(_ context.Context, pk, orderID string, amount int64) error {
	f.orderJobID, f.orderID, f.orderAmount = pk, orderID, amount
	return f.orderErr
}

func (f *fakeStore) Publish(_ context.Context, _, _, paymentKey string) error {
	f.published, f.publishedKey = true, paymentKey
	return f.publishErr
}

func TestListListings(t *testing.T) {
	a := &App{
		Store: &fakeStore{listings: store.PublishedListings{
			Jobs: []store.JobItem{
				{ID: "j-old", Title: "Old", CreatedAt: "2026-01-01T00:00:00Z", Status: store.StatusPublished},
				{ID: "j-pin", Title: "Pinned", Logo: "media/jobs/logo.png", Pinned: true, CreatedAt: "2026-01-01T00:00:00Z", Status: store.StatusPublished},
				{ID: "j-new", Title: "New", CreatedAt: "2026-01-02T00:00:00Z", Status: store.StatusPublished},
			},
			Market: []store.MarketItem{
				{ID: "m1", Title: "Bike", Images: []string{"media/market/1.png"}, CreatedAt: "2026-01-01T00:00:00Z", Status: store.StatusPublished},
				{ID: "m2", Title: "Chair", Pinned: true, CreatedAt: "2026-01-01T00:00:00Z", Status: store.StatusPublished},
			},
			Services: []store.ServiceItem{
				{ID: "s1", Company: "Old Co", CreatedAt: "2026-01-01T00:00:00Z", Status: store.StatusPublished},
				{ID: "s2", Company: "New Co", Logo: "media/services/s2.png", CreatedAt: "2026-01-03T00:00:00Z", Status: store.StatusPublished},
			},
		}},
		MediaBaseURL: "https://cdn.example",
	}

	req := httptest.NewRequest(http.MethodGet, "/api/listings", nil)
	rec := httptest.NewRecorder()
	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %s", rec.Code, rec.Body.String())
	}

	var resp ListingsResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(resp.Jobs) != 3 || resp.Jobs[0].ID != "j-pin" || resp.Jobs[1].ID != "j-new" || resp.Jobs[2].ID != "j-old" {
		t.Fatalf("jobs order = %+v", resp.Jobs)
	}
	if resp.Jobs[0].Logo != "https://cdn.example/media/jobs/logo.png" {
		t.Fatalf("job logo = %q", resp.Jobs[0].Logo)
	}
	if len(resp.Market) != 2 || resp.Market[0].ID != "m2" || resp.Market[1].ID != "m1" {
		t.Fatalf("market order = %+v", resp.Market)
	}
	if len(resp.Market[1].Images) != 1 || resp.Market[1].Images[0] != "https://cdn.example/media/market/1.png" {
		t.Fatalf("market images = %+v", resp.Market[1].Images)
	}
	if len(resp.Services) != 2 || resp.Services[0].ID != "s2" || resp.Services[1].ID != "s1" {
		t.Fatalf("services order = %+v", resp.Services)
	}
	if resp.Services[0].Logo != "https://cdn.example/media/services/s2.png" {
		t.Fatalf("service logo = %q", resp.Services[0].Logo)
	}
}

func TestListListingsEmptyArrays(t *testing.T) {
	a := &App{Store: &fakeStore{}}
	req := httptest.NewRequest(http.MethodGet, "/api/listings", nil)
	rec := httptest.NewRecorder()
	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %s", rec.Code, rec.Body.String())
	}
	if got := strings.TrimSpace(rec.Body.String()); got != `{"jobs":[],"market":[],"services":[]}` {
		t.Fatalf("body = %s", got)
	}
}

func TestListListingsStoreError(t *testing.T) {
	a := &App{Store: &fakeStore{listingsErr: errors.New("boom")}}
	req := httptest.NewRequest(http.MethodGet, "/api/listings", nil)
	rec := httptest.NewRecorder()
	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusInternalServerError)
	}
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
	req := httptest.NewRequest(http.MethodGet, "/api/services/svc1", nil)
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
	req := httptest.NewRequest(http.MethodGet, "/api/services/missing", nil)
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
	req := httptest.NewRequest(http.MethodGet, "/api/services/svc1", nil)
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

	for _, path := range []string{"/api/jobs", "/api/market", "/api/services"} {
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

type fakePhotoStore struct {
	next      int
	presigned []PhotoSpec
	checkErr  error
	checked   []string
	promoteErr error
	promoted  []string
}

func (f *fakePhotoStore) PresignUpload(_ context.Context, spec PhotoSpec) (string, PhotoUpload, error) {
	f.next++
	f.presigned = append(f.presigned, spec)
	ext := photoExt[spec.ContentType]
	key := photoPrefix + "p" + string(rune('0'+f.next)) + "." + ext
	return key, PhotoUpload{Key: key, UploadURL: "https://s3.example/tmp/" + key}, nil
}

func (f *fakePhotoStore) CheckUpload(_ context.Context, mediaKey string) error {
	f.checked = append(f.checked, mediaKey)
	return f.checkErr
}

func (f *fakePhotoStore) Promote(_ context.Context, mediaKey string) error {
	f.promoted = append(f.promoted, mediaKey)
	return f.promoteErr
}

func TestCreateMarketPresignsPhotosOnce(t *testing.T) {
	st := &fakeStore{}
	photos := &fakePhotoStore{}
	a := &App{
		Store:    st,
		BotCheck: botcheck.Mock{Password: "secret"},
		Photos:   photos,
	}

	body := `{
		"email":"seller@example.com",
		"emailOption":"hide",
		"title":"IKEA Desk",
		"location":"Seoul",
		"listingType":"Selling",
		"category":"Furniture",
		"price":"50000",
		"description":"` + strings.Repeat("a", minBodyLength) + `",
		"images":[
			{"contentType":"image/jpeg","contentLength":1000},
			{"contentType":"image/png","contentLength":2000}
		],
		"password":"secret"
	}`

	req := httptest.NewRequest(http.MethodPost, "/api/market", strings.NewReader(body))
	rec := httptest.NewRecorder()
	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("status = %d body = %s", rec.Code, rec.Body.String())
	}

	var resp createListingResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatal(err)
	}
	if resp.ID == "" || len(resp.Uploads) != 2 {
		t.Fatalf("resp = %+v", resp)
	}
	if st.market == nil || len(st.market.Images) != 2 || st.market.Images[0] != resp.Uploads[0].Key {
		t.Fatalf("saved market = %+v", st.market)
	}
	if st.market.TTL == 0 {
		t.Fatal("expected pending market TTL to be set")
	}
}

func TestNewRequiresTableName(t *testing.T) {

	_, err := New(context.Background(), config.Config{})
	if err == nil {
		t.Fatal("expected error when TABLE_NAME is empty")
	}
}

func TestListListingsAgainstDynamoDB(t *testing.T) {
	if os.Getenv("TABLE_NAME") == "" {
		t.Skip("TABLE_NAME not set; skipping live DynamoDB check")
	}
	cfg := config.Defaults()
	cfg.TableName = os.Getenv("TABLE_NAME")
	a, err := New(context.Background(), cfg)
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/listings", nil)
	rec := httptest.NewRecorder()

	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	var resp ListingsResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("expected JSON listings object, got %q: %v", rec.Body.String(), err)
	}
	if resp.Jobs == nil || resp.Market == nil || resp.Services == nil {
		t.Fatalf("expected non-nil listing slices, got %+v", resp)
	}
}
