package app

import (
	"log"
	"net/http"
)

func writeInternalError(w http.ResponseWriter, where string, err error) {
	if err != nil {
		log.Printf("%s: %v", where, err)
	} else {
		log.Printf("%s", where)
	}
	http.Error(w, "internal error", http.StatusInternalServerError)
}
