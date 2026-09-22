package app

import "strings"

func (a *App) MediaURL(key string) string {
	key = strings.TrimSpace(key)
	if key == "" {
		return ""
	}

	if strings.HasPrefix(key, "https://") || strings.HasPrefix(key, "http://") {
		return key
	}

	base := strings.TrimRight(a.MediaBaseURL, "/")
	if base == "" {
		return key
	}

	return base + "/" + strings.TrimLeft(key, "/")
}

func (a *App) MediaURLs(keys []string) []string {
	out := make([]string, 0, len(keys))
	for _, key := range keys {
		if u := a.MediaURL(key); u != "" {
			out = append(out, u)
		}
	}

	return out
}
