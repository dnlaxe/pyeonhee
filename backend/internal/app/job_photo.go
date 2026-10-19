package app

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

const (
	jobPhotoPrefix   = "media/jobs/"
	maxJobPhotoBytes = 2 << 20
)

var jobPhotoExt = map[string]string{
	"image/jpeg": "jpg",
	"image/png":  "png",
	"image/webp": "webp",
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

func (a *App) createJobPhoto(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<10)

	var req struct {
		ContentType   string `json:"contentType"`
		ContentLength int64  `json:"contentLength"`
		Password      string `json:"password"`
	}
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if err := a.BotCheck.Verify(r.Context(), req.Password); err != nil {
		writeBotCheckError(w, err)
		return
	}

	ext, ok := jobPhotoExt[req.ContentType]
	errs := map[string]string{}
	if !ok {
		errs["contentType"] = "Use a JPEG, PNG, or WebP image."
	}
	if req.ContentLength < 1 || req.ContentLength > maxJobPhotoBytes {
		errs["contentLength"] = "Image must be 2 MB or smaller."
	}
	if len(errs) > 0 {
		writeValidationErrors(w, errs)
		return
	}

	if a.Uploads == nil || a.UploadsBucket == "" {
		writeInternalError(w, "createJobPhoto", errors.New("UPLOADS_BUCKET not set"))
		return
	}

	key := jobPhotoPrefix + rand.Text() + "." + ext
	out, err := s3.NewPresignClient(a.Uploads).PresignPutObject(r.Context(), &s3.PutObjectInput{
		Bucket:        aws.String(a.UploadsBucket),
		Key:           aws.String(key),
		ContentType:   aws.String(req.ContentType),
		ContentLength: aws.Int64(req.ContentLength),
	}, s3.WithPresignExpires(5*time.Minute))
	if err != nil {
		writeInternalError(w, "createJobPhoto", err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"key":       key,
		"uploadUrl": out.URL,
	})
}

var errBadLogo = errors.New("bad logo")

func (a *App) checkJobLogo(ctx context.Context, key string) error {
	rest, ok := strings.CutPrefix(key, jobPhotoPrefix)
	if !ok || rest == "" || strings.Contains(rest, "/") || strings.Contains(rest, "..") {
		return errBadLogo
	}
	if a.Uploads == nil || a.UploadsBucket == "" {
		return errors.New("UPLOADS_BUCKET not set")
	}

	out, err := a.Uploads.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(a.UploadsBucket),
		Key:    aws.String(key),
	})
	if err != nil {
		var nf *types.NotFound
		if errors.As(err, &nf) {
			return errBadLogo
		}
		return err
	}

	ext, ok := jobPhotoExt[aws.ToString(out.ContentType)]
	if !ok || !strings.HasSuffix(key, "."+ext) {
		return errBadLogo
	}
	n := aws.ToInt64(out.ContentLength)
	if n < 1 || n > maxJobPhotoBytes {
		return errBadLogo
	}
	return nil
}
