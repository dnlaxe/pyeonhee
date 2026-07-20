package main

import (
	"context"
	"encoding/json"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type Job struct {
	ID      string `json:"id" dynamodbav:"id"`
	Title   string `json:"title" dynamodbav:"title"`
	Company string `json:"company" dynamodbav:"company"`
}

func handler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	if req.RequestContext.HTTP.Method != "GET" || req.RawPath != "/jobs" {
		return events.APIGatewayV2HTTPResponse{
			StatusCode: 404,
			Body:       "not found",
		}, nil
	}

	tableName := os.Getenv("TABLE_NAME")
	if tableName == "" {
		return events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       "TABLE_NAME not set",
		}, nil
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return events.APIGatewayV2HTTPResponse{StatusCode: 500, Body: err.Error()}, nil
	}

	client := dynamodb.NewFromConfig(cfg)
	out, err := client.Scan(ctx, &dynamodb.ScanInput{
		TableName: &tableName,
	})
	if err != nil {
		return events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       err.Error(),
		}, nil
	}

	var jobs []Job
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &jobs); err != nil {
		return events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       err.Error(),
		}, nil
	}

	if jobs == nil {
		jobs = []Job{}
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
