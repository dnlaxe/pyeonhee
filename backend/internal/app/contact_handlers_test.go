package app

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/dnlaxe/pyeonhee/backend/internal/botcheck"
	"github.com/dnlaxe/pyeonhee/backend/internal/mail"
)

func postContact(body string) *httptest.ResponseRecorder {
	a := &App{
		Store:    &fakeStore{},
		BotCheck: botcheck.Mock{Password: "secret"},
		Mail:     mail.Nop{},
	}
	req := httptest.NewRequest(http.MethodPost, "/contact", strings.NewReader(body))
	rec := httptest.NewRecorder()
	a.contact(rec, req)
	return rec
}

func TestContactValidation(t *testing.T) {
	tests := []struct {
		name     string
		body     string
		wantKeys []string
	}{
		{
			name:     "missing email with valid message",
			body:     `{"kind":"job","id":"JOB1","email":"","message":"Hello there","password":"secret"}`,
			wantKeys: []string{"email"},
		},
		{
			name:     "invalid email format",
			body:     `{"kind":"job","id":"JOB1","email":"not-an-email","message":"Hello there","password":"secret"}`,
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
			body:     `{"kind":"job","id":"JOB1","email":"` + strings.Repeat("a", maxEmailLength) + `@b.co","message":"Hello there","password":"secret"}`,
			wantKeys: []string{"email"},
		},
		{
			name:     "message too short",
			body:     `{"kind":"job","id":"JOB1","email":"alice@example.com","message":"hi","password":"secret"}`,
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
			rec := postContact(tt.body)
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
