package app

import (
	"context"
	"fmt"

	"github.com/dnlaxe/pyeonhee/backend/internal/botcheck"
	"github.com/dnlaxe/pyeonhee/backend/internal/config"
	"github.com/dnlaxe/pyeonhee/backend/internal/payment"
	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

type Store interface {
	ListPublishedJob(ctx context.Context) ([]store.JobItem, error)
	GetJob(ctx context.Context, id string) (store.JobItem, error)
	PutJob(ctx context.Context, item store.JobItem) error
	SetJobOrder(ctx context.Context, jobID, orderID string, amount int64) error
	PublishJob(ctx context.Context, jobID, orderID, paymentKey string) error

	ListPublishedMarket(ctx context.Context) ([]store.MarketItem, error)
	GetMarket(ctx context.Context, id string) (store.MarketItem, error)

	ListPublishedService(ctx context.Context) ([]store.ServiceItem, error)
}

type App struct {
	Store        Store
	CORSOrigins  []string
	MediaBaseURL string
	Payments     payment.Provider
	BotCheck     botcheck.Checker
}

func New(ctx context.Context, cfg config.Config) (*App, error) {

	if cfg.TableName == "" {
		return nil, fmt.Errorf("TABLE_NAME not set")
	}

	st, err := store.NewFromAWS(ctx, cfg.TableName)
	if err != nil {
		return nil, err
	}

	botCheck, err := botcheck.New(cfg.BotCheckProvider, cfg.MockBotCheckPassword)
	if err != nil {
		return nil, err
	}

	payments, err := payment.New(cfg.PaymentProvider)
	if err != nil {
		return nil, err
	}

	return &App{
		Store:        st,
		CORSOrigins:  cfg.CORSOrigins,
		MediaBaseURL: cfg.MediaBaseURL,
		Payments:     payments,
		BotCheck:     botCheck,
	}, nil
}
