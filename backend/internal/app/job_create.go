package app

import (
	"crypto/rand"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

func (a *App) createJob(w http.ResponseWriter, r *http.Request) {
	var req CreateJobRequest
	data := json.NewDecoder(r.Body)
	data.DisallowUnknownFields()
	if err := data.Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if err := a.BotCheck.Verify(r.Context(), req.Password); err != nil {
		writeBotCheckError(w, err)
		return
	}

	req.Normalize()
	if errs := req.Validate(); len(errs) > 0 {
		writeValidationErrors(w, errs)
		return
	}

	id := rand.Text()
	item, err := attributevalue.MarshalMap(req.ToJobItem(id, time.Now()))
	if err != nil {
		writeInternalError(w, "create job item marshalling error", err)
		return
	}

	if _, err := a.DB.PutItem(r.Context(), &dynamodb.PutItemInput{
		TableName:           &a.TableName,
		Item:                item,
		ConditionExpression: new("attribute_not_exists(PK)"),
	}); err != nil {
		writeInternalError(w, "create job item put error", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(map[string]string{"id": id}); err != nil {
		log.Printf("create job: write response: %v", err)
	}

}
