package main

import (
	"log"
	"net/http"

	"github.com/dnlaxe/pyeonhee/backend/internal/app"
)

func main() {
	r := app.NewRouter()

	addr := ":3000"
	log.Printf("local API listening on http://localhost%s", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
