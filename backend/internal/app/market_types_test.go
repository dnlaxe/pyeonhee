package app

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

func TestMarketJSONOmitsPosterEmail(t *testing.T) {
	item := store.MarketItem{
		ID:          "market_1",
		Title:       "Sofa",
		PosterEmail: "poster@example.com",
		EmailOption: "hide",
	}

	market := toMarketResponse(item)
	if market.Email != "" {
		t.Fatalf("hide market item has email %q", market.Email)
	}

	body, err := json.Marshal(market)
	if err != nil {
		t.Fatal(err)
	}
	text := string(body)
	if strings.Contains(text, "poster@example.com") || strings.Contains(text, "posterEmail") {
		t.Fatalf("public market JSON contains the address: %s", text)
	}
}

func TestMarketJSONIncludesEmailWhenShown(t *testing.T) {
	item := store.MarketItem{
		ID:          "market_1",
		Title:       "Sofa",
		PosterEmail: "poster@example.com",
		EmailOption: "show",
	}

	market := toMarketResponse(item)
	if market.Email != "poster@example.com" {
		t.Fatalf("email = %q", market.Email)
	}

	body, err := json.Marshal(market)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(body), "posterEmail") {
		t.Fatalf("public market JSON contains posterEmail: %s", body)
	}
}
