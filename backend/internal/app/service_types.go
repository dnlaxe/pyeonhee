package app

import "github.com/dnlaxe/pyeonhee/backend/internal/store"

type ServiceResponse struct {
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

func toServiceResponse(item store.ServiceItem) ServiceResponse {
	tags := item.Tags
	if tags == nil {
		tags = []string{}
	}
	return ServiceResponse{
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
