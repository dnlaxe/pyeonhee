package main

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type Job struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	Company string `json:"company"`
}

func handler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	if req.RequestContext.HTTP.Method != "GET" || req.RawPath != "/jobs" {
		return events.APIGatewayV2HTTPResponse{
			StatusCode: 404,
			Body:       "not found",
		}, nil
	}

	jobs := []Job{
		{ID: "1", Title: "Junior Go Developer", Company: "Seoul Startup"},
		{ID: "2", Title: "Frontend Engineer", Company: "Busan Labs"},
		{ID: "3", Title: "Cloud Intern", Company: "Han River Soft"},
	}

	body, err := json.Marshal(jobs)
	if err != nil {
		return events.APIGatewayV2HTTPResponse{StatusCode: 500, Body: err.Error()}, nil
	}

	return events.APIGatewayV2HTTPResponse{
		StatusCode: 200,
		Headers:    map[string]string{"content-type": "application/json"},
		Body:       string(body),
	}, nil
}

func main() {
	lambda.Start(handler)
}
