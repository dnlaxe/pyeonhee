package app

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestJobJSONOmitsPosterEmail(t *testing.T) {
	item := JobItem{
		ID:          "job_1",
		Title:       "Teacher",
		PosterEmail: "poster@example.com",
		EmailOption: "hide",
	}

	job := item.ToJob()
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
	item := JobItem{
		ID:          "job_1",
		Title:       "Teacher",
		PosterEmail: "poster@example.com",
		EmailOption: "show",
	}

	job := item.ToJob()
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
