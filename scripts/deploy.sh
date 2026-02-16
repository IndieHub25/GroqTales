#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${YELLOW}[STATUS]${NC} $1"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to print error messages
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is required but not installed."
        exit 1
    fi
}

# Check required dependencies
print_status "Checking dependencies..."
check_command "node"
check_command "npm"

# Navigate to project root
PROJECT_ROOT="/home/project"
if [ ! -d "$PROJECT_ROOT" ]; then
    print_error "Project directory not found: $PROJECT_ROOT"
    exit 1
fi
cd "$PROJECT_ROOT"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
if ! npm install; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Build the website
print_status "Building the website..."
if ! npm run build; then
    print_error "Build failed"
    exit 1
fi

# Start the backend server
print_status "Starting the backend server..."
if [ -f "main.py" ]; then
    python3 main.py > server.log 2>&1 &
    SERVER_PID=$!

    # Wait for server to start (max 30 seconds)
    COUNTER=0
    while ! curl -s http://localhost:8000/api/v1/health &> /dev/null && [ $COUNTER -lt 30 ]; do
        sleep 1
        let COUNTER=COUNTER+1
    done

    if [ $COUNTER -ge 30 ]; then
        print_error "Server failed to start within 30 seconds"
        kill $SERVER_PID 2>/dev/null
        exit 1
    fi
fi

# Start the frontend
print_status "Starting the frontend..."
if ! npm run start > frontend.log 2>&1 & then
    print_error "Failed to start frontend server"
    exit 1
fi

# Wait for frontend to be ready
FRONTEND_URL="http://localhost:3000"
COUNTER=0
while ! curl -s $FRONTEND_URL &> /dev/null && [ $COUNTER -lt 30 ]; do
    sleep 1
    let COUNTER=COUNTER+1
done

if [ $COUNTER -ge 30 ]; then
    print_error "Frontend failed to start within 30 seconds"
    exit 1
fi

# Open the website in the default browser
if command -v xdg-open &> /dev/null; then
    xdg-open $FRONTEND_URL
elif command -v open &> /dev/null; then
    open $FRONTEND_URL
fi

print_success "Deployment complete!"
print_success "Backend server running at http://localhost:8000"
print_success "Frontend available at $FRONTEND_URL"
print_success "Server logs available in server.log"
print_success "Frontend logs available in frontend.log"
