#!/bin/bash

set -e

echo "🚀 Setting up Beam Budget Tracker..."

if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
fi

if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file..."
    cp backend/.env.example backend/.env
fi

echo "🔧 Generating JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)
# Escape special characters for sed
JWT_SECRET_ESCAPED=$(echo "$JWT_SECRET" | sed 's/[&/\]/\\&/g')
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/your-secret-key-change-in-production/$JWT_SECRET_ESCAPED/" backend/.env
else
    sed -i "s/your-secret-key-change-in-production/$JWT_SECRET_ESCAPED/" backend/.env
fi

echo "🐳 Starting Docker services..."
docker-compose up -d database

echo "⏳ Waiting for database to be ready..."
sleep 5

echo "📊 Running database migrations..."
docker-compose run --rm backend npm run migrate

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  docker-compose up -d"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "Access the application at http://localhost:3000"
