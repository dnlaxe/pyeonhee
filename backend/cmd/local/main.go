package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"

	"github.com/dnlaxe/pyeonhee/backend/internal/app"
	"github.com/dnlaxe/pyeonhee/backend/internal/config"
)

func main() {

	fs := flag.NewFlagSet(os.Args[0], flag.ExitOnError)
	configPath := fs.String("config", "config.local.yaml", "path to config file")
	port := fs.String("port", "", "HTTP listen port")
	table := fs.String("table-name", "", "DynamoDB table name")
	fs.Parse(os.Args[1:])

	cfg, err := config.Load(*configPath)
	if err != nil {
		log.Fatal(err)
	}

	if *port != "" {
		cfg.Port = *port
	}
	if *table != "" {
		cfg.TableName = *table
	}

	a, err := app.New(context.Background(), cfg)
	if err != nil {
		log.Fatal(err)
	}

	r := a.NewRouter()

	addr := ":" + cfg.Port
	log.Printf("local API listening on http://localhost%s", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
