package app

const (
	MarketSortKeyMeta = "META"
	MarketEntityType  = "market"
)

type MarketItem struct {
	PK          string   `dynamodbav:"PK"`
	SK          string   `dynamodbav:"SK"`
	EntityType  string   `dynamodbav:"entityType"`
	ID          string   `dynamodbav:"id"`
	Title       string   `dynamodbav:"title"`
	Description string   `dynamodbav:"description"`
	Images      []string `dynamodbav:"images"`
	Tags        []string `dynamodbav:"tags"`
	PosterEmail string   `dynamodbav:"posterEmail"`
	EmailOption string   `dynamodbav:"emailOption"`
	Pinned      bool     `dynamodbav:"pinned"`
	Status      string   `dynamodbav:"status"`
	CreatedAt   string   `dynamodbav:"createdAt"`
}

type Market struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Images      []string `json:"images"`
	Tags        []string `json:"tags"`
	Email       string   `json:"email,omitempty"`
	Pinned      bool     `json:"pinned"`
	Status      string   `json:"status"`
	CreatedAt   string   `json:"createdAt"`
}

func MarketPK(id string) string {
	return "MARKET#" + id
}

func (item MarketItem) ToMarket() Market {
	images := item.Images
	if images == nil {
		images = []string{}
	}
	tags := item.Tags
	if tags == nil {
		tags = []string{}
	}
	market := Market{
		ID:          item.ID,
		Title:       item.Title,
		Description: item.Description,
		Images:      images,
		Tags:        tags,
		Pinned:      item.Pinned,
		Status:      item.Status,
		CreatedAt:   item.CreatedAt,
	}
	if item.EmailOption == "show" {
		market.Email = item.PosterEmail
	}
	return market
}
