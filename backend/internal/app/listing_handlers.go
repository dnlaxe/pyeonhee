package app

import (
	"net/http"
	"sort"
)

type listingEntry struct {
	pinned    bool
	createdAt string
	payload   any
}

func (a *App) listListings(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	published, err := a.Store.ListPublished(ctx)
	if err != nil {
		writeInternalError(w, "listListings", err)
		return
	}

	entries := make([]listingEntry, 0, len(published.Jobs)+len(published.Market)+len(published.Services))

	for _, item := range published.Jobs {
		job := toJobResponse(item)
		job.Logo = a.mediaURL(job.Logo)
		entries = append(entries, listingEntry{
			pinned:    job.Pinned,
			createdAt: job.CreatedAt,
			payload:   jobListing{Kind: "job", JobResponse: job},
		})
	}
	for _, item := range published.Market {
		m := toMarketResponse(item)
		m.Images = a.mediaURLs(m.Images)
		entries = append(entries, listingEntry{
			pinned:    m.Pinned,
			createdAt: m.CreatedAt,
			payload:   marketListing{Kind: "market", MarketResponse: m},
		})
	}
	for _, item := range published.Services {
		s := toServiceResponse(item)
		s.Logo = a.mediaURL(s.Logo)
		entries = append(entries, listingEntry{
			pinned:    false,
			createdAt: s.CreatedAt,
			payload:   serviceListing{Kind: "service", ServiceResponse: s},
		})
	}

	sort.SliceStable(entries, func(i, j int) bool {
		if entries[i].pinned != entries[j].pinned {
			return entries[i].pinned
		}
		return entries[i].createdAt > entries[j].createdAt
	})

	out := make([]any, len(entries))
	for i, e := range entries {
		out[i] = e.payload
	}
	writeJSON(w, http.StatusOK, out)
}
