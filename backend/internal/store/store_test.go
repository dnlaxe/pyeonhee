package store

import (
	"context"
	"errors"
	"testing"

	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type fakeDB struct {
	DynamoDB
	get       *dynamodb.GetItemInput
	item      map[string]types.AttributeValue
	scan      *dynamodb.ScanInput
	items     []map[string]types.AttributeValue
	update    *dynamodb.UpdateItemInput
	updateErr error
}

func (f *fakeDB) GetItem(_ context.Context, in *dynamodb.GetItemInput, _ ...func(*dynamodb.Options)) (*dynamodb.GetItemOutput, error) {
	f.get = in
	return &dynamodb.GetItemOutput{Item: f.item}, nil
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

func TestListPublishedOneScan(t *testing.T) {
	jobAV, err := attributevalue.MarshalMap(JobItem{
		ID: "j1", EntityType: EntityJob, Status: StatusPublished,
	})
	if err != nil {
		t.Fatal(err)
	}
	marketAV, err := attributevalue.MarshalMap(MarketItem{
		ID: "m1", EntityType: EntityMarket, Status: StatusPublished,
	})
	if err != nil {
		t.Fatal(err)
	}
	serviceAV, err := attributevalue.MarshalMap(ServiceItem{
		ID: "s1", EntityType: EntityService, Status: StatusPublished,
	})
	if err != nil {
		t.Fatal(err)
	}

	db := &fakeDB{items: []map[string]types.AttributeValue{jobAV, marketAV, serviceAV}}
	out, err := New(db, "t").ListPublished(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if db.scan == nil {
		t.Fatal("expected one Scan")
	}
	if _, ok := db.scan.ExpressionAttributeValues[":entity"]; ok {
		t.Fatal("expected no :entity filter")
	}
	if str(db.scan.ExpressionAttributeValues[":published"]) != StatusPublished {
		t.Fatalf("published = %v", db.scan.ExpressionAttributeValues[":published"])
	}
	if len(out.Jobs) != 1 || out.Jobs[0].ID != "j1" {
		t.Fatalf("jobs = %+v", out.Jobs)
	}
	if len(out.Market) != 1 || out.Market[0].ID != "m1" {
		t.Fatalf("market = %+v", out.Market)
	}
	if len(out.Services) != 1 || out.Services[0].ID != "s1" {
		t.Fatalf("services = %+v", out.Services)
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
