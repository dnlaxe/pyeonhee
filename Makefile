.PHONY: dev verify verify-frontend verify-backend verify-infra fmt

dev:
	@trap 'echo "Shutting down..."; kill 0' EXIT; \
	(echo "Starting backend..." && cd backend && go run ./cmd/local/main.go) & \
	sleep 2; \
	(echo "Starting frontend..." && cd frontend && npm run dev) & \
	wait

verify: verify-frontend verify-backend verify-infra

verify-frontend:
	cd frontend && npm run lint && npm run build

verify-backend:
	cd backend && go vet ./... && go build ./... && go test ./...

verify-infra:
	cd infra && go vet ./... && go build -o /dev/null . && go test ./...

fmt:
	cd frontend && npx prettier --write src
	cd backend && gofmt -w .
	cd infra && gofmt -w .
