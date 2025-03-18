#!/bin/bash
# Copyright (C) 2025 Intel Corporation
# SPDX-License-Identifier: Apache-2.0

# Exit immediately if a command exits with a non-zero status
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[+] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

print_error() {
    echo -e "${RED}[-] $1${NC}"
}

# Check required files
check_file() {
    if [ -f "$1" ]; then
        print_status "Found $1"
        return 0
    else
        print_error "Missing $1"
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        print_status "Found directory $1"
        return 0
    else
        print_error "Missing directory $1"
        return 1
    fi
}

# Main checks
main() {
    local errors=0

    print_status "Starting design check..."
    echo

    # Check directories
    print_status "Checking directories..."
    check_directory "public" || ((errors++))
    check_directory "pages" || ((errors++))
    check_directory "components" || ((errors++))
    check_directory "styles" || ((errors++))
    echo

    # Check required files
    print_status "Checking required files..."
    check_file "pages/index.js" || ((errors++))
    check_file "components/Map.js" || ((errors++))
    check_file "styles/globals.css" || ((errors++))
    check_file "postcss.config.js" || ((errors++))
    check_file "tailwind.config.js" || ((errors++))
    echo

    # Check marker assets
    print_status "Checking marker assets..."
    check_file "public/marker-icon.png" || ((errors++))
    check_file "public/marker-icon-2x.png" || ((errors++))
    check_file "public/marker-shadow.png" || ((errors++))
    echo

    # Check package.json dependencies
    print_status "Checking package.json dependencies..."
    if [ -f "package.json" ]; then
        local required_deps=("next" "react" "react-dom" "leaflet" "tailwindcss" "postcss" "autoprefixer")
        for dep in "${required_deps[@]}"; do
            if grep -q "\"$dep\":" package.json; then
                print_status "Found dependency: $dep"
            else
                print_error "Missing dependency: $dep"
                ((errors++))
            fi
        done
    else
        print_error "Missing package.json"
        ((errors++))
    fi
    echo

    # Summary
    if [ $errors -eq 0 ]; then
        print_status "All design checks passed successfully!"
    else
        print_error "Design check completed with $errors error(s)"
        exit 1
    fi
}

# Execute main function
main