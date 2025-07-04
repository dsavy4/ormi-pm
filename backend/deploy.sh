#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment of Ormi API to Cloudflare Workers..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️ No .env file found. Make sure your environment variables are set."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --no-audit

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npm run prisma:generate

# Build the application
echo "🏗️ Building the application..."
npm run build

# Check for database URL
if [ -z "$DATABASE_URL" ]; then
  # Try to get from .env file
  if grep -q "DATABASE_URL=" .env; then
    export DATABASE_URL=$(grep "DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"')
    echo "📝 Using DATABASE_URL from .env file"
  else
    echo "⚠️ DATABASE_URL environment variable not found!"
    echo "Make sure it's set in your environment or .env file"
    exit 1
  fi
fi

# Check for JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
  # Try to get from .env file
  if grep -q "JWT_SECRET=" .env; then
    export JWT_SECRET=$(grep "JWT_SECRET=" .env | cut -d '=' -f2- | tr -d '"')
    echo "📝 Using JWT_SECRET from .env file"
  else
    echo "⚠️ JWT_SECRET environment variable not found!"
    echo "Make sure it's set in your environment or .env file"
    exit 1
  fi
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Error: wrangler is not installed. Please install it with 'npm install -g wrangler'"
    exit 1
fi

# Set secrets in Cloudflare Workers
echo "🔐 Setting secrets in Cloudflare Workers..."
echo "$DATABASE_URL" | wrangler secret put DATABASE_URL
echo "$JWT_SECRET" | wrangler secret put JWT_SECRET

# Deploy to Cloudflare
echo "☁️ Deploying to Cloudflare Workers..."
npx wrangler deploy --env production

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo "✅ Deployed successfully! Your API is available at https://api.ormi.com"
  
  # Post-deployment verification
  echo "🔍 Testing API health endpoint..."
  curl -s https://api.ormi.com/api/health | jq || echo "Could not verify health endpoint"
  
else
  echo "❌ Deployment failed. Check the logs above for errors."
  exit 1
fi

echo "🎉 Deployment completed successfully!" 