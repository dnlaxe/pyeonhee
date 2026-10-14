package app

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

const (
	jobPriceKRW  = 5000
	jobOrderName = "pyeonhee job post"
)

type checkoutRequest struct {
	JobID string `json:"jobId"`
}

type checkoutResponse struct {
	OrderID   string `json:"orderId"`
	Amount    int64  `json:"amount"`
	OrderName string `json:"orderName"`
}

func (a *App) checkout(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<10)

	var req checkoutRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil || req.JobID == "" {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	orderID := rand.Text()

	_, err := a.DB.UpdateItem(r.Context(), &dynamodb.UpdateItemInput{
		TableName:           &a.TableName,
		Key:                 jobKey(req.JobID),
		UpdateExpression:    new("SET orderId = :orderId, amount = :amount"),
		ConditionExpression: new("attribute_exists(PK) AND #status = :pending"),
		ExpressionAttributeNames: map[string]string{
			"#status": "status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":orderId": &types.AttributeValueMemberS{Value: orderID},
			":amount":  &types.AttributeValueMemberN{Value: strconv.Itoa(jobPriceKRW)},
			":pending": &types.AttributeValueMemberS{Value: JobStatusPending},
		},
	})
	if err != nil {
		var notPending *types.ConditionalCheckFailedException
		if errors.As(err, &notPending) {
			http.Error(w, "job is not awaiting payment", http.StatusConflict)
			return
		}
		writeInternalError(w, "checkout: update item", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(checkoutResponse{
		OrderID:   orderID,
		Amount:    jobPriceKRW,
		OrderName: jobOrderName,
	}); err != nil {
		log.Printf("checkout: write response: %v", err)
	}
}
