#!/bin/sh
# Generate self-signed SSL certificates for development or staging testing.
# Run from the project root directory or the docs/nginx directory.

# Create certs directory if not exists
mkdir -p "$(dirname "$0")/certs"

echo "Generating self-signed SSL certificates..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$(dirname "$0")/certs/privkey.pem" \
  -out "$(dirname "$0")/certs/fullchain.pem" \
  -subj "/C=ES/ST=Madrid/L=Madrid/O=VDEnergy/CN=localhost"

echo "Certificates generated successfully inside docs/nginx/certs/ directory."
