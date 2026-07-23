package app

import (
	"context"
	"fmt"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type App struct {
	DB        *dynamodb.Client
	TableName string
}

func New(ctx context.Context) (*App, error) {
	tableName := os.Getenv("TABLE_NAME")
	if tableName == "" {
		return nil, fmt.Errorf("TABLE_NAME not set")
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}

	return &App{
		DB:        dynamodb.NewFromConfig(cfg),
		TableName: tableName,
	}, nil
}

func (a *App) NewRouter() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"},
		AllowedMethods: []string{"GET", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Content-Type"},
		MaxAge:         300,
	}))

	r.Get("/jobs", a.listJobs)
	r.Get("/jobs/{id}", a.getJob)

	return r
}
