#!/bin/bash

# MBA Expense Explorer - Docker Runner Script

echo "🚀 MBA Expense Explorer - Docker Setup"
echo "======================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "📝 Please create a .env file with your API keys:"
    echo ""
    echo "OPENAI_API_KEY=your_openai_api_key_here"
    echo "COPILOT_API_KEY=your_copilot_api_key_here"
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000"
    echo ""
    echo "You can copy from .env.example if available"
    read -p "Press Enter to continue anyway or Ctrl+C to exit..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create data directory if it doesn't exist
mkdir -p data

# Build and run the services
echo "🔨 Building and starting services..."
docker-compose up --build

echo ""
echo "✅ Services should now be running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "To stop services: docker-compose down"
echo "To view logs: docker-compose logs -f"
