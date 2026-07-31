package app

import (
	"context"
	"fmt"

	"github.com/dnlaxe/pyeonhee/backend/internal/config"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type App struct {
	DB          *dynamodb.Client
	TableName   string
	CORSOrigins []string
}

func New(ctx context.Context, cfg config.Config) (*App, error) {

	if cfg.TableName == "" {
		return nil, fmt.Errorf("TABLE_NAME not set")
	}

	awsCfg, err := awsconfig.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}

	return &App{
		DB:          dynamodb.NewFromConfig(awsCfg),
		TableName:   cfg.TableName,
		CORSOrigins: cfg.CORSOrigins,
	}, nil
}

func (a *App) NewRouter() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: a.CORSOrigins,
		AllowedMethods: []string{"GET", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Content-Type"},
		MaxAge:         300,
	}))

	r.Get("/jobs", a.listJobs)
	r.Get("/jobs/{id}", a.getJob)

	return r
}
