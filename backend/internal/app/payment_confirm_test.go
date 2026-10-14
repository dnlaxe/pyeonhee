package app

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"

	"github.com/dnlaxe/pyeonhee/backend/internal/payment"
)

func storedJob(t *testing.T, status, orderID string) map[string]types.AttributeValue {
	t.Helper()
	av, err := attributevalue.MarshalMap(JobItem{
		PK: JobPK("JOB1"), SK: JobSortKeyMeta, ID: "JOB1",
		Status: status, OrderID: orderID, Amount: jobPriceKRW,
	})
	if err != nil {
		t.Fatal(err)
	}
	return av
}

func postConfirm(db *fakeDB, body string) *httptest.ResponseRecorder {
	a := &App{DB: db, TableName: "test-table", Payments: payment.Mock{}}
	req := httptest.NewRequest(http.MethodPost, "/payments/confirm", strings.NewReader(body))
	rec := httptest.NewRecorder()
	a.confirmPayment(rec, req)
	return rec
}

const goodConfirm = `{"jobId":"JOB1","orderId":"ORDER1","paymentKey":"mock_abc","amount":5000}`

func TestConfirmPublishesJob(t *testing.T) {
	db := &fakeDB{item: storedJob(t, JobStatusPending, "ORDER1")}
	rec := postConfirm(db, goodConfirm)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body = %q", rec.Code, rec.Body.String())
	}
	if db.update == nil {
		t.Fatal("job not published")
	}
	key := db.update.ExpressionAttributeValues[":paymentKey"].(*types.AttributeValueMemberS).Value
	if key != "mock_abc" {
		t.Fatalf("paymentKey = %q", key)
	}
}

func TestConfirmIsSafeToRepeat(t *testing.T) {
	db := &fakeDB{item: storedJob(t, JobStatusPublished, "ORDER1")}
	rec := postConfirm(db, goodConfirm)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	if db.update != nil {
		t.Fatal("already published job was updated again")
	}
}

func TestConfirmRejects(t *testing.T) {
	tests := []struct {
		name   string
		item   map[string]types.AttributeValue
		body   string
		status int
	}{
		{"job missing", nil, goodConfirm, http.StatusNotFound},
		{"no checkout yet", storedJob(t, JobStatusPending, ""), goodConfirm, http.StatusBadRequest},
		{"old order id", storedJob(t, JobStatusPending, "ORDER2"), goodConfirm, http.StatusBadRequest},
		{"tampered amount", storedJob(t, JobStatusPending, "ORDER1"),
			`{"jobId":"JOB1","orderId":"ORDER1","paymentKey":"mock_abc","amount":100}`, http.StatusBadRequest},
		{"declined", storedJob(t, JobStatusPending, "ORDER1"),
			`{"jobId":"JOB1","orderId":"ORDER1","paymentKey":"real_abc","amount":5000}`, http.StatusPaymentRequired},
		{"published by other order", storedJob(t, JobStatusPublished, "ORDER2"), goodConfirm, http.StatusConflict},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			db := &fakeDB{item: tt.item}
			rec := postConfirm(db, tt.body)
			if rec.Code != tt.status {
				t.Fatalf("status = %d, want %d, body = %q", rec.Code, tt.status, rec.Body.String())
			}
			if db.update != nil {
				t.Fatal("job published on a rejected confirm")
			}
		})
	}
}
