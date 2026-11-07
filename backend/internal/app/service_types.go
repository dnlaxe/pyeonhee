package app

import (
	"time"

	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

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

type CreateServiceRequest struct {
	Company  string `json:"company"`
	Category string `json:"category"`
	Location string `json:"location"`
	Email    string `json:"email"`
	Webpage  string `json:"webpage,omitempty"`
	Message  string `json:"message"`
	Logo     string `json:"logo,omitempty"`
	Password string `json:"password"`
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

func (r CreateServiceRequest) toServiceItem(id string, now time.Time) store.ServiceItem {
	return store.ServiceItem{
		PK:         store.ServicePK(id),
		SK:         store.SortKeyMeta,
		EntityType: store.EntityService,
		ID:         id,
		Company:    r.Company,
		Location:   r.Location,
		Logo:       r.Logo,
		Blurb:      r.Message,
		Contact:    r.Email,
		Webpage:    r.Webpage,
		Tags:       []string{r.Category},
		Status:     store.StatusPending,
		CreatedAt:  now.UTC().Format(time.RFC3339),
	}
}
