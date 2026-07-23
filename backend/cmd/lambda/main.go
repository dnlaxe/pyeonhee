package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	chiadapter "github.com/awslabs/aws-lambda-go-api-proxy/chi"
	"github.com/dnlaxe/pyeonhee/backend/internal/app"
)

func main() {
	r := app.NewRouter()
	adapter := chiadapter.NewV2(r)
	lambda.Start(adapter.ProxyWithContextV2)
}
