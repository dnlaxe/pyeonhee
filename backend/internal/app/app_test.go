package app

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestUnknownRouteNotFound(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/nope", nil)
	rec := httptest.NewRecorder()

	NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusNotFound)
	}
}

func TestListJobsRequiresTableName(t *testing.T) {
	// Ensure this test doesn't accidentally use a real table from the environment.
	t.Setenv("TABLE_NAME", "")

	req := httptest.NewRequest(http.MethodGet, "/jobs", nil)
	rec := httptest.NewRecorder()

	NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusInternalServerError)
	}
}

func TestListJobsAgainstDynamoDB(t *testing.T) {
	if os.Getenv("TABLE_NAME") == "" {
		t.Skip("TABLE_NAME not set; skipping live DynamoDB check")
	}

	req := httptest.NewRequest(http.MethodGet, "/jobs", nil)
	rec := httptest.NewRecorder()

	NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	body := rec.Body.String()
	if body == "" || body[0] != '[' {
		t.Fatalf("expected JSON array, got %q", body)
	}
}
