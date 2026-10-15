package app

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"net/http"
	"sort"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/dnlaxe/pyeonhee/backend/internal/store"
)

func (a *App) listJob(w http.ResponseWriter, r *http.Request) {
	items, err := a.Store.ListPublishedJob(r.Context())
	if err != nil {
		writeInternalError(w, "listJob", err)
		return
	}

	jobs := make([]JobResponse, 0, len(items))
	for _, item := range items {
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

	writeJSON(w, http.StatusOK, jobs)
}

func (a *App) getJob(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	item, err := a.Store.GetJob(r.Context(), id)
	if errors.Is(err, store.ErrNotFound) || (err == nil && item.Status != store.StatusPublished) {
		http.Error(w, "job not found", http.StatusNotFound)
		return
	}
	if err != nil {
		writeInternalError(w, "getJob", err)
		return
	}

	job := toJobResponse(item)
	job.Logo = a.mediaURL(job.Logo)
	writeJSON(w, http.StatusOK, job)
}

func (a *App) createJob(w http.ResponseWriter, r *http.Request) {
	var req CreateJobRequest
	data := json.NewDecoder(r.Body)
	data.DisallowUnknownFields()
	if err := data.Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if err := a.BotCheck.Verify(r.Context(), req.Password); err != nil {
		writeBotCheckError(w, err)
		return
	}

	req.normalize()
	if errs := req.validate(); len(errs) > 0 {
		writeValidationErrors(w, errs)
		return
	}

	id := rand.Text()
	if err := a.Store.PutJob(r.Context(), req.toJobItem(id, time.Now())); err != nil {
		writeInternalError(w, "createJob", err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{"id": id})
}
