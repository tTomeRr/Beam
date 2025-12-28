#!/bin/bash

set -e

echo "🔧 Beam Development Environment Setup"
echo "======================================"
echo

# Check for pre-commit
if ! command -v pre-commit &> /dev/null; then
    echo "⚠️  pre-commit not found. Installing..."
    if command -v pip3 &> /dev/null; then
        pip3 install pre-commit
    elif command -v pip &> /dev/null; then
        pip install pre-commit
    elif command -v brew &> /dev/null; then
        brew install pre-commit
    else
        echo "❌ Could not install pre-commit. Please install manually:"
        echo "   pip install pre-commit"
        exit 1
    fi
fi

echo "✅ pre-commit is installed"
echo

# Install pre-commit hooks
echo "📦 Installing pre-commit hooks..."
pre-commit install
echo "✅ Pre-commit hooks installed"
echo

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install --legacy-peer-deps
echo "✅ Frontend dependencies installed"
echo

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..
echo "✅ Backend dependencies installed"
echo

# Run pre-commit on all files
echo "🔍 Running pre-commit checks..."
pre-commit run --all-files || echo "⚠️  Some checks failed. Please fix and commit."
echo

echo "✅ Development environment setup complete!"
echo
echo "Next steps:"
echo "  1. Run ./setup.sh to initialize Docker services"
echo "  2. Run docker-compose up -d to start the application"
echo "  3. Start coding! Pre-commit hooks will run on every commit"
echo
echo "Useful commands:"
echo "  pre-commit run --all-files    # Run all hooks manually"
echo "  docker-compose logs -f         # View application logs"
echo "  docker-compose restart         # Restart services"
