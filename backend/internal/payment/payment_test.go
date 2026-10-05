package payment

import (
	"context"
	"encoding/json"
	"testing"
)

func TestMockCharge(t *testing.T) {
	var p Payment = MockPayment{}

	got, err := p.Charge(context.Background(), ChargeRequest{
		JobID:    "job_1",
		Amount:   5000,
		Currency: "KRW",
		Method:   "mock",
	})
	if err != nil {
		t.Fatal(err)
	}
	if got.ID != "mock_job_1" || got.Status != "paid" {
		t.Fatalf("got %+v", got)
	}
}

func TestMockChargeRejectsNonPositiveAmount(t *testing.T) {
	var p Payment = MockPayment{}

	_, err := p.Charge(context.Background(), ChargeRequest{
		JobID:    "job_1",
		Amount:   0,
		Currency: "KRW",
		Method:   "mock",
	})
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestChargeJSON(t *testing.T) {
	var req ChargeRequest
	err := json.Unmarshal([]byte(`{"jobId":"demo","amount":5000,"currency":"KRW","method":"mock"}`), &req)
	if err != nil {
		t.Fatal(err)
	}
	if req.JobID != "demo" || req.Amount != 5000 || req.Currency != "KRW" || req.Method != "mock" {
		t.Fatalf("req = %+v", req)
	}

	got, err := json.Marshal(ChargeResult{ID: "mock_demo", Status: "paid"})
	if err != nil {
		t.Fatal(err)
	}
	want := `{"id":"mock_demo","status":"paid"}`
	if string(got) != want {
		t.Fatalf("got %s", got)
	}
}
