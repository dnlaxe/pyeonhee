package app

import (
	"slices"
	"strings"
	"unicode/utf8"
)

func (r *CreateMarketRequest) normalize() {
	r.Email = strings.TrimSpace(r.Email)
	r.EmailOption = strings.TrimSpace(r.EmailOption)
	r.Title = strings.TrimSpace(r.Title)
	r.Location = strings.TrimSpace(r.Location)
	r.ListingType = strings.TrimSpace(r.ListingType)
	r.Category = strings.TrimSpace(r.Category)
	r.Price = strings.TrimSpace(r.Price)
	r.Description = strings.TrimSpace(r.Description)
	for i, image := range r.Images {
		r.Images[i] = strings.TrimSpace(image)
	}
}

func (r CreateMarketRequest) validate() map[string]string {
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

	if !slices.Contains(marketListingTypes, r.ListingType) {
		errs["listingType"] = "Choose a listing type."
	}

	if !slices.Contains(marketCategories, r.Category) {
		errs["category"] = "Choose a category."
	}

	if r.Price == "" {
		errs["price"] = "Add a price."
	} else if utf8.RuneCountInString(r.Price) > maxPriceLength {
		errs["price"] = "Shorten the price."
	}

	n := utf8.RuneCountInString(r.Description)
	switch {
	case n == 0:
		errs["description"] = "Add a description."
	case n < minBodyLength:
		errs["description"] = "Add a little more detail about the item."
	case n > maxBodyLength:
		errs["description"] = "Shorten the description."
	}

	if len(r.Images) > maxMarketImages {
		errs["images"] = "Attach up to 3 photos."
	} else {
		if slices.Contains(r.Images, "") {
			errs["images"] = "Upload the photo again."
		}
	}

	return errs
}
