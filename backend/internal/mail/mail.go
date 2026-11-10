package mail

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/ses/types"
)

type Sender interface {
	SendPublished(ctx context.Context, to, title, link string) error
	SendContact(ctx context.Context, to, reply, title, link, message string) error
}

type SES struct {
	client *ses.Client
	from   string
}

func New(ctx context.Context, from string) (Sender, error) {
	if from == "" {
		return Nop{}, nil
	}
	cfg, err := awsconfig.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}
	return SES{client: ses.NewFromConfig(cfg), from: from}, nil
}

type Nop struct{}

func (Nop) SendPublished(ctx context.Context, to, title, link string) error {
	return nil
}

func (Nop) SendContact(ctx context.Context, to, reply, title, link, message string) error {
	return fmt.Errorf("mail not configured")
}

func (s SES) SendPublished(ctx context.Context, to, title, link string) error {
	if to == "" {
		return nil
	}
	subject := "Your post is published"
	body := fmt.Sprintf("%s is live.\n\n%s\n", title, link)

	_, err := s.client.SendEmail(ctx, &ses.SendEmailInput{
		Source: aws.String(s.from),
		Destination: &types.Destination{
			ToAddresses: []string{to},
		},
		Message: &types.Message{
			Subject: &types.Content{Data: aws.String(subject)},
			Body: &types.Body{
				Text: &types.Content{Data: aws.String(body)},
			},
		},
	})
	return err
}

func (s SES) SendContact(ctx context.Context, to, replyTo, title, link, message string) error {
	if to == "" || replyTo == "" {
		return fmt.Errorf("missing contact address")
	}
	subject := fmt.Sprintf("Message about: %s", title)
	body := fmt.Sprintf("Someone messaged you on Pyeonhee about: \n%s\n\nFrom: %s\n\n%s\n", link, replyTo, message)

	_, err := s.client.SendEmail(ctx, &ses.SendEmailInput{
		Source: aws.String(s.from),
		Destination: &types.Destination{
			ToAddresses: []string{to},
		},
		ReplyToAddresses: []string{replyTo},
		Message: &types.Message{
			Subject: &types.Content{Data: aws.String(subject)},
			Body: &types.Body{
				Text: &types.Content{Data: aws.String(body)},
			},
		},
	})
	return err
}
