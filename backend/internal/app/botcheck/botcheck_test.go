package botcheck

import (
	"context"
	"errors"
	"testing"
)

func TestMockVerify(t *testing.T) {
	tests := []struct {
		name     string
		password string
		token    string
		want     error
	}{
		{"correct password", "test-phrase", "test-phrase", nil},
		{"wrong password", "test-phrase", "wrong", ErrFailed},
		{"empty token", "test-phrase", "", ErrFailed},
		{"not configured", "", "anything", ErrNotConfigured},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var c Checker = Mock{Password: tt.password}
			err := c.Verify(context.Background(), tt.token)
			if !errors.Is(err, tt.want) {
				t.Fatalf("err = %v, want %v", err, tt.want)
			}
		})
	}
}
