package app

import (
	"encoding/json"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/go-chi/chi/v5"
)

func (a *App) listJobs(w http.ResponseWriter, r *http.Request) {

	out, err := a.DB.Scan(r.Context(), &dynamodb.ScanInput{
		TableName: &a.TableName,
	})
	if err != nil {
		writeInternalError(w, "listJobs: scan", err)
		return
	}

	var jobs []Job
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &jobs); err != nil {
		writeInternalError(w, "listJobs: unmarshal", err)
		return
	}
	if jobs == nil {
		jobs = []Job{}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(jobs); err != nil {
		writeInternalError(w, "listJobs: encode", err)
		return
	}
}

func (a *App) getJob(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	out, err := a.DB.GetItem(r.Context(), &dynamodb.GetItemInput{
		TableName: &a.TableName,
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
	})

	if err != nil {
		writeInternalError(w, "getJob: get item", err)
		return
	}

	if out.Item == nil {
		http.Error(w, "job not found", http.StatusNotFound)
		return
	}

	var job Job
	if err := attributevalue.UnmarshalMap(out.Item, &job); err != nil {
		writeInternalError(w, "getJob: unmarshal", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(job); err != nil {
		writeInternalError(w, "getJob: encode", err)
		return
	}
}
