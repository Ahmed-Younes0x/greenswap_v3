#!/bin/bash

# Production deployment script for GreenSwap Egypt
set -e

echo "🚀 Starting production deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create it from .env.example"
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
required_vars=("SECRET_KEY" "DATABASE_URL" "REDIS_URL" "ALLOWED_HOSTS")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --settings=greenswap_backend.production_settings

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --settings=greenswap_backend.production_settings

# Setup initial data
echo "📊 Setting up initial data..."
python manage.py setup_initial_data --settings=greenswap_backend.production_settings

# Create logs directory
mkdir -p logs

echo "✅ Deployment completed successfully!"
echo "🌐 Application is ready to run with:"
echo "   gunicorn greenswap_backend.wsgi_production:application --bind 0.0.0.0:8000"