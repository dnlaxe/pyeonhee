package botcheck

import (
	"context"
	"crypto/subtle"
	"errors"
	"fmt"
)

var (
	ErrFailed        = errors.New("bot check failed")
	ErrNotConfigured = errors.New("bot check is not configured")
)

type Checker interface {
	Verify(ctx context.Context, token string) error
}

func New(provider, mockPassword string) (Checker, error) {
	switch provider {
	case "mock":
		return Mock{Password: mockPassword}, nil
	default:
		return nil, fmt.Errorf("unknown BOT_CHECK_PROVIDER %q", provider)
	}
}

type Mock struct {
	Password string
}

func (m Mock) Verify(ctx context.Context, token string) error {
	if m.Password == "" {
		return ErrNotConfigured
	}
	if subtle.ConstantTimeCompare([]byte(token), []byte(m.Password)) != 1 {
		return ErrFailed
	}
	return nil
}
