package app

import (
	"time"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

const (
	JobSortKeyMeta     = "META"
	JobEntityType      = "job"
	JobStatusPending   = "pending"
	JobStatusPublished = "published"
)

type JobItem struct {
	PK             string   `dynamodbav:"PK"`
	SK             string   `dynamodbav:"SK"`
	EntityType     string   `dynamodbav:"entityType"`
	ID             string   `dynamodbav:"id"`
	Title          string   `dynamodbav:"title"`
	Location       string   `dynamodbav:"location"`
	EmploymentType string   `dynamodbav:"employmentType"`
	Track          string   `dynamodbav:"track"`
	Tags           []string `dynamodbav:"tags"`
	Area           string   `dynamodbav:"area"`
	Korean         string   `dynamodbav:"korean,omitempty"`
	Description    string   `dynamodbav:"description"`
	Logo           string   `dynamodbav:"logo,omitempty"`
	Pinned         bool     `dynamodbav:"pinned"`
	Status         string   `dynamodbav:"status"`
	CreatedAt      string   `dynamodbav:"createdAt"`
	PosterEmail    string   `dynamodbav:"posterEmail"`
	EmailOption    string   `dynamodbav:"emailOption"`
	OrderID        string   `dynamodbav:"orderId,omitempty"`
	Amount         int64    `dynamodbav:"amount,omitempty"`
	PaymentKey     string   `dynamodbav:"paymentKey,omitempty"`
}

type JobResponse struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Location    string   `json:"location"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
	Logo        string   `json:"logo,omitempty"`
	Pinned      bool     `json:"pinned"`
	Email       string   `json:"email,omitempty"`
	Status      string   `json:"status"`
	CreatedAt   string   `json:"createdAt"`
}

type CreateJobRequest struct {
	Email          string `json:"email"`
	EmailOption    string `json:"emailOption"`
	Title          string `json:"title"`
	Location       string `json:"location"`
	EmploymentType string `json:"employmentType"`
	Track          string `json:"track"`
	Area           string `json:"area"`
	Korean         string `json:"korean"`
	Description    string `json:"description"`
	Pinned         bool   `json:"pinned"`
	Password       string `json:"password"`
}

func JobPK(id string) string {
	return "JOB#" + id
}

func jobKey(id string) map[string]types.AttributeValue {
	return map[string]types.AttributeValue{
		"PK": &types.AttributeValueMemberS{Value: JobPK(id)},
		"SK": &types.AttributeValueMemberS{Value: JobSortKeyMeta},
	}
}

func (item JobItem) ToJobResponse() JobResponse {
	tags := item.Tags
	if tags == nil {
		tags = []string{}
	}
	job := JobResponse{
		ID:          item.ID,
		Title:       item.Title,
		Location:    item.Location,
		Description: item.Description,
		Tags:        tags,
		Logo:        item.Logo,
		Pinned:      item.Pinned,
		Status:      item.Status,
		CreatedAt:   item.CreatedAt,
	}
	if item.EmailOption == "show" {
		job.Email = item.PosterEmail
	}
	return job
}

func (r CreateJobRequest) ToJobItem(id string, now time.Time) JobItem {
	return JobItem{
		PK:             JobPK(id),
		SK:             JobSortKeyMeta,
		EntityType:     JobEntityType,
		ID:             id,
		Title:          r.Title,
		Location:       r.Location,
		EmploymentType: r.EmploymentType,
		Track:          r.Track,
		Area:           r.Area,
		Korean:         r.Korean,
		Description:    r.Description,
		Tags:           []string{r.EmploymentType, r.Track, r.Area, r.Korean},
		Pinned:         r.Pinned,
		Status:         JobStatusPending,
		CreatedAt:      now.UTC().Format(time.RFC3339),
		PosterEmail:    r.Email,
		EmailOption:    r.EmailOption,
	}
}
