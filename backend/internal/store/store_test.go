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

func TestListPublishedFiltersByEntity(t *testing.T) {
	db := &fakeDB{}
	if _, err := New(db, "t").ListPublishedMarket(context.Background()); err != nil {
		t.Fatal(err)
	}
	values := db.scan.ExpressionAttributeValues
	if str(values[":entity"]) != EntityMarket || str(values[":published"]) != StatusPublished {
		t.Fatalf("scan values = %v", values)
	}
}

func TestSetJobOrder(t *testing.T) {
	db := &fakeDB{}
	if err := New(db, "t").SetJobOrder(context.Background(), "JOB1", "ORDER1", 5000); err != nil {
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

func TestPublishJob(t *testing.T) {
	db := &fakeDB{}
	if err := New(db, "t").PublishJob(context.Background(), "JOB1", "ORDER1", "mock_abc"); err != nil {
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

	if err := s.SetJobOrder(context.Background(), "JOB1", "ORDER1", 5000); !errors.Is(err, ErrNotPending) {
		t.Fatalf("SetJobOrder err = %v", err)
	}
	if err := s.PublishJob(context.Background(), "JOB1", "ORDER1", "k"); !errors.Is(err, ErrNotPending) {
		t.Fatalf("PublishJob err = %v", err)
	}
}
