package main

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/lambda"
	chiadapter "github.com/awslabs/aws-lambda-go-api-proxy/chi"
	"github.com/dnlaxe/pyeonhee/backend/internal/app"
	"github.com/dnlaxe/pyeonhee/backend/internal/config"
)

func main() {
	cfg, err := config.Load("")
	if err != nil {
		log.Fatal(err)
	}

	a, err := app.New(context.Background(), cfg)
	if err != nil {
		log.Fatal(err)
	}

	r := a.NewRouter()
	adapter := chiadapter.NewV2(r)
	lambda.Start(adapter.ProxyWithContextV2)
}
