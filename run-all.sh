#!/bin/bash

# FairLens Complete System Run Script
# Starts both backend and frontend servers

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}FairLens Complete System Startup Script${NC}"
echo "======================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_requirements() {
    echo -e "${YELLOW}Checking system requirements...${NC}"
    
    # Check Python
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
    
    # Check Node.js
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
    
    echo -e "${GREEN}✓ All system requirements satisfied${NC}"
}

# Function to start backend server
start_backend() {
    echo -e "${BLUE}Starting backend server...${NC}"
    
    # Change to backend directory
    cd backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Creating virtual environment...${NC}"
        $PYTHON_CMD -m venv venv
    fi
    
    # Activate virtual environment
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    # Install backend dependencies
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    pip install --upgrade pip > /dev/null 2>&1
    pip install -r requirements.txt > /dev/null 2>&1
    
    # Initialize database
    echo -e "${YELLOW}Initializing database...${NC}"
    $PYTHON_CMD init-db.py > /dev/null 2>&1
    
    # Start backend in background
    echo -e "${GREEN}✓ Backend server starting on http://localhost:8000${NC}"
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Change back to root directory
    cd ..
}

# Function to start frontend server
start_frontend() {
    echo -e "${BLUE}Starting frontend server...${NC}"
    
    # Install frontend dependencies
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install > /dev/null 2>&1
    
    # Start frontend in background
    echo -e "${GREEN}✓ Frontend server starting on http://localhost:5173${NC}"
    npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
}

# Function to cleanup on exit
cleanup() {
    echo -e "${YELLOW}"
    echo "Shutting down servers..."
    echo -e "${NC}"
    
    # Kill backend process
    if [[ -n "$BACKEND_PID" ]]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    # Kill frontend process
    if [[ -n "$FRONTEND_PID" ]]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    exit 0
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Main execution
main() {
    check_requirements
    start_backend
    start_frontend
    
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}FairLens System is Running!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo -e "${BLUE}Backend API:${NC}     http://localhost:8000"
    echo -e "${BLUE}Frontend UI:${NC}     http://localhost:5173"
    echo -e "${BLUE}API Docs:${NC}        http://localhost:8000/docs"
    echo ""
    echo "Press Ctrl+C to stop both servers"
    echo ""
    
    # Wait for both processes
    wait $BACKEND_PID $FRONTEND_PID
}

# Run main function
main