package app

import (
	"net/http"
	"sort"
)

type ListingsResponse struct {
	Jobs     []JobResponse     `json:"jobs"`
	Market   []MarketResponse  `json:"market"`
	Services []ServiceResponse `json:"services"`
}

func (a *App) listListings(w http.ResponseWriter, r *http.Request) {
	published, err := a.Store.ListPublishedListings(r.Context())
	if err != nil {
		writeInternalError(w, "listListings", err)
		return
	}

	jobs := make([]JobResponse, 0, len(published.Jobs))
	for _, item := range published.Jobs {
		job := toJobResponse(item)
		job.Logo = a.mediaURL(job.Logo)
		jobs = append(jobs, job)
	}
	sort.SliceStable(jobs, func(i, j int) bool {
		if jobs[i].Pinned != jobs[j].Pinned {
			return jobs[i].Pinned
		}
		return jobs[i].CreatedAt > jobs[j].CreatedAt
	})

	market := make([]MarketResponse, 0, len(published.Market))
	for _, item := range published.Market {
		m := toMarketResponse(item)
		m.Images = a.mediaURLs(m.Images)
		market = append(market, m)
	}
	sort.SliceStable(market, func(i, j int) bool {
		if market[i].Pinned != market[j].Pinned {
			return market[i].Pinned
		}
		return market[i].CreatedAt > market[j].CreatedAt
	})

	services := make([]ServiceResponse, 0, len(published.Services))
	for _, item := range published.Services {
		svc := toServiceResponse(item)
		svc.Logo = a.mediaURL(svc.Logo)
		services = append(services, svc)
	}
	sort.SliceStable(services, func(i, j int) bool {
		return services[i].CreatedAt > services[j].CreatedAt
	})

	writeJSON(w, http.StatusOK, ListingsResponse{
		Jobs:     jobs,
		Market:   market,
		Services: services,
	})
}
