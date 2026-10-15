package app

import (
	"regexp"
	"slices"
	"strings"
	"unicode/utf8"
)

const (
	minJobDescriptionLength = 40
	maxJobDescriptionLength = 5000
	maxJobTitleLength       = 120
	maxJobLocationLength    = 100
)

// Must match frontend/src/features/post/constants.ts.
var (
	jobEmailOptions     = []string{"hide", "show"}
	jobEmploymentTypes  = []string{"Full Time", "Part Time", "Internship"}
	jobTeachingAreas    = []string{"English Teaching", "High School", "University", "Kindergarten", "Private Tutoring"}
	jobNonTeachingAreas = []string{"Front End", "Back End", "Accounting", "Hospitality", "Marketing", "Design", "Customer Service", "Sports", "Other"}
	jobKoreanLevels     = []string{"No Korean required", "Basic Korean required", "Conversational Korean required", "Fluent Korean required"}
)

var emailPattern = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

func (r *CreateJobRequest) normalize() {
	r.Email = strings.TrimSpace(r.Email)
	r.EmailOption = strings.TrimSpace(r.EmailOption)
	r.Title = strings.TrimSpace(r.Title)
	r.Location = strings.TrimSpace(r.Location)
	r.EmploymentType = strings.TrimSpace(r.EmploymentType)
	r.Track = strings.TrimSpace(r.Track)
	r.Area = strings.TrimSpace(r.Area)
	r.Korean = strings.TrimSpace(r.Korean)
	r.Description = strings.TrimSpace(r.Description)
}

func (r CreateJobRequest) validate() map[string]string {
	errs := map[string]string{}

	if r.Email == "" {
		errs["email"] = "Enter an email address."
	} else if !emailPattern.MatchString(r.Email) {
		errs["email"] = "Enter a full email address, like name@example.com."
	}

	if !slices.Contains(jobEmailOptions, r.EmailOption) {
		errs["emailOption"] = "Choose whether to show your email."
	}

	if r.Title == "" {
		errs["title"] = "Add a post title."
	} else if utf8.RuneCountInString(r.Title) > maxJobTitleLength {
		errs["title"] = "Shorten the post title."
	}

	if r.Location == "" {
		errs["location"] = "Add a location."
	} else if utf8.RuneCountInString(r.Location) > maxJobLocationLength {
		errs["location"] = "Shorten the location."
	}

	if !slices.Contains(jobEmploymentTypes, r.EmploymentType) {
		errs["employmentType"] = "Choose an employment type."
	}

	switch r.Track {
	case "Teaching":
		if !slices.Contains(jobTeachingAreas, r.Area) {
			errs["area"] = "Choose a job area."
		}
	case "Non-teaching":
		if !slices.Contains(jobNonTeachingAreas, r.Area) {
			errs["area"] = "Choose a job area."
		}
	default:
		errs["track"] = "Choose teaching or non-teaching."
	}

	if !slices.Contains(jobKoreanLevels, r.Korean) {
		errs["korean"] = "Choose a Korean requirement."
	}

	n := utf8.RuneCountInString(r.Description)
	switch {
	case n == 0:
		errs["description"] = "Add a description."
	case n < minJobDescriptionLength:
		errs["description"] = "Add a little more detail about the job."
	case n > maxJobDescriptionLength:
		errs["description"] = "Shorten the description."
	}

	return errs
}
