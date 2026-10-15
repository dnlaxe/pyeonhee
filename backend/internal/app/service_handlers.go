package app

import "net/http"

func (a *App) listService(w http.ResponseWriter, r *http.Request) {
	items, err := a.Store.ListPublishedService(r.Context())
	if err != nil {
		writeInternalError(w, "listService", err)
		return
	}

	services := make([]ServiceResponse, 0, len(items))
	for _, item := range items {
		service := toServiceResponse(item)
		service.Logo = a.mediaURL(service.Logo)
		services = append(services, service)
	}

	writeJSON(w, http.StatusOK, services)
}
