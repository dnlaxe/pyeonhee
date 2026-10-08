package app

const (
	JobSortKeyMeta = "META"
	JobEntityType  = "job"
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
}

type Job struct {
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

func JobPK(id string) string {
	return "JOB#" + id
}

func (item JobItem) ToJob() Job {
	tags := item.Tags
	if tags == nil {
		tags = []string{}
	}
	job := Job{
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
