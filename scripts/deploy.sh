#!/bin/bash

# Ormi Property Management - Deployment Script
# This script deploys the application to Cloudflare Pages and Workers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Ormi Property Management - Deployment Script${NC}"

# Check if environment is specified
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Environment not specified${NC}"
    echo "Usage: ./deploy.sh [production|development]"
    exit 1
fi

ENVIRONMENT=$1

# Validate environment
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "development" ]; then
    echo -e "${RED}❌ Error: Invalid environment '$ENVIRONMENT'${NC}"
    echo "Valid environments: production, development"
    exit 1
fi

echo -e "${YELLOW}📋 Deploying to: $ENVIRONMENT${NC}"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Error: Wrangler CLI not found${NC}"
    echo "Install with: npm install -g wrangler"
    exit 1
fi

# Check if user is authenticated with Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo -e "${RED}❌ Error: Not authenticated with Cloudflare${NC}"
    echo "Login with: wrangler login"
    exit 1
fi

# Security checks
echo -e "${YELLOW}🔐 Running security checks...${NC}"

# Check for secure JWT secret
if [ -f "backend/.env" ]; then
    JWT_SECRET=$(grep "JWT_SECRET" backend/.env | cut -d'=' -f2 | tr -d '"')
    if [ ${#JWT_SECRET} -lt 64 ]; then
        echo -e "${RED}❌ Error: JWT secret is too short (less than 64 characters)${NC}"
        echo "Generate a secure JWT secret with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
        exit 1
    fi
fi

# Build applications
echo -e "${YELLOW}🏗️ Building applications...${NC}"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build frontend
echo "Building frontend..."
npm run build:frontend

# Build backend
echo "Building backend..."
npm run build:backend

# Deploy based on environment
if [ "$ENVIRONMENT" == "production" ]; then
    echo -e "${YELLOW}🚀 Deploying to production...${NC}"
    
    # Deploy backend to Cloudflare Workers
    echo "Deploying backend to Cloudflare Workers..."
    cd backend
    wrangler deploy --env production
    cd ..
    
    # Deploy frontend to Cloudflare Pages
    echo "Deploying frontend to Cloudflare Pages..."
    # Note: Frontend deployment is typically handled by GitHub Actions
    # or can be done manually through the Cloudflare dashboard
    
elif [ "$ENVIRONMENT" == "development" ]; then
    echo -e "${YELLOW}🚀 Deploying to development...${NC}"
    
    # Deploy backend to Cloudflare Workers (dev)
    echo "Deploying backend to Cloudflare Workers (dev)..."
    cd backend
    wrangler deploy --env development
    cd ..
    
    # Deploy frontend to Cloudflare Pages (dev)
    echo "Deploying frontend to Cloudflare Pages (dev)..."
    # Note: Frontend deployment is typically handled by GitHub Actions
    
fi

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

# Show deployment URLs
if [ "$ENVIRONMENT" == "production" ]; then
    echo -e "${GREEN}🌐 Production URLs:${NC}"
    echo "  Frontend: https://app.ormi.com"
    echo "  Backend API: https://api.ormi.com"
else
    echo -e "${GREEN}🌐 Development URLs:${NC}"
    echo "  Frontend: https://app-dev.ormi.com"
    echo "  Backend API: https://api-dev.ormi.com"
fi

echo -e "${YELLOW}💡 Next steps:${NC}"
echo "  1. Verify deployment by checking the URLs above"
echo "  2. Test critical functionality (auth, API endpoints)"
echo "  3. Monitor logs for any issues"
echo "  4. Update DNS records if needed" 