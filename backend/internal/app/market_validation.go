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

const maxMarketImages = 3

// Must match frontend/src/features/post/constants.ts.
var (
	marketListingTypes = []string{"Selling", "Wanted", "Free"}
	marketCategories   = []string{"Furniture", "Electronics", "Clothing", "Kitchen", "Books", "Sports"}
)

func (r CreateMarketRequest) validate() map[string]string {
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

	if !slices.Contains(marketListingTypes, r.ListingType) {
		errs["listingType"] = "Choose a listing type."
	}

	if !slices.Contains(marketCategories, r.Category) {
		errs["category"] = "Choose a category."
	}

	if r.Price == "" {
		errs["price"] = "Add a price."
	} else if utf8.RuneCountInString(r.Price) > maxJobTitleLength {
		errs["price"] = "Shorten the price."
	}

	n := utf8.RuneCountInString(r.Description)
	switch {
	case n == 0:
		errs["description"] = "Add a description."
	case n < minJobDescriptionLength:
		errs["description"] = "Add a little more detail about the item."
	case n > maxJobDescriptionLength:
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
