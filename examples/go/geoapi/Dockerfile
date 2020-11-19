# Start from a Debian image with the latest version of Go installed
# and a workspace (GOPATH) configured at /go.
FROM golang:1.13

# Copy the local package files to the container's workspace.
RUN mkdir /geoapi
WORKDIR /geoapi
COPY go.mod .
COPY go.sum .

# Get dependancies - will also be cached if we won't change mod/sum
RUN go mod download
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o /go/bin/geoapi

# Run the outyet command by default when the container starts.
ENTRYPOINT /go/bin/geoapi