.PHONY: dev

dev:
	@trap 'echo "Shutting down..."; kill 0' EXIT; \
	(echo "Starting backend..." && cd backend && go run ./cmd/local/main.go) & \
	sleep 2; \
	(echo "Starting frontend..." && cd frontend && npm run dev) & \
	wait