package payment

import (
	"context"
	"fmt"
)

type ChargeRequest struct {
	JobID    string `json:"jobId"`
	Amount   int64  `json:"amount"`
	Currency string `json:"currency"`
	Method   string `json:"method"`
}

type ChargeResult struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

type Payment interface {
	Charge(ctx context.Context, req ChargeRequest) (ChargeResult, error)
}

type MockPayment struct{}

func (MockPayment) Charge(ctx context.Context, req ChargeRequest) (ChargeResult, error) {
	if req.Amount <= 0 {
		return ChargeResult{}, fmt.Errorf("charge amount must be positive")
	}

	return ChargeResult{
		ID:     "mock_" + req.JobID,
		Status: "paid",
	}, nil
}
