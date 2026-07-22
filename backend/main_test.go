package main

import (
	"context"
	"os"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	chiadapter "github.com/awslabs/aws-lambda-go-api-proxy/chi"
	"github.com/go-chi/chi/v5"
)

func newTestAdapter() *chiadapter.ChiLambdaV2 {
	r := chi.NewRouter()
	r.Get("/jobs", listJobs)
	return chiadapter.NewV2(r)
}

func TestHandlerListsJobs(t *testing.T) {
	if os.Getenv("TABLE_NAME") == "" {
		t.Skip("TABLE_NAME is not set - tested in AWS after deploy")
	}

	adapter := newTestAdapter()
	resp, err := adapter.ProxyWithContextV2(context.Background(), events.APIGatewayV2HTTPRequest{
		RawPath: "/jobs",
		RequestContext: events.APIGatewayV2HTTPRequestContext{
			HTTP: events.APIGatewayV2HTTPRequestContextHTTPDescription{
				Method: "GET",
			},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 200 {
		t.Fatalf("status = %d", resp.StatusCode)
	}
	if resp.Body == "" || resp.Body[0] != '[' {
		t.Fatalf("expected json array but got: %q", resp.Body)
	}
}

func TestHandlerNotFound(t *testing.T) {
	adapter := newTestAdapter()
	resp, err := adapter.ProxyWithContextV2(context.Background(), events.APIGatewayV2HTTPRequest{
		RawPath: "/nope",
		RequestContext: events.APIGatewayV2HTTPRequestContext{
			HTTP: events.APIGatewayV2HTTPRequestContextHTTPDescription{
				Method: "GET",
			},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if resp.StatusCode != 404 {
		t.Fatalf("status = %d", resp.StatusCode)
	}
}
