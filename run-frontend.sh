#!/bin/bash

# FairLens Frontend Run Script

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}FairLens Frontend Startup Script${NC}"
echo "================================"

# Check if we're on Windows (Git Bash) or Linux/Mac
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    IS_WINDOWS=1
else
    IS_WINDOWS=0
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Node.js is installed
check_node() {
    if command_exists node; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"
    else
        echo -e "${RED}Error: Node.js is not installed${NC}"
        echo "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        echo -e "${GREEN}✓ npm $NPM_VERSION found${NC}"
    else
        echo -e "${RED}Error: npm is not installed${NC}"
        exit 1
    fi
}

# Function to install frontend dependencies
install_dependencies() {
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "${RED}Error: package.json not found${NC}"
        exit 1
    fi
    
    # Install dependencies
    npm install
    
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
}

# Function to start the frontend
start_frontend() {
    echo -e "${YELLOW}Starting FairLens frontend...${NC}"
    echo -e "${GREEN}Frontend will be available at: http://localhost:5173${NC}"
    echo ""
    
    # Start the Vite development server
    npm run dev
}

# Main execution
main() {
    check_node
    install_dependencies
    start_frontend
}

# Run main function
main