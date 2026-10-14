package app

import (
	"context"
	"fmt"

	"github.com/dnlaxe/pyeonhee/backend/internal/app/botcheck"
	"github.com/dnlaxe/pyeonhee/backend/internal/config"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"

	"github.com/dnlaxe/pyeonhee/backend/internal/payment"
)

type DynamoDB interface {
	GetItem(ctx context.Context, params *dynamodb.GetItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.GetItemOutput, error)
	PutItem(ctx context.Context, params *dynamodb.PutItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.PutItemOutput, error)
	Scan(ctx context.Context, params *dynamodb.ScanInput, optFns ...func(*dynamodb.Options)) (*dynamodb.ScanOutput, error)
	UpdateItem(ctx context.Context, params *dynamodb.UpdateItemInput, optFns ...func(*dynamodb.Options)) (*dynamodb.UpdateItemOutput, error)
}

type App struct {
	DB           DynamoDB
	TableName    string
	CORSOrigins  []string
	MediaBaseURL string
	Payments     payment.Provider
	BotCheck     botcheck.Checker
}

func newPaymentProvider(cfg config.Config) (payment.Provider, error) {
	switch cfg.PaymentProvider {
	case "mock":
		return payment.Mock{}, nil
	default:
		return nil, fmt.Errorf("unknown PAYMENT_PROVIDER %q", cfg.PaymentProvider)
	}
}

func newBotChecker(cfg config.Config) (botcheck.Checker, error) {
	switch cfg.BotCheckProvider {
	case "mock":
		return botcheck.Mock{Password: cfg.MockBotCheckPassword}, nil
	default:
		return nil, fmt.Errorf("unknown BOT_CHECK_PROVIDER %q", cfg.BotCheckProvider)
	}
}

func New(ctx context.Context, cfg config.Config) (*App, error) {

	if cfg.TableName == "" {
		return nil, fmt.Errorf("TABLE_NAME not set")
	}

	awsCfg, err := awsconfig.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}

	botCheck, err := newBotChecker(cfg)
	if err != nil {
		return nil, err
	}

	payments, err := newPaymentProvider(cfg)
	if err != nil {
		return nil, err
	}

	return &App{
		DB:           dynamodb.NewFromConfig(awsCfg),
		TableName:    cfg.TableName,
		CORSOrigins:  cfg.CORSOrigins,
		MediaBaseURL: cfg.MediaBaseURL,
		Payments:     payments,
		BotCheck:     botCheck,
	}, nil
}

func (a *App) NewRouter() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: a.CORSOrigins,
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Content-Type"},
		MaxAge:         300,
	}))

	r.Get("/jobs", a.listJobs)
	r.Get("/jobs/{id}", a.getJob)
	r.Get("/services", a.listServices)
	r.Get("/market", a.listMarket)
	r.Get("/market/{id}", a.getMarket)

	r.Post("/jobs", a.createJob)

	r.Post("/payments/checkout", a.checkout)
	r.Post("/payments/confirm", a.confirmPayment)

	return r
}
