package app

// Listing responses are full detail payloads plus kind, so the feed cache
// can hydrate detail pages without a second round-trip.

type jobListing struct {
	Kind string `json:"kind"`
	JobResponse
}

type marketListing struct {
	Kind string `json:"kind"`
	MarketResponse
}

type serviceListing struct {
	Kind string `json:"kind"`
	ServiceResponse
}
