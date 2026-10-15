package payment

import (
	"context"
	"errors"
	"fmt"
	"strings"
)

var ErrDeclined = errors.New("payment declined")

const MockKeyPrefix = "mock_"

type ConfirmRequest struct {
	PaymentKey string
	OrderID    string
	Amount     int64
}

type Provider interface {
	Confirm(ctx context.Context, req ConfirmRequest) error
}

func New(provider string) (Provider, error) {
	switch provider {
	case "mock":
		return Mock{}, nil
	default:
		return nil, fmt.Errorf("unknown PAYMENT_PROVIDER %q", provider)
	}
}

type Mock struct{}

func (Mock) Confirm(_ context.Context, req ConfirmRequest) error {
	if !strings.HasPrefix(req.PaymentKey, MockKeyPrefix) {
		return ErrDeclined
	}
	return nil
}
