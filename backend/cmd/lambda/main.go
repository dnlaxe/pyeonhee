package main

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/lambda"
	chiadapter "github.com/awslabs/aws-lambda-go-api-proxy/chi"
	"github.com/dnlaxe/pyeonhee/backend/internal/app"
)

func main() {
	a, err := app.New(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	r := a.NewRouter()
	adapter := chiadapter.NewV2(r)
	lambda.Start(adapter.ProxyWithContextV2)
}
