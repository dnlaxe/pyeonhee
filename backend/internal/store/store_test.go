package store

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type fakeDB struct {
	DynamoDB
	get       *dynamodb.GetItemInput
	item      map[string]types.AttributeValue
	put       *dynamodb.PutItemInput
	putErr    error
	scan      *dynamodb.ScanInput
	items     []map[string]types.AttributeValue
	update    *dynamodb.UpdateItemInput
	updateErr error
}

func (f *fakeDB) GetItem(_ context.Context, in *dynamodb.GetItemInput, _ ...func(*dynamodb.Options)) (*dynamodb.GetItemOutput, error) {
	f.get = in
	return &dynamodb.GetItemOutput{Item: f.item}, nil
}

func (f *fakeDB) PutItem(_ context.Context, in *dynamodb.PutItemInput, _ ...func(*dynamodb.Options)) (*dynamodb.PutItemOutput, error) {
	f.put = in
	return &dynamodb.PutItemOutput{}, f.putErr
}

func (f *fakeDB) Scan(_ context.Context, in *dynamodb.ScanInput, _ ...func(*dynamodb.Options)) (*dynamodb.ScanOutput, error) {
	f.scan = in
	return &dynamodb.ScanOutput{Items: f.items}, nil
}

func (f *fakeDB) UpdateItem(_ context.Context, in *dynamodb.UpdateItemInput, _ ...func(*dynamodb.Options)) (*dynamodb.UpdateItemOutput, error) {
	f.update = in
	return &dynamodb.UpdateItemOutput{}, f.updateErr
}

func str(av types.AttributeValue) string {
	switch v := av.(type) {
	case *types.AttributeValueMemberS:
		return v.Value
	case *types.AttributeValueMemberN:
		return v.Value
	}
	return ""
}

func TestGetJob(t *testing.T) {
	av, err := attributevalue.MarshalMap(JobItem{ID: "JOB1", Status: StatusPending})
	if err != nil {
		t.Fatal(err)
	}
	db := &fakeDB{item: av}

	job, err := New(db, "t").GetJob(context.Background(), "JOB1")
	if err != nil {
		t.Fatal(err)
	}
	if job.ID != "JOB1" || job.Status != StatusPending {
		t.Fatalf("job = %+v", job)
	}
	if pk := str(db.get.Key["PK"]); pk != "JOB#JOB1" {
		t.Fatalf("PK = %q", pk)
	}
	if sk := str(db.get.Key["SK"]); sk != SortKeyMeta {
		t.Fatalf("SK = %q", sk)
	}
}

func TestGetJobNotFound(t *testing.T) {
	_, err := New(&fakeDB{}, "t").GetJob(context.Background(), "JOB1")
	if !errors.Is(err, ErrNotFound) {
		t.Fatalf("err = %v, want ErrNotFound", err)
	}
}

func TestListPublishedListings(t *testing.T) {
	jobAV, err := attributevalue.MarshalMap(JobItem{
		PK:         JobPK("J1"),
		SK:         SortKeyMeta,
		EntityType: EntityJob,
		ID:         "J1",
		Title:      "Engineer",
		Status:     StatusPublished,
	})
	if err != nil {
		t.Fatal(err)
	}
	marketAV, err := attributevalue.MarshalMap(MarketItem{
		PK:         MarketPK("M1"),
		SK:         SortKeyMeta,
		EntityType: EntityMarket,
		ID:         "M1",
		Title:      "Desk",
		Status:     StatusPublished,
	})
	if err != nil {
		t.Fatal(err)
	}
	serviceAV, err := attributevalue.MarshalMap(ServiceItem{
		PK:         ServicePK("S1"),
		SK:         SortKeyMeta,
		EntityType: EntityService,
		ID:         "S1",
		Company:    "Visa Help",
		Status:     StatusPublished,
	})
	if err != nil {
		t.Fatal(err)
	}
	unknownAV := map[string]types.AttributeValue{
		"PK":         &types.AttributeValueMemberS{Value: "OTHER#1"},
		"SK":         &types.AttributeValueMemberS{Value: SortKeyMeta},
		"entityType": &types.AttributeValueMemberS{Value: "other"},
		"status":     &types.AttributeValueMemberS{Value: StatusPublished},
	}

	db := &fakeDB{items: []map[string]types.AttributeValue{jobAV, marketAV, serviceAV, unknownAV}}
	got, err := New(db, "t").ListPublishedListings(context.Background())
	if err != nil {
		t.Fatal(err)
	}

	values := db.scan.ExpressionAttributeValues
	if str(values[":meta"]) != SortKeyMeta || str(values[":published"]) != StatusPublished {
		t.Fatalf("scan values = %v", values)
	}
	if _, hasEntity := values[":entity"]; hasEntity {
		t.Fatalf("unexpected :entity filter in scan values: %v", values)
	}
	if len(got.Jobs) != 1 || got.Jobs[0].ID != "J1" {
		t.Fatalf("jobs = %+v", got.Jobs)
	}
	if len(got.Market) != 1 || got.Market[0].ID != "M1" {
		t.Fatalf("market = %+v", got.Market)
	}
	if len(got.Services) != 1 || got.Services[0].ID != "S1" {
		t.Fatalf("services = %+v", got.Services)
	}
}

func TestSetOrder(t *testing.T) {
	db := &fakeDB{}
	if err := New(db, "t").SetOrder(context.Background(), JobPK("JOB1"), "ORDER1", 5000); err != nil {
		t.Fatal(err)
	}
	if pk := str(db.update.Key["PK"]); pk != "JOB#JOB1" {
		t.Fatalf("PK = %q", pk)
	}
	values := db.update.ExpressionAttributeValues
	if str(values[":orderId"]) != "ORDER1" || str(values[":amount"]) != "5000" {
		t.Fatalf("update values = %v", values)
	}
}

func TestPublish(t *testing.T) {
	db := &fakeDB{}
	if err := New(db, "t").Publish(context.Background(), JobPK("JOB1"), "ORDER1", "mock_abc"); err != nil {
		t.Fatal(err)
	}
	values := db.update.ExpressionAttributeValues
	if str(values[":paymentKey"]) != "mock_abc" || str(values[":orderId"]) != "ORDER1" {
		t.Fatalf("update values = %v", values)
	}
	if db.update.UpdateExpression == nil || !strings.Contains(*db.update.UpdateExpression, "REMOVE #ttl") {
		t.Fatalf("update expression = %v, want REMOVE #ttl", db.update.UpdateExpression)
	}
	if db.update.ExpressionAttributeNames["#ttl"] != "ttl" {
		t.Fatalf("expression attribute names = %v", db.update.ExpressionAttributeNames)
	}
}

func TestUpdatesMapConditionFailureToNotPending(t *testing.T) {
	db := &fakeDB{updateErr: &types.ConditionalCheckFailedException{}}
	s := New(db, "t")

	if err := s.SetOrder(context.Background(), JobPK("JOB1"), "ORDER1", 5000); !errors.Is(err, ErrNotPending) {
		t.Fatalf("SetOrder err = %v", err)
	}
	if err := s.Publish(context.Background(), JobPK("JOB1"), "ORDER1", "k"); !errors.Is(err, ErrNotPending) {
		t.Fatalf("Publish err = %v", err)
	}
}

func TestPutReport(t *testing.T) {
	db := &fakeDB{}
	item := ReportItem{
		PK:            ReportPartitionKey,
		SK:            ReportSK("2026-01-01T00:00:00Z", "REP1"),
		EntityType:    EntityReport,
		ID:            "REP1",
		ListingKind:   EntityJob,
		ListingID:     "JOB1",
		ListingTitle:  "English Teacher",
		ReporterEmail: "alice@example.com",
		Message:       "This listing looks like a scam.",
		Status:        ReportStatusOpen,
		CreatedAt:     "2026-01-01T00:00:00Z",
	}

	if err := New(db, "t").PutReport(context.Background(), item); err != nil {
		t.Fatal(err)
	}
	if db.put == nil {
		t.Fatal("expected PutItem call")
	}
	if pk := str(db.put.Item["PK"]); pk != ReportPartitionKey {
		t.Fatalf("PK = %q, want %q", pk, ReportPartitionKey)
	}
	if sk := str(db.put.Item["SK"]); sk != "2026-01-01T00:00:00Z#REP1" {
		t.Fatalf("SK = %q", sk)
	}
	if entity := str(db.put.Item["entityType"]); entity != EntityReport {
		t.Fatalf("entityType = %q", entity)
	}
	if status := str(db.put.Item["status"]); status != ReportStatusOpen {
		t.Fatalf("status = %q", status)
	}
}
