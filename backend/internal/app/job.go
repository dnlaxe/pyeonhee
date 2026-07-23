package app

type Job struct {
	ID      string `json:"id" dynamodbav:"id"`
	Title   string `json:"title" dynamodbav:"title"`
	Company string `json:"company" dynamodbav:"company"`
}
