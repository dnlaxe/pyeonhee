package app

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestMockBotCheckAcceptsPassword(t *testing.T) {
	a := &App{MockBotCheckPassword: "test-phrase"}
	body := `{"password":"test-phrase"}`
	req := httptest.NewRequest(http.MethodPost, "/mock-bot-check", strings.NewReader(body))
	rec := httptest.NewRecorder()

	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	if rec.Body.String() != "{\"success\":true}\n" {
		t.Fatalf("body = %q", rec.Body.String())
	}
}

func TestMockBotCheckRejectsWrongPassword(t *testing.T) {
	a := &App{MockBotCheckPassword: "test-phrase"}
	body := `{"password":"wrong"}`
	req := httptest.NewRequest(http.MethodPost, "/mock-bot-check", strings.NewReader(body))
	rec := httptest.NewRecorder()

	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	if rec.Body.String() != "incorrect password\n" {
		t.Fatalf("body = %q", rec.Body.String())
	}
}

func TestMockBotCheckRequiresConfiguration(t *testing.T) {
	a := &App{}
	body := `{"password":"test-phrase"}`
	req := httptest.NewRequest(http.MethodPost, "/mock-bot-check", strings.NewReader(body))
	rec := httptest.NewRecorder()

	a.NewRouter().ServeHTTP(rec, req)

	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	if rec.Body.String() != "mock bot check password is not configured\n" {
		t.Fatalf("body = %q", rec.Body.String())
	}
}
