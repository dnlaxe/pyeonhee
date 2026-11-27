package app

import (
	"slices"
	"strings"
	"unicode/utf8"
)

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
	if r.Logo != nil {
		r.Logo.ContentType = strings.TrimSpace(r.Logo.ContentType)
	}
}

func (r CreateJobRequest) validate() map[string]string {
	errs := map[string]string{}

	if r.Email == "" {
		errs["email"] = "Enter an email address."
	} else if utf8.RuneCountInString(r.Email) > maxEmailLength {
		errs["email"] = "Shorten the email address."
	} else if !emailPattern.MatchString(r.Email) {
		errs["email"] = "Enter a full email address, like name@example.com."
	}

	if !slices.Contains(emailOptions, r.EmailOption) {
		errs["emailOption"] = "Choose whether to show your email."
	}

	titleLen := utf8.RuneCountInString(r.Title)
	switch {
	case titleLen == 0:
		errs["title"] = "Add a post title."
	case titleLen < minTitleLength:
		errs["title"] = "Make the title a little longer."
	case titleLen > maxTitleLength:
		errs["title"] = "Shorten the post title."
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
	case n < minBodyLength:
		errs["description"] = "Add a little more detail about the job."
	case n > maxBodyLength:
		errs["description"] = "Shorten the description."
	}

	if r.Logo != nil {
		if _, msg := r.Logo.validate(); msg != "" {
			errs["logo"] = msg
		}
	}

	return errs
}
