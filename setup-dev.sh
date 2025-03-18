#!/bin/bash
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

print_error() {
    echo -e "${RED}[-] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

# Function to check and install Node.js
install_nodejs() {
    print_status "Installing Node.js 20.x..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        if command -v apt-get &> /dev/null; then
            print_status "Detected Debian/Ubuntu system"
            sudo curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        # RHEL/CentOS/Fedora
        elif command -v dnf &> /dev/null; then
            print_status "Detected RHEL/CentOS/Fedora system"
            sudo dnf install -y nodejs
        else
            print_error "Unsupported Linux distribution"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! command -v brew &> /dev/null; then
            print_error "Homebrew is required. Please install it first:"
            echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
            exit 1
        fi
        print_status "Detected macOS system"
        brew install node@20
        echo 'export PATH="/usr/local/opt/node@20/bin:$PATH"' >> ~/.zshrc
        echo 'export PATH="/usr/local/opt/node@20/bin:$PATH"' >> ~/.bashrc
        source ~/.zshrc 2>/dev/null || source ~/.bashrc
    else
        print_error "Unsupported operating system"
        echo "Please install Node.js 20.x manually from https://nodejs.org/"
        exit 1
    fi
}

# Check for Node.js
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. Installing Node.js 20.x..."
    install_nodejs
else
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        print_warning "Node.js version 20 or higher is required. Current version: $(node -v)"
        print_warning "Installing Node.js 20.x..."
        install_nodejs
    fi
fi

# Verify Node.js installation
if ! command -v node &> /dev/null; then
    print_error "Node.js installation failed"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js installation failed to install version 20 or higher"
    exit 1
fi

print_status "Node.js $(node -v) is installed"

# Install dependencies
print_status "Installing dependencies..."
npm install

# Download required assets
print_status "Downloading required assets..."
bash scripts/download-assets.sh

# Run design checks
print_status "Running design checks..."
bash scripts/check-design.sh

# Setup complete
print_status "Setup complete! You can now run the development server with:"
echo -e "${GREEN}npm run dev${NC}"