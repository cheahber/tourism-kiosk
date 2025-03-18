#!/bin/bash
# Copyright (C) 2025 Intel Corporation
# SPDX-License-Identifier: Apache-2.0

# Exit immediately if a command exits with a non-zero status
set -e

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[+] $1${NC}"
}

# Create public directory if it doesn't exist
mkdir -p public

# Download marker icons
print_status "Downloading map marker assets..."
curl -L https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon.png -o public/marker-icon.png
curl -L https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x.png -o public/marker-icon-2x.png
curl -L https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png -o public/marker-shadow.png

print_status "Assets downloaded successfully!"