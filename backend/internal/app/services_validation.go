package app

import (
	"regexp"
	"slices"
	"strings"
	"unicode/utf8"
)

func (r *CreateServiceRequest) normalize() {
	r.Company = strings.TrimSpace(r.Company)
	r.Category = strings.TrimSpace(r.Category)
	r.Location = strings.TrimSpace(r.Location)
	r.Email = strings.TrimSpace(r.Email)
	r.Webpage = strings.TrimSpace(r.Webpage)
	r.Message = strings.TrimSpace(r.Message)
	r.Logo = strings.TrimSpace(r.Logo)
}

// Must match frontend/src/features/post/constants.ts.

var serviceCategories = []string{
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

var webpagePattern = regexp.MustCompile(`(?i)^https?://.+`)

func (r CreateServiceRequest) validate() map[string]string {
	errs := map[string]string{}

	if r.Company == "" {
		errs["company"] = "Add a company name."
	} else if utf8.RuneCountInString(r.Company) > maxJobTitleLength {
		errs["company"] = "Shorten the company name."
	}

	if !slices.Contains(serviceCategories, r.Category) {
		errs["category"] = "Choose a service."
	}

	if r.Location == "" {
		errs["location"] = "Add a location."
	} else if utf8.RuneCountInString(r.Location) > maxJobLocationLength {
		errs["location"] = "Shorten the location."
	}

	if r.Email == "" {
		errs["email"] = "Enter an email address."
	} else if !emailPattern.MatchString(r.Email) {
		errs["email"] = "Enter a full email address, like name@example.com."
	}

	if r.Webpage != "" && !webpagePattern.MatchString(r.Webpage) {
		errs["webpage"] = "Enter a full link, like https://example.com."
	}

	n := utf8.RuneCountInString(r.Message)
	switch {
	case n == 0:
		errs["message"] = "Add a message."
	case n < minJobDescriptionLength:
		errs["message"] = "Add a little more detail about the service."
	case n > maxJobDescriptionLength:
		errs["message"] = "Shorten the message."
	}

	return errs
}
