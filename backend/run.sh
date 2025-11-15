#!/bin/bash

# FairLens Backend Run Script

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}FairLens Backend Startup Script${NC}"
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

# Function to check if Python is installed
check_python() {
    if command_exists python3; then
        PYTHON_CMD="python3"
    elif command_exists python; then
        PYTHON_CMD="python"
    else
        echo -e "${RED}Error: Python is not installed${NC}"
        exit 1
    fi
    
    # Check Python version (3.8+ required)
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2)
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
    
    if [[ $PYTHON_MAJOR -lt 3 ]] || [[ $PYTHON_MAJOR -eq 3 && $PYTHON_MINOR -lt 8 ]]; then
        echo -e "${RED}Error: Python 3.8+ is required. Found: $PYTHON_VERSION${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"
}

# Function to check if virtual environment exists
check_venv() {
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Creating virtual environment...${NC}"
        $PYTHON_CMD -m venv venv
        echo -e "${GREEN}✓ Virtual environment created${NC}"
    else
        echo -e "${GREEN}✓ Virtual environment exists${NC}"
    fi
    
    # Activate virtual environment
    if [ $IS_WINDOWS -eq 1 ]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    echo -e "${GREEN}✓ Virtual environment activated${NC}"
}

# Function to install dependencies
install_dependencies() {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    
    # Check if requirements.txt exists
    if [ ! -f "requirements.txt" ]; then
        echo -e "${RED}Error: requirements.txt not found${NC}"
        exit 1
    fi
    
    # Upgrade pip first
    pip install --upgrade pip
    
    # Install requirements
    pip install -r requirements.txt
    
    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# Function to initialize database
init_database() {
    echo -e "${YELLOW}Initializing database...${NC}"
    
    # Check if init-db.py exists
    if [ ! -f "init-db.py" ]; then
        echo -e "${RED}Error: init-db.py not found${NC}"
        exit 1
    fi
    
    # Run database initialization
    $PYTHON_CMD init-db.py
    
    echo -e "${GREEN}✓ Database initialized${NC}"
}

# Function to start the server
start_server() {
    echo -e "${YELLOW}Starting FairLens backend server...${NC}"
    echo -e "${GREEN}Server will be available at: http://localhost:8000${NC}"
    echo ""
    
    # Start the FastAPI server
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
}

# Main execution
main() {
    check_python
    check_venv
    install_dependencies
    init_database
    start_server
}

# Run main function
main