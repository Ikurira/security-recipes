#!/bin/bash

# AWS Lightsail Deployment Script for Security Recipes
# This script deploys your app to AWS Lightsail

set -e

echo "🚀 Security Recipes - AWS Lightsail Deployment"
echo "=============================================="

# Configuration
APP_NAME="security-recipes"
REGION="us-east-1"  # Change to your preferred region
CONTAINER_PORT=3000
PUBLIC_PORT=80

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Installing..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured."
    echo "Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✓${NC} AWS CLI configured"

# Build Docker image
echo ""
echo "📦 Building Docker image..."
docker build -t $APP_NAME:latest .

echo -e "${GREEN}✓${NC} Docker image built"

# Test locally (optional)
read -p "Test locally first? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧪 Testing locally on http://localhost:3000"
    echo "Press Ctrl+C to stop and continue deployment"
    docker-compose up
fi

# Push to AWS Lightsail
echo ""
echo "☁️  Deploying to AWS Lightsail..."

# Create Lightsail container service (if doesn't exist)
if ! aws lightsail get-container-services --service-name $APP_NAME --region $REGION &> /dev/null; then
    echo "Creating Lightsail container service..."
    aws lightsail create-container-service \
        --service-name $APP_NAME \
        --power small \
        --scale 1 \
        --region $REGION
    
    echo "⏳ Waiting for service to be ready (this takes 2-3 minutes)..."
    aws lightsail wait container-service-deployed \
        --service-name $APP_NAME \
        --region $REGION
fi

echo -e "${GREEN}✓${NC} Container service ready"

# Push image to Lightsail
echo "📤 Pushing image to Lightsail..."
aws lightsail push-container-image \
    --service-name $APP_NAME \
    --label $APP_NAME \
    --image $APP_NAME:latest \
    --region $REGION

# Get the image name
IMAGE_NAME=$(aws lightsail get-container-images --service-name $APP_NAME --region $REGION --query 'containerImages[0].image' --output text)

echo -e "${GREEN}✓${NC} Image pushed: $IMAGE_NAME"

# Create deployment configuration
cat > deployment.json <<EOF
{
  "containers": {
    "$APP_NAME": {
      "image": "$IMAGE_NAME",
      "ports": {
        "$CONTAINER_PORT": "HTTP"
      },
      "environment": {
        "NODE_ENV": "production"
      }
    }
  },
  "publicEndpoint": {
    "containerName": "$APP_NAME",
    "containerPort": $CONTAINER_PORT,
    "healthCheck": {
      "path": "/",
      "intervalSeconds": 30
    }
  }
}
EOF

# Deploy
echo "🚀 Deploying container..."
aws lightsail create-container-service-deployment \
    --service-name $APP_NAME \
    --cli-input-json file://deployment.json \
    --region $REGION

rm deployment.json

echo ""
echo "⏳ Waiting for deployment to complete (2-3 minutes)..."
aws lightsail wait container-service-deployed \
    --service-name $APP_NAME \
    --region $REGION

# Get the public URL
PUBLIC_URL=$(aws lightsail get-container-services --service-name $APP_NAME --region $REGION --query 'containerServices[0].url' --output text)

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=============================================="
echo ""
echo "🌐 Your app is live at:"
echo -e "${YELLOW}https://$PUBLIC_URL${NC}"
echo ""
echo "📊 Monitor your service:"
echo "aws lightsail get-container-services --service-name $APP_NAME --region $REGION"
echo ""
echo "📝 View logs:"
echo "aws lightsail get-container-log --service-name $APP_NAME --container-name $APP_NAME --region $REGION"
echo ""
echo "💰 Monthly cost: ~\$3.50"
echo ""
