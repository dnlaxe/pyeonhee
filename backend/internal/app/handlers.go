package app

import (
	"encoding/json"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/go-chi/chi/v5"
)

func (a *App) listJobs(w http.ResponseWriter, r *http.Request) {

	out, err := a.DB.Scan(r.Context(), &dynamodb.ScanInput{
		TableName:        &a.TableName,
		FilterExpression: new("SK = :meta AND #status = :published AND entityType = :job"),
		ExpressionAttributeNames: map[string]string{
			"#status": "status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":meta":      &types.AttributeValueMemberS{Value: JobSortKeyMeta},
			":published": &types.AttributeValueMemberS{Value: "published"},
			":job":       &types.AttributeValueMemberS{Value: JobEntityType},
		},
	})
	if err != nil {
		writeInternalError(w, "listJobs: scan", err)
		return
	}

	var items []JobItem
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &items); err != nil {
		writeInternalError(w, "listJobs: unmarshal", err)
		return
	}

	jobs := make([]Job, 0, len(items))
	for _, item := range items {
		jobs = append(jobs, item.ToJob())
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(jobs); err != nil {
		writeInternalError(w, "listJobs: encode", err)
		return
	}
}

func (a *App) getJob(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	out, err := a.DB.GetItem(r.Context(), &dynamodb.GetItemInput{
		TableName: &a.TableName,
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: JobPK(id)},
			"SK": &types.AttributeValueMemberS{Value: JobSortKeyMeta},
		},
	})

	if err != nil {
		writeInternalError(w, "getJob: get item", err)
		return
	}

	if out.Item == nil {
		http.Error(w, "job not found", http.StatusNotFound)
		return
	}

	var item JobItem
	if err := attributevalue.UnmarshalMap(out.Item, &item); err != nil {
		writeInternalError(w, "getJob: unmarshal", err)
		return
	}

	if item.Status != "published" {
		http.Error(w, "job not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(item.ToJob()); err != nil {
		writeInternalError(w, "getJob: encode", err)
		return
	}
}

func (a *App) listServices(w http.ResponseWriter, r *http.Request) {

	out, err := a.DB.Scan(r.Context(), &dynamodb.ScanInput{
		TableName:        &a.TableName,
		FilterExpression: new("SK = :meta AND #status = :published AND entityType = :service"),
		ExpressionAttributeNames: map[string]string{
			"#status": "status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":meta":      &types.AttributeValueMemberS{Value: ServiceSortKeyMeta},
			":published": &types.AttributeValueMemberS{Value: "published"},
			":service":   &types.AttributeValueMemberS{Value: ServiceEntityType},
		},
	})
	if err != nil {
		writeInternalError(w, "listServices: scan", err)
		return
	}

	var items []ServiceItem
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &items); err != nil {
		writeInternalError(w, "listServices: unmarshal", err)
		return
	}

	services := make([]Service, 0, len(items))
	for _, item := range items {
		services = append(services, item.ToService())
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(services); err != nil {
		writeInternalError(w, "listServices: encode", err)
		return
	}
}

func (a *App) listMarket(w http.ResponseWriter, r *http.Request) {

	out, err := a.DB.Scan(r.Context(), &dynamodb.ScanInput{
		TableName:        &a.TableName,
		FilterExpression: new("SK = :meta AND #status = :published AND entityType = :market"),
		ExpressionAttributeNames: map[string]string{
			"#status": "status",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":meta":      &types.AttributeValueMemberS{Value: MarketSortKeyMeta},
			":published": &types.AttributeValueMemberS{Value: "published"},
			":market":    &types.AttributeValueMemberS{Value: MarketEntityType},
		},
	})
	if err != nil {
		writeInternalError(w, "listMarket: scan", err)
		return
	}

	var items []MarketItem
	if err := attributevalue.UnmarshalListOfMaps(out.Items, &items); err != nil {
		writeInternalError(w, "listMarket: unmarshal", err)
		return
	}

	markets := make([]Market, 0, len(items))
	for _, item := range items {
		markets = append(markets, item.ToMarket())
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(markets); err != nil {
		writeInternalError(w, "listMarket: encode", err)
		return
	}
}

func (a *App) getMarket(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	out, err := a.DB.GetItem(r.Context(), &dynamodb.GetItemInput{
		TableName: &a.TableName,
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: MarketPK(id)},
			"SK": &types.AttributeValueMemberS{Value: MarketSortKeyMeta},
		},
	})

	if err != nil {
		writeInternalError(w, "getMarket: get item", err)
		return
	}

	if out.Item == nil {
		http.Error(w, "market not found", http.StatusNotFound)
		return
	}

	var item MarketItem
	if err := attributevalue.UnmarshalMap(out.Item, &item); err != nil {
		writeInternalError(w, "getMarket: unmarshal", err)
		return
	}

	if item.Status != "published" {
		http.Error(w, "market not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(item.ToMarket()); err != nil {
		writeInternalError(w, "getMarket: encode", err)
		return
	}
}
