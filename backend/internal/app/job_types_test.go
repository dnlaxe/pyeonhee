package app

import (
	"encoding/json"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

func TestJobJSONOmitsPosterEmail(t *testing.T) {
	item := store.JobItem{
		ID:          "job_1",
		Title:       "Teacher",
		PosterEmail: "poster@example.com",
		EmailOption: "hide",
	}

	job := toJobResponse(item)
	if job.Email != "" {
		t.Fatalf("hide job has email %q", job.Email)
	}

	body, err := json.Marshal(job)
	if err != nil {
		t.Fatal(err)
	}
	text := string(body)
	if strings.Contains(text, "poster@example.com") || strings.Contains(text, "posterEmail") {
		t.Fatalf("public job JSON contains the address: %s", text)
	}
}

func TestJobJSONIncludesEmailWhenShown(t *testing.T) {
	item := store.JobItem{
		ID:          "job_1",
		Title:       "Teacher",
		PosterEmail: "poster@example.com",
		EmailOption: "show",
	}

	job := toJobResponse(item)
	if job.Email != "poster@example.com" {
		t.Fatalf("email = %q", job.Email)
	}

	body, err := json.Marshal(job)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(body), "posterEmail") {
		t.Fatalf("public job JSON contains posterEmail: %s", body)
	}
}

func TestCreateJobRequestToItem(t *testing.T) {
	req := validCreateJobRequest()
	now := time.Date(2026, 10, 13, 12, 0, 0, 0, time.FixedZone("KST", 9*60*60))

	item := req.toJobItem("TESTID", now)

	if item.PK != "JOB#TESTID" || item.SK != store.SortKeyMeta || item.ID != "TESTID" {
		t.Fatalf("keys = %q %q %q", item.PK, item.SK, item.ID)
	}
	if item.EntityType != store.EntityJob {
		t.Fatalf("entityType = %q", item.EntityType)
	}
	if item.Status != store.StatusPending {
		t.Fatalf("status = %q, want pending", item.Status)
	}
	if item.CreatedAt != "2026-10-13T03:00:00Z" {
		t.Fatalf("createdAt = %q, want UTC RFC3339", item.CreatedAt)
	}
	wantTags := []string{"Full Time", "Teaching", "English Teaching", "No Korean required"}
	if !slices.Equal(item.Tags, wantTags) {
		t.Fatalf("tags = %v, want %v", item.Tags, wantTags)
	}
	if item.PosterEmail != req.Email || item.EmailOption != req.EmailOption {
		t.Fatalf("email fields = %q %q", item.PosterEmail, item.EmailOption)
	}
}
