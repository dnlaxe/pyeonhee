package payment

import (
	"context"
	"errors"
	"testing"
)

func TestMockConfirm(t *testing.T) {
	tests := []struct {
		name string
		key  string
		want error
	}{
		{"mock key", "mock_abc123", nil},
		{"real-looking key", "tgen_20261014abc", ErrDeclined},
		{"empty key", "", ErrDeclined},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var p Provider = Mock{}
			err := p.Confirm(context.Background(), ConfirmRequest{
				PaymentKey: tt.key,
				OrderID:    "order_1",
				Amount:     5000,
			})
			if !errors.Is(err, tt.want) {
				t.Fatalf("err = %v, want %v", err, tt.want)
			}
		})
	}
}
