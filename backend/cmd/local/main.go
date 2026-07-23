package main

import (
	"context"
	"log"
	"net/http"

	"github.com/dnlaxe/pyeonhee/backend/internal/app"
)

func main() {
	a, err := app.New(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	r := a.NewRouter()

	addr := ":3000"
	log.Printf("local API listening on http://localhost%s", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
