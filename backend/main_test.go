package main

import (
	"context"
	"testing"

	"github.com/aws/aws-lambda-go/events"
)

func TestHandlerListsJobs(t *testing.T) {
	resp, err := handler(context.Background(), events.APIGatewayV2HTTPRequest{
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
	resp, err := handler(context.Background(), events.APIGatewayV2HTTPRequest{
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
