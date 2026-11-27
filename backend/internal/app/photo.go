package app

import (
	"context"
	"crypto/rand"
	"errors"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

const (
	photoPrefix    = "media/"
	tmpPhotoPrefix = "tmp/"
)

type PhotoSpec struct {
	ContentType   string `json:"contentType"`
	ContentLength int64  `json:"contentLength"`
}

func (p PhotoSpec) validate() (string, string) {
	ext, ok := photoExt[p.ContentType]
	if !ok {
		return "", "Use a JPEG, PNG, or WebP image."
	}
	if p.ContentLength < 1 || p.ContentLength > maxPhotoBytes {
		return "", "Use a photo smaller than 2 MB."
	}
	return ext, ""
}

type PhotoUpload struct {
	Key       string `json:"key"`
	UploadURL string `json:"uploadUrl"`
}

type createListingResponse struct {
	ID      string        `json:"id"`
	Uploads []PhotoUpload `json:"uploads,omitempty"`
}

func (a *App) presignPhotos(ctx context.Context, specs []PhotoSpec) ([]string, []PhotoUpload, error) {
	if len(specs) == 0 {
		return nil, nil, nil
	}
	if a.Photos == nil {
		return nil, nil, errors.New("UPLOADS_BUCKET not set")
	}
	keys := make([]string, 0, len(specs))
	uploads := make([]PhotoUpload, 0, len(specs))
	for _, spec := range specs {
		key, upload, err := a.Photos.PresignUpload(ctx, spec)
		if err != nil {
			return nil, nil, err
		}
		keys = append(keys, key)
		uploads = append(uploads, upload)
	}
	return keys, uploads, nil
}

type PhotoStore interface {
	PresignUpload(ctx context.Context, spec PhotoSpec) (mediaKey string, upload PhotoUpload, err error)
	CheckUpload(ctx context.Context, mediaKey string) error
	Promote(ctx context.Context, mediaKey string) error
}

func tmpKeyFor(mediaKey string) (string, error) {
	rest, ok := strings.CutPrefix(mediaKey, photoPrefix)
	if !ok || rest == "" || strings.Contains(rest, "/") || strings.Contains(rest, "..") {
		return "", errBadPhoto
	}
	return tmpPhotoPrefix + rest, nil
}

type s3PhotoStore struct {
	client *s3.Client
	bucket string
}

func newS3PhotoStore(client *s3.Client, bucket string) *s3PhotoStore {
	return &s3PhotoStore{client: client, bucket: bucket}
}

func (s *s3PhotoStore) PresignUpload(ctx context.Context, spec PhotoSpec) (string, PhotoUpload, error) {
	ext, msg := spec.validate()
	if msg != "" {
		return "", PhotoUpload{}, errBadPhoto
	}
	name := rand.Text() + "." + ext
	tmpKey := tmpPhotoPrefix + name
	mediaKey := photoPrefix + name

	out, err := s3.NewPresignClient(s.client).PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(tmpKey),
		ContentType:   aws.String(spec.ContentType),
		ContentLength: aws.Int64(spec.ContentLength),
	}, s3.WithPresignExpires(5*time.Minute))
	if err != nil {
		return "", PhotoUpload{}, err
	}
	return mediaKey, PhotoUpload{Key: mediaKey, UploadURL: out.URL}, nil
}

func (s *s3PhotoStore) CheckUpload(ctx context.Context, mediaKey string) error {
	tmpKey, err := tmpKeyFor(mediaKey)
	if err != nil {
		return err
	}
	out, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(tmpKey),
	})
	if err != nil {
		var nf *types.NotFound
		if errors.As(err, &nf) {
			return errBadPhoto
		}
		return err
	}
	ext, ok := photoExt[aws.ToString(out.ContentType)]
	if !ok || !strings.HasSuffix(tmpKey, "."+ext) {
		return errBadPhoto
	}
	n := aws.ToInt64(out.ContentLength)
	if n < 1 || n > maxPhotoBytes {
		return errBadPhoto
	}
	return nil
}

func (s *s3PhotoStore) Promote(ctx context.Context, mediaKey string) error {
	tmpKey, err := tmpKeyFor(mediaKey)
	if err != nil {
		return err
	}
	_, err = s.client.CopyObject(ctx, &s3.CopyObjectInput{
		Bucket:     aws.String(s.bucket),
		CopySource: aws.String(s.bucket + "/" + tmpKey),
		Key:        aws.String(mediaKey),
	})
	return err
}

func newS3Client(ctx context.Context) (*s3.Client, error) {
	cfg, err := awsconfig.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}
	return s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.RequestChecksumCalculation = aws.RequestChecksumCalculationWhenRequired
		o.ResponseChecksumValidation = aws.ResponseChecksumValidationWhenRequired
	}), nil
}

var errBadPhoto = errors.New("bad photo")
