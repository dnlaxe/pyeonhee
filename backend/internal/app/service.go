package app

const (
	ServiceSortKeyMeta = "META"
	ServiceEntityType  = "service"
)

type ServiceItem struct {
	PK         string   `dynamodbav:"PK"`
	SK         string   `dynamodbav:"SK"`
	EntityType string   `dynamodbav:"entityType"`
	ID         string   `dynamodbav:"id"`
	Company    string   `dynamodbav:"company"`
	Location   string   `dynamodbav:"location"`
	Logo       string   `dynamodbav:"logo"` // image URL for now
	Blurb      string   `dynamodbav:"blurb"`
	Contact    string   `dynamodbav:"contact"`
	Webpage    string   `dynamodbav:"webpage,omitempty"`
	Tags       []string `dynamodbav:"tags"`
	Status     string   `dynamodbav:"status"`
	CreatedAt  string   `dynamodbav:"createdAt"`
}
type Service struct {
	ID        string   `json:"id"`
	Company   string   `json:"company"`
	Location  string   `json:"location"`
	Logo      string   `json:"logo"`
	Blurb     string   `json:"blurb"`
	Contact   string   `json:"contact"`
	Webpage   string   `json:"webpage,omitempty"`
	Tags      []string `json:"tags"`
	Status    string   `json:"status"`
	CreatedAt string   `json:"createdAt"`
}

func ServicePK(id string) string {
	return "SERVICE#" + id
}

func (item ServiceItem) ToService() Service {
	tags := item.Tags
	if tags == nil {
		tags = []string{}
	}
	return Service{
		ID:        item.ID,
		Company:   item.Company,
		Location:  item.Location,
		Logo:      item.Logo,
		Blurb:     item.Blurb,
		Contact:   item.Contact,
		Webpage:   item.Webpage,
		Tags:      tags,
		Status:    item.Status,
		CreatedAt: item.CreatedAt,
	}
}
