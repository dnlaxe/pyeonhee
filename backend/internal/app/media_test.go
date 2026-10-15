package app

import "testing"

func TestMediaURL(t *testing.T) {
	a := &App{MediaBaseURL: "https://d111.cloudfront.net"}
	got := a.mediaURL("media/jobs/x.jpg")
	want := "https://d111.cloudfront.net/media/jobs/x.jpg"
	if got != want {
		t.Fatalf("got %q want %q", got, want)
	}
	if a.mediaURL("https://already.example/a.jpg") != "https://already.example/a.jpg" {
		t.Fatal("must not prefix absolute URLs")
	}
	if a.mediaURL("") != "" {
		t.Fatal("empty stays empty")
	}
}
