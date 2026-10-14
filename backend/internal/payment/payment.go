package payment

import (
	"context"
	"errors"
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

type Mock struct{}

func (Mock) Confirm(_ context.Context, req ConfirmRequest) error {
	if !strings.HasPrefix(req.PaymentKey, MockKeyPrefix) {
		return ErrDeclined
	}
	return nil
}
