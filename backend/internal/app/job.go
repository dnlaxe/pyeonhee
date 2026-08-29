package app

const (
	JobSortKeyMeta = "META"
)

type JobItem struct {
	PK          string   `dynamodbav:"PK"`
	SK          string   `dynamodbav:"SK"`
	EntityType  string   `dynamodbav:"entityType"`
	ID          string   `dynamodbav:"id"`
	Title       string   `dynamodbav:"title"`
	Location    string   `dynamodbav:"location"`
	Description string   `dynamodbav:"description"`
	Tags        []string `dynamodbav:"tags"`
	Initials    string   `dynamodbav:"initials"`
	Level       int      `dynamodbav:"level"`
	Status      string   `dynamodbav:"status"`
	CreatedAt   string   `dynamodbav:"createdAt"`
}

type Job struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Location    string   `json:"location"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
	Initials    string   `json:"initials"`
	Level       int      `json:"level"`
	Status      string   `json:"status"`
	CreatedAt   string   `json:"createdAt"`
}

func JobPK(id string) string {
	return "JOB#" + id
}

func (item JobItem) ToJob() Job {
	tags := item.Tags
	if tags == nil {
		tags = []string{}
	}
	return Job{
		ID:          item.ID,
		Title:       item.Title,
		Location:    item.Location,
		Description: item.Description,
		Tags:        tags,
		Initials:    item.Initials,
		Level:       item.Level,
		Status:      item.Status,
		CreatedAt:   item.CreatedAt,
	}
}
