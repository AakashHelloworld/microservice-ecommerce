FROM golang:1.24.5-alpine

RUN apk update && apk add --no-cache ca-certificates

# Set working directory
WORKDIR /app/notification-service

# Copy Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of your code
COPY . .

# Build the Go binary
RUN go build -o notification-service main.go

ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
# Run the binary
CMD ["./notification-service"]
