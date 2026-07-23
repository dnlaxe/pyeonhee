package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	chiadapter "github.com/awslabs/aws-lambda-go-api-proxy/chi"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Job struct {
	ID      string `json:"id" dynamodbav:"id"`
	Title   string `json:"title" dynamodbav:"title"`
	Company string `json:"company" dynamodbav:"company"`
}

func writeInternalError(w http.ResponseWriter, where string, err error) {
	if err != nil {
		log.Printf("%s: %v", where, err)
	} else {
		log.Printf("%s", where)
	}
	http.Error(w, "internal error", http.StatusInternalServerError)
}

func listJobs(w http.ResponseWriter, r *http.Request) {
	tableName := os.Getenv("TABLE_NAME")
	if tableName == "" {
		writeInternalError(w, "listJobs: TABLE_NAME not set", nil)
		return
	}

	cfg, err := config.LoadDefaultConfig(r.Context())
	if err != nil {
		writeInternalError(w, "listJobs: load config", err)
		return
	}

	client := dynamodb.NewFromConfig(cfg)
	out, err := client.Scan(r.Context(), &dynamodb.ScanInput{
		TableName: &tableName,
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

func getJob(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	tableName := os.Getenv("TABLE_NAME")
	if tableName == "" {
		writeInternalError(w, "getJob: TABLE_NAME not set", nil)
		return
	}

	cfg, err := config.LoadDefaultConfig(r.Context())
	if err != nil {
		writeInternalError(w, "getJob: load config", err)
		return
	}

	client := dynamodb.NewFromConfig(cfg)
	out, err := client.GetItem(r.Context(), &dynamodb.GetItemInput{
		TableName: &tableName,
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

func main() {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/jobs", listJobs)
	r.Get("/jobs/{id}", getJob)

	adapter := chiadapter.NewV2(r)

	lambda.Start(adapter.ProxyWithContextV2)
}
