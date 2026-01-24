#!/bin/bash

# Setup script for GitHub Actions deployment to AWS App Runner

set -e

echo "🚀 Setting up GitHub Actions deployment for Security Recipes"
echo "=============================================================="

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run: aws login"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"
APP_NAME="security-recipes"

echo "✓ AWS Account: $ACCOUNT_ID"
echo "✓ Region: $REGION"

# Step 1: Create ECR repository
echo ""
echo "📦 Creating ECR repository..."
aws ecr create-repository \
    --repository-name $APP_NAME \
    --region $REGION \
    --image-scanning-configuration scanOnPush=true 2>/dev/null || echo "Repository already exists"

ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$APP_NAME"
echo "✓ ECR Repository: $ECR_URI"

# Step 2: Create IAM role for GitHub Actions
echo ""
echo "🔐 Creating IAM role for GitHub Actions..."

GITHUB_REPO="Ikurira/security-recipes"
OIDC_PROVIDER="token.actions.githubusercontent.com"

# Create OIDC provider if it doesn't exist
aws iam create-open-id-connect-provider \
    --url "https://$OIDC_PROVIDER" \
    --client-id-list "sts.amazonaws.com" \
    --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1" 2>/dev/null || echo "OIDC provider already exists"

# Create trust policy
cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::$ACCOUNT_ID:oidc-provider/$OIDC_PROVIDER"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "$OIDC_PROVIDER:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "$OIDC_PROVIDER:sub": "repo:$GITHUB_REPO:*"
        }
      }
    }
  ]
}
EOF

# Create role
aws iam create-role \
    --role-name GitHubActionsSecurityRecipes \
    --assume-role-policy-document file:///tmp/trust-policy.json 2>/dev/null || echo "Role already exists"

# Attach policies
aws iam attach-role-policy \
    --role-name GitHubActionsSecurityRecipes \
    --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-role-policy \
    --role-name GitHubActionsSecurityRecipes \
    --policy-arn arn:aws:iam::aws:policy/AWSAppRunnerFullAccess

ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/GitHubActionsSecurityRecipes"
echo "✓ IAM Role: $ROLE_ARN"

# Step 3: Create App Runner service
echo ""
echo "☁️  Creating App Runner service..."

# Create App Runner IAM role
cat > /tmp/apprunner-trust.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "build.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
    --role-name AppRunnerECRAccessRole \
    --assume-role-policy-document file:///tmp/apprunner-trust.json 2>/dev/null || echo "App Runner role exists"

aws iam attach-role-policy \
    --role-name AppRunnerECRAccessRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess

APPRUNNER_ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/AppRunnerECRAccessRole"

# Push initial image to ECR
echo ""
echo "📤 Pushing initial Docker image to ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URI
docker tag security-recipes:latest $ECR_URI:latest
docker push $ECR_URI:latest

# Create App Runner service
echo ""
echo "🚀 Creating App Runner service..."
SERVICE_ARN=$(aws apprunner create-service \
    --service-name $APP_NAME \
    --source-configuration "ImageRepository={ImageIdentifier=$ECR_URI:latest,ImageRepositoryType=ECR,ImageConfiguration={Port=3000}},AutoDeploymentsEnabled=false,AuthenticationConfiguration={AccessRoleArn=$APPRUNNER_ROLE_ARN}" \
    --instance-configuration "Cpu=1024,Memory=2048" \
    --region $REGION \
    --query 'Service.ServiceArn' \
    --output text 2>&1)

if [[ $SERVICE_ARN == arn:* ]]; then
    echo "✓ App Runner Service created: $SERVICE_ARN"
else
    # Service might already exist
    SERVICE_ARN=$(aws apprunner list-services --region $REGION --query "ServiceSummaryList[?ServiceName=='$APP_NAME'].ServiceArn" --output text)
    echo "✓ Using existing service: $SERVICE_ARN"
fi

# Wait for service to be ready
echo ""
echo "⏳ Waiting for App Runner service to be ready (2-3 minutes)..."
sleep 180

SERVICE_URL=$(aws apprunner describe-service \
    --service-arn $SERVICE_ARN \
    --region $REGION \
    --query 'Service.ServiceUrl' \
    --output text)

echo ""
echo "=============================================================="
echo "✅ Setup Complete!"
echo "=============================================================="
echo ""
echo "📝 Add these secrets to your GitHub repository:"
echo "   Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "   AWS_ROLE_ARN:"
echo "   $ROLE_ARN"
echo ""
echo "   APP_RUNNER_SERVICE_ARN:"
echo "   $SERVICE_ARN"
echo ""
echo "🌐 Your app is deploying at:"
echo "   https://$SERVICE_URL"
echo ""
echo "⏰ Wait 2-3 minutes for first deployment to complete"
echo ""
echo "🔄 Future deployments:"
echo "   Just push to main branch - auto-deploys!"
echo ""
