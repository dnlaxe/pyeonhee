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

	r.Route("/api", func(r chi.Router) {
		r.Get("/listings", a.listListings)

		r.Get("/jobs/{id}", a.getJob)
		r.Get("/services/{id}", a.getService)
		r.Get("/market/{id}", a.getMarket)

		r.Post("/photos", a.createPhoto)

		r.Post("/jobs", a.createJob)
		r.Post("/market", a.createMarket)
		r.Post("/services", a.createService)

		r.Post("/payments/checkout", a.checkout)
		r.Post("/payments/confirm", a.confirmPayment)

		r.Post("/contact", a.contact)
	})

	return r
}
