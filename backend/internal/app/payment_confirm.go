package app

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"

	"github.com/dnlaxe/pyeonhee/backend/internal/payment"
)

var errJobNotPending = errors.New("job is not awaiting payment")

type confirmRequest struct {
	JobID      string `json:"jobId"`
	OrderID    string `json:"orderId"`
	PaymentKey string `json:"paymentKey"`
	Amount     int64  `json:"amount"`
}

func (a *App) confirmPayment(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<10)

	var req confirmRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil || req.JobID == "" || req.OrderID == "" || req.PaymentKey == "" {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	out, err := a.DB.GetItem(r.Context(), &dynamodb.GetItemInput{
		TableName: &a.TableName,
		Key:       jobKey(req.JobID),
	})
	if err != nil {
		writeInternalError(w, "confirm: get item", err)
		return
	}
	if out.Item == nil {
		http.Error(w, "job not found", http.StatusNotFound)
		return
	}
	var job JobItem
	if err := attributevalue.UnmarshalMap(out.Item, &job); err != nil {
		writeInternalError(w, "confirm: unmarshal", err)
		return
	}

	if job.Status == JobStatusPublished && job.OrderID == req.OrderID {
		writePaymentConfirmed(w)
		return
	}
	if job.Status != JobStatusPending {
		http.Error(w, errJobNotPending.Error(), http.StatusConflict)
		return
	}
	if job.OrderID == "" || job.OrderID != req.OrderID || job.Amount != req.Amount {
		http.Error(w, "order does not match", http.StatusBadRequest)
		return
	}

	err = a.Payments.Confirm(r.Context(), payment.ConfirmRequest{
		PaymentKey: req.PaymentKey,
		OrderID:    job.OrderID,
		Amount:     job.Amount,
	})
	if errors.Is(err, payment.ErrDeclined) {
		http.Error(w, "payment declined", http.StatusPaymentRequired)
		return
	}
	if err != nil {
		writeInternalError(w, "confirm: provider", err)
		return
	}

	if err := a.publishJob(r.Context(), job.ID, job.OrderID, req.PaymentKey); err != nil {
		if errors.Is(err, errJobNotPending) {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}
		writeInternalError(w, "confirm: publish", err)
		return
	}

	writePaymentConfirmed(w)
}

func (a *App) publishJob(ctx context.Context, jobID, orderID, paymentKey string) error {
	_, err := a.DB.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName:           &a.TableName,
		Key:                 jobKey(jobID),
		UpdateExpression:    new("SET #status = :published, paymentKey = :paymentKey"),
		ConditionExpression: new("#status = :pending AND orderId = :orderId"),
		ExpressionAttributeNames: map[string]string{
			"#status": "status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":published":  &types.AttributeValueMemberS{Value: JobStatusPublished},
			":pending":    &types.AttributeValueMemberS{Value: JobStatusPending},
			":orderId":    &types.AttributeValueMemberS{Value: orderID},
			":paymentKey": &types.AttributeValueMemberS{Value: paymentKey},
		},
	})
	var notPending *types.ConditionalCheckFailedException
	if errors.As(err, &notPending) {
		return errJobNotPending
	}
	return err
}

func writePaymentConfirmed(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]string{"status": JobStatusPublished}); err != nil {
		log.Printf("confirm: write response: %v", err)
	}
}
