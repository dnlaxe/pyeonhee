package app

import (
	"strings"
	"testing"
)

func validCreateJobRequest() CreateJobRequest {
	return CreateJobRequest{
		Email:          "poster@example.com",
		EmailOption:    "hide",
		Title:          "English teacher",
		Location:       "Seoul",
		EmploymentType: "Full Time",
		Track:          "Teaching",
		Area:           "English Teaching",
		Korean:         "No Korean required",
		Description:    strings.Repeat("a", minJobDescriptionLength),
	}
}

func TestCreateJobRequestValidate(t *testing.T) {
	tests := []struct {
		name      string
		modify    func(r *CreateJobRequest)
		wantField string
	}{
		{"valid", func(r *CreateJobRequest) {}, ""},
		{"missing email", func(r *CreateJobRequest) { r.Email = "" }, "email"},
		{"incomplete email", func(r *CreateJobRequest) { r.Email = "name@" }, "email"},
		{"unknown email option", func(r *CreateJobRequest) { r.EmailOption = "maybe" }, "emailOption"},
		{"missing title", func(r *CreateJobRequest) { r.Title = "" }, "title"},
		{"title too long", func(r *CreateJobRequest) { r.Title = strings.Repeat("a", maxJobTitleLength+1) }, "title"},
		{"unknown employment type", func(r *CreateJobRequest) { r.EmploymentType = "Astronaut" }, "employmentType"},
		{"old lowercase track", func(r *CreateJobRequest) { r.Track = "teaching" }, "track"},
		{"area from other track", func(r *CreateJobRequest) { r.Area = "Front End" }, "area"},
		{"unknown korean level", func(r *CreateJobRequest) { r.Korean = "no korean lol" }, "korean"},
		{"short description", func(r *CreateJobRequest) { r.Description = "too short" }, "description"},
		{"korean description counts characters", func(r *CreateJobRequest) { r.Description = strings.Repeat("가", 20) }, "description"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := validCreateJobRequest()
			tt.modify(&req)
			errs := req.validate()

			if tt.wantField == "" {
				if len(errs) != 0 {
					t.Fatalf("want no errors, got %v", errs)
				}
				return
			}
			if _, ok := errs[tt.wantField]; !ok || len(errs) != 1 {
				t.Fatalf("want only %q error, got %v", tt.wantField, errs)
			}
		})
	}
}

func TestCreateJobRequestNormalizeTrimsBeforeValidate(t *testing.T) {
	req := validCreateJobRequest()
	req.Title = "   "
	req.Email = "  poster@example.com  "

	req.normalize()
	errs := req.validate()

	if _, ok := errs["title"]; !ok {
		t.Fatalf("whitespace-only title should fail, got %v", errs)
	}
	if req.Email != "poster@example.com" {
		t.Fatalf("email not trimmed: %q", req.Email)
	}
}
