package app

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func (a *App) NewRouter() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: a.CORSOrigins,
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Content-Type"},
		MaxAge:         300,
	}))

	r.Get("/jobs", a.listJob)
	r.Get("/jobs/{id}", a.getJob)
	r.Get("/services", a.listService)
	r.Get("/market", a.listMarket)
	r.Get("/market/{id}", a.getMarket)

	r.Post("/jobs", a.createJob)
	r.Post("/jobs/photos", a.createJobPhoto)

	r.Post("/payments/checkout", a.checkout)
	r.Post("/payments/confirm", a.confirmPayment)

	return r
}
