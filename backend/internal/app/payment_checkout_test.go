package app

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func postCheckout(db *fakeDB, body string) *httptest.ResponseRecorder {
	a := &App{DB: db, TableName: "test-table"}
	req := httptest.NewRequest(http.MethodPost, "/payments/checkout", strings.NewReader(body))
	rec := httptest.NewRecorder()
	a.checkout(rec, req)
	return rec
}

func TestCheckoutSavesOrder(t *testing.T) {
	db := &fakeDB{}
	rec := postCheckout(db, `{"jobId":"JOB1"}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	var resp checkoutResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatal(err)
	}
	if resp.OrderID == "" || resp.Amount != jobPriceKRW {
		t.Fatalf("resp = %+v", resp)
	}

	if db.update == nil {
		t.Fatal("UpdateItem not called")
	}
	pk := db.update.Key["PK"].(*types.AttributeValueMemberS).Value
	if pk != "JOB#JOB1" {
		t.Fatalf("PK = %q", pk)
	}
	saved := db.update.ExpressionAttributeValues[":orderId"].(*types.AttributeValueMemberS).Value
	if saved != resp.OrderID {
		t.Fatalf("saved orderId %q, returned %q", saved, resp.OrderID)
	}
}

func TestCheckoutRejects(t *testing.T) {
	tests := []struct {
		name      string
		body      string
		updateErr error
		status    int
	}{
		{"missing jobId", `{}`, nil, http.StatusBadRequest},
		{"client sends amount", `{"jobId":"JOB1","amount":100}`, nil, http.StatusBadRequest},
		{"job not pending", `{"jobId":"JOB1"}`, &types.ConditionalCheckFailedException{}, http.StatusConflict},
		{"database error", `{"jobId":"JOB1"}`, errors.New("dynamo down"), http.StatusInternalServerError},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := postCheckout(&fakeDB{updateErr: tt.updateErr}, tt.body)
			if rec.Code != tt.status {
				t.Fatalf("status = %d, want %d, body = %q", rec.Code, tt.status, rec.Body.String())
			}
		})
	}
}
