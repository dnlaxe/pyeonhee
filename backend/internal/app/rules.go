package app

import "regexp"

// Must match frontend/src/config.ts.
const (
	maxEmailLength        = 254
	minTitleLength        = 2
	maxTitleLength        = 120
	minLocationLength     = 2
	maxLocationLength     = 100
	maxPriceLength        = 60
	maxWebpageLength      = 500
	minBodyLength         = 40
	maxBodyLength         = 5000
	minShortMessageLength = 10
	maxShortMessageLength = 2000

	maxPhotoBytes   = 2 << 20
	maxMarketImages = 3
)

var (
	emailPattern   = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	webpagePattern = regexp.MustCompile(`(?i)^https?://.+`)

	photoExt = map[string]string{
		"image/jpeg": "jpg",
		"image/png":  "png",
		"image/webp": "webp",
	}

	emailOptions        = []string{"hide", "show"}
	jobEmploymentTypes  = []string{"Full Time", "Part Time", "Internship"}
	jobTeachingAreas    = []string{"English Teaching", "High School", "University", "Kindergarten", "Private Tutoring"}
	jobNonTeachingAreas = []string{"Front End", "Back End", "Accounting", "Hospitality", "Marketing", "Design", "Customer Service", "Sports", "Other"}
	jobKoreanLevels     = []string{"No Korean required", "Basic Korean required", "Conversational Korean required", "Fluent Korean required"}

	marketListingTypes = []string{"Selling", "Wanted", "Free"}
	marketCategories   = []string{"Furniture", "Electronics", "Clothing", "Kitchen", "Books", "Sports"}

	serviceCategories = []string{
		"Visa",
		"Translation",
		"Legal",
		"Housing",
		"Banking",
		"Phone & SIM",
		"Moving",
		"Tutoring",
		"Healthcare",
		"Business setup",
	}
)
