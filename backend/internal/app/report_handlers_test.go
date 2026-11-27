package app

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/dnlaxe/pyeonhee/backend/internal/botcheck"
	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

func postReport(st *fakeStore, body string) *httptest.ResponseRecorder {
	a := &App{
		Store:    st,
		BotCheck: botcheck.Mock{Password: "secret"},
	}
	req := httptest.NewRequest(http.MethodPost, "/api/report", strings.NewReader(body))
	rec := httptest.NewRecorder()
	a.NewRouter().ServeHTTP(rec, req)
	return rec
}

func TestReportValidation(t *testing.T) {
	tests := []struct {
		name     string
		body     string
		wantKeys []string
	}{
		{
			name:     "missing email with valid message",
			body:     `{"kind":"job","id":"JOB1","email":"","message":"This looks misleading.","password":"secret"}`,
			wantKeys: []string{"email"},
		},
		{
			name:     "invalid email format",
			body:     `{"kind":"job","id":"JOB1","email":"not-an-email","message":"This looks misleading.","password":"secret"}`,
			wantKeys: []string{"email"},
		},
		{
			name:     "missing message with valid email",
			body:     `{"kind":"job","id":"JOB1","email":"alice@example.com","message":"","password":"secret"}`,
			wantKeys: []string{"message"},
		},
		{
			name:     "missing both email and message",
			body:     `{"kind":"job","id":"JOB1","email":"","message":"","password":"secret"}`,
			wantKeys: []string{"email", "message"},
		},
		{
			name:     "email too long",
			body:     `{"kind":"job","id":"JOB1","email":"` + strings.Repeat("a", maxEmailLength) + `@b.co","message":"This looks misleading.","password":"secret"}`,
			wantKeys: []string{"email"},
		},
		{
			name:     "message too short",
			body:     `{"kind":"job","id":"JOB1","email":"alice@example.com","message":"scam","password":"secret"}`,
			wantKeys: []string{"message"},
		},
		{
			name:     "message too long",
			body:     `{"kind":"job","id":"JOB1","email":"alice@example.com","message":"` + strings.Repeat("a", maxShortMessageLength+1) + `","password":"secret"}`,
			wantKeys: []string{"message"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := postReport(&fakeStore{}, tt.body)
			if rec.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want %d, body = %q", rec.Code, http.StatusBadRequest, rec.Body.String())
			}

			var resp struct {
				Errors map[string]string `json:"errors"`
			}
			if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
				t.Fatalf("unmarshal response: %v", err)
			}
			if len(resp.Errors) != len(tt.wantKeys) {
				t.Fatalf("errors = %v, want keys %v", resp.Errors, tt.wantKeys)
			}
			for _, key := range tt.wantKeys {
				if resp.Errors[key] == "" {
					t.Errorf("missing expected validation error for %q in %v", key, resp.Errors)
				}
			}
		})
	}
}

func TestReportBotCheckFailed(t *testing.T) {
	rec := postReport(&fakeStore{}, `{"kind":"job","id":"JOB1","email":"alice@example.com","message":"This listing looks like a scam.","password":"wrong"}`)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusUnauthorized)
	}
}

func TestReportSuccessForAllKinds(t *testing.T) {
	tests := []struct {
		name      string
		kind      string
		id        string
		store     *fakeStore
		wantTitle string
	}{
		{
			name: "job",
			kind: "job",
			id:   "J1",
			store: &fakeStore{job: &store.JobItem{
				ID:     "J1",
				Title:  "English Teacher",
				Status: store.StatusPublished,
			}},
			wantTitle: "English Teacher",
		},
		{
			name: "market",
			kind: "market",
			id:   "M1",
			store: &fakeStore{market: &store.MarketItem{
				ID:     "M1",
				Title:  "Used Bike",
				Status: store.StatusPublished,
			}},
			wantTitle: "Used Bike",
		},
		{
			name: "service",
			kind: "service",
			id:   "S1",
			store: &fakeStore{service: &store.ServiceItem{
				ID:      "S1",
				Company: "Visa Help Co",
				Status:  store.StatusPublished,
			}},
			wantTitle: "Visa Help Co",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body := `{"kind":"` + tt.kind + `","id":"` + tt.id + `","email":" alice@example.com ","message":" This listing looks like a scam. ","password":"secret"}`
			rec := postReport(tt.store, body)
			if rec.Code != http.StatusCreated {
				t.Fatalf("status = %d, want %d, body = %q", rec.Code, http.StatusCreated, rec.Body.String())
			}

			var resp map[string]string
			if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
				t.Fatalf("unmarshal response: %v", err)
			}
			if resp["id"] == "" || resp["status"] != "received" {
				t.Fatalf("resp = %v", resp)
			}

			saved := tt.store.report
			if saved == nil {
				t.Fatal("expected report to be saved")
			}
			if saved.PK != store.ReportPartitionKey {
				t.Fatalf("PK = %q, want %q", saved.PK, store.ReportPartitionKey)
			}
			if saved.SK != store.ReportSK(saved.CreatedAt, saved.ID) {
				t.Fatalf("SK = %q, want %q", saved.SK, store.ReportSK(saved.CreatedAt, saved.ID))
			}
			if saved.EntityType != store.EntityReport || saved.Status != store.ReportStatusOpen {
				t.Fatalf("saved = %+v", saved)
			}
			if saved.ListingKind != tt.kind || saved.ListingID != tt.id || saved.ListingTitle != tt.wantTitle {
				t.Fatalf("listing fields = %+v", saved)
			}
			if saved.ReporterEmail != "alice@example.com" || saved.Message != "This listing looks like a scam." {
				t.Fatalf("reporter fields = %+v", saved)
			}
		})
	}
}

func TestReportErrors(t *testing.T) {
	t.Run("missing listing", func(t *testing.T) {
		rec := postReport(&fakeStore{}, `{"kind":"job","id":"MISSING","email":"alice@example.com","message":"This listing looks like a scam.","password":"secret"}`)
		if rec.Code != http.StatusNotFound {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusNotFound)
		}
	})

	t.Run("unpublished listing", func(t *testing.T) {
		st := &fakeStore{job: &store.JobItem{ID: "J1", Title: "Draft", Status: store.StatusPending}}
		rec := postReport(st, `{"kind":"job","id":"J1","email":"alice@example.com","message":"This listing looks like a scam.","password":"secret"}`)
		if rec.Code != http.StatusNotFound {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusNotFound)
		}
	})

	t.Run("invalid kind", func(t *testing.T) {
		rec := postReport(&fakeStore{}, `{"kind":"other","id":"X1","email":"alice@example.com","message":"This listing looks like a scam.","password":"secret"}`)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
		}
	})

	t.Run("oversized body", func(t *testing.T) {
		body := `{"message":"` + strings.Repeat("a", maxListingBodyBytes+1) + `"}`
		rec := postReport(&fakeStore{}, body)
		if rec.Code != http.StatusRequestEntityTooLarge {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusRequestEntityTooLarge)
		}
	})

	t.Run("store error", func(t *testing.T) {
		st := &fakeStore{
			job:       &store.JobItem{ID: "J1", Title: "Teacher", Status: store.StatusPublished},
			reportErr: errors.New("ddb down"),
		}
		rec := postReport(st, `{"kind":"job","id":"J1","email":"alice@example.com","message":"This listing looks like a scam.","password":"secret"}`)
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("status = %d, want %d", rec.Code, http.StatusInternalServerError)
		}
	})
}
