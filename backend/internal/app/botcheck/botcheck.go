package botcheck

import (
	"context"
	"crypto/subtle"
	"errors"
)

var (
	ErrFailed        = errors.New("bot check failed")
	ErrNotConfigured = errors.New("bot check is not configured")
)

type Checker interface {
	Verify(ctx context.Context, token string) error
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
