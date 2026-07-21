package main

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cloudformation"
)

func main() {
	ctx := context.Background()

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		fmt.Fprintf(os.Stderr, "load AWS config: %v\n", err)
		os.Exit(1)
	}

	client := cloudformation.NewFromConfig(cfg)

	out, err := client.DescribeStacks(ctx, &cloudformation.DescribeStacksInput{
		StackName: aws.String("InfraStack"),
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "describe stack: %v/n", err)
		os.Exit(1)
	}

	if len(out.Stacks) == 0 {
		fmt.Fprintln(os.Stderr, "stack InfraStack not found")
		os.Exit(1)
	}

	apiURL := ""
	for _, output := range out.Stacks[0].Outputs {
		key := aws.ToString(output.OutputKey)
		value := aws.ToString(output.OutputValue)

		if key == "ApiUrl" {
			apiURL = value
			break
		}
	}

	if apiURL == "" {
		fmt.Fprintf(os.Stderr, "output ApiUrl not found")
		os.Exit(1)
	}

	githubOutput := os.Getenv("GITHUB_OUTPUT")
	if githubOutput == "" {
		fmt.Fprintln(os.Stderr, "GITHUB_OUTPUT is not set")
		os.Exit(1)
	}

	f, err := os.OpenFile(githubOutput, os.O_APPEND|os.O_WRONLY, 0)
	if err != nil {
		fmt.Fprintf(os.Stderr, "open GITHUB_OUTPUT: %v\n", err)
		os.Exit(1)
	}
	defer f.Close()

	if _, err := fmt.Fprintf(f, "url=%s\n", apiURL); err != nil {
		fmt.Fprintf(os.Stderr, "write GITHUB_OUTPUT: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Using API_URL=", apiURL)
}
