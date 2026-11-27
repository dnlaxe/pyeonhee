package app

import (
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
	if r.Logo != nil {
		r.Logo.ContentType = strings.TrimSpace(r.Logo.ContentType)
	}
}

func (r CreateServiceRequest) validate() map[string]string {
	errs := map[string]string{}

	companyLen := utf8.RuneCountInString(r.Company)
	switch {
	case companyLen == 0:
		errs["company"] = "Add a company name."
	case companyLen < minTitleLength:
		errs["company"] = "Make the company name a little longer."
	case companyLen > maxTitleLength:
		errs["company"] = "Shorten the company name."
	}

	if !slices.Contains(serviceCategories, r.Category) {
		errs["category"] = "Choose a service."
	}

	locationLen := utf8.RuneCountInString(r.Location)
	switch {
	case locationLen == 0:
		errs["location"] = "Add a location."
	case locationLen < minLocationLength:
		errs["location"] = "Make the location a little longer."
	case locationLen > maxLocationLength:
		errs["location"] = "Shorten the location."
	}

	if r.Email == "" {
		errs["email"] = "Enter an email address."
	} else if utf8.RuneCountInString(r.Email) > maxEmailLength {
		errs["email"] = "Shorten the email address."
	} else if !emailPattern.MatchString(r.Email) {
		errs["email"] = "Enter a full email address, like name@example.com."
	}

	if r.Webpage != "" {
		if utf8.RuneCountInString(r.Webpage) > maxWebpageLength {
			errs["webpage"] = "Shorten the link."
		} else if !webpagePattern.MatchString(r.Webpage) {
			errs["webpage"] = "Enter a full link, like https://example.com."
		}
	}

	n := utf8.RuneCountInString(r.Message)
	switch {
	case n == 0:
		errs["message"] = "Add a message."
	case n < minBodyLength:
		errs["message"] = "Add a little more detail about the service."
	case n > maxBodyLength:
		errs["message"] = "Shorten the message."
	}

	if r.Logo != nil {
		if _, msg := r.Logo.validate(); msg != "" {
			errs["logo"] = msg
		}
	}

	return errs
}
