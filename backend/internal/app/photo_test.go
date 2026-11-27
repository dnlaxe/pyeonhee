package app

import (
	"errors"
	"testing"
)

func TestPhotoSpecValidate(t *testing.T) {
	tests := []struct {
		name    string
		spec    PhotoSpec
		wantExt string
		wantErr bool
	}{
		{"jpeg ok", PhotoSpec{ContentType: "image/jpeg", ContentLength: 1024}, "jpg", false},
		{"png ok", PhotoSpec{ContentType: "image/png", ContentLength: maxPhotoBytes}, "png", false},
		{"webp ok", PhotoSpec{ContentType: "image/webp", ContentLength: 1}, "webp", false},
		{"bad type", PhotoSpec{ContentType: "image/gif", ContentLength: 100}, "", true},
		{"zero bytes", PhotoSpec{ContentType: "image/jpeg", ContentLength: 0}, "", true},
		{"too large", PhotoSpec{ContentType: "image/jpeg", ContentLength: maxPhotoBytes + 1}, "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ext, msg := tt.spec.validate()
			if tt.wantErr && msg == "" {
				t.Fatalf("expected error for %+v", tt.spec)
			}
			if !tt.wantErr && (msg != "" || ext != tt.wantExt) {
				t.Fatalf("got (%q, %q), want (%q, \"\")", ext, msg, tt.wantExt)
			}
		})
	}
}

func TestTmpKeyFor(t *testing.T) {
	got, err := tmpKeyFor("media/abc123.jpg")
	if err != nil || got != "tmp/abc123.jpg" {
		t.Fatalf("tmpKeyFor valid = (%q, %v), want (\"tmp/abc123.jpg\", nil)", got, err)
	}

	bad := []string{"", "media/", "tmp/abc.jpg", "media/sub/a.jpg", "media/../a.jpg", "other/a.jpg"}
	for _, key := range bad {
		if _, err := tmpKeyFor(key); !errors.Is(err, errBadPhoto) {
			t.Fatalf("tmpKeyFor(%q) err = %v, want errBadPhoto", key, err)
		}
	}
}
