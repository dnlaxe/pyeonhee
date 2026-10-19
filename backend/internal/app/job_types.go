package app

import (
	"time"

	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

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
	Logo           string `json:"logo,omitempty"`
	Track          string `json:"track"`
	Area           string `json:"area"`
	Korean         string `json:"korean"`
	Description    string `json:"description"`
	Pinned         bool   `json:"pinned"`
	Password       string `json:"password"`
}

func toJobResponse(item store.JobItem) JobResponse {
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

func (r CreateJobRequest) toJobItem(id string, now time.Time) store.JobItem {
	return store.JobItem{
		PK:             store.JobPK(id),
		SK:             store.SortKeyMeta,
		EntityType:     store.EntityJob,
		ID:             id,
		Title:          r.Title,
		Location:       r.Location,
		EmploymentType: r.EmploymentType,
		Track:          r.Track,
		Area:           r.Area,
		Logo:           r.Logo,
		Korean:         r.Korean,
		Description:    r.Description,
		Tags:           []string{r.EmploymentType, r.Track, r.Area, r.Korean},
		Pinned:         r.Pinned,
		Status:         store.StatusPending,
		CreatedAt:      now.UTC().Format(time.RFC3339),
		PosterEmail:    r.Email,
		EmailOption:    r.EmailOption,
	}
}
