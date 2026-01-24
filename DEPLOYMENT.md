# AWS Lightsail Deployment Guide

## Prerequisites

1. **AWS Account** - [Sign up here](https://aws.amazon.com)
2. **Docker installed** - [Install Docker](https://docs.docker.com/get-docker/)
3. **AWS CLI configured** - Run `aws configure`

## Quick Start (5 Minutes)

### Step 1: Configure AWS CLI
```bash
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Output format: json
```

### Step 2: Deploy
```bash
./deploy-lightsail.sh
```

That's it! The script will:
- ✅ Build Docker image
- ✅ Create Lightsail service
- ✅ Push and deploy
- ✅ Give you the public URL

## What You Get

### Your Live App
```
https://security-recipes-xxxxx.us-east-1.cs.amazonlightsail.com
```

### Features
- ✅ Accessible from anywhere
- ✅ Newsboat runs automatically
- ✅ Feeds update every 6 hours
- ✅ URL health checks every 12 hours
- ✅ Persistent storage for recipes
- ✅ SSL/HTTPS included
- ✅ Auto-restart on crashes

### Cost
**$3.50/month** for:
- 512 MB RAM
- 0.25 vCPU
- 20 GB SSD
- 500 GB data transfer

## Manual Deployment Steps

### 1. Build Locally
```bash
# Test the Docker build
docker build -t security-recipes .

# Test locally
docker-compose up

# Visit http://localhost:3000
```

### 2. Create Lightsail Service
```bash
aws lightsail create-container-service \
    --service-name security-recipes \
    --power small \
    --scale 1 \
    --region us-east-1
```

### 3. Push Image
```bash
aws lightsail push-container-image \
    --service-name security-recipes \
    --label security-recipes \
    --image security-recipes:latest \
    --region us-east-1
```

### 4. Deploy
```bash
# Get the image name from previous step
IMAGE_NAME="<from-previous-output>"

# Create deployment
aws lightsail create-container-service-deployment \
    --service-name security-recipes \
    --containers '{
        "security-recipes": {
            "image": "'$IMAGE_NAME'",
            "ports": {"3000": "HTTP"}
        }
    }' \
    --public-endpoint '{
        "containerName": "security-recipes",
        "containerPort": 3000,
        "healthCheck": {"path": "/"}
    }' \
    --region us-east-1
```

## Post-Deployment

### Get Your URL
```bash
aws lightsail get-container-services \
    --service-name security-recipes \
    --region us-east-1 \
    --query 'containerServices[0].url' \
    --output text
```

### View Logs
```bash
aws lightsail get-container-log \
    --service-name security-recipes \
    --container-name security-recipes \
    --region us-east-1
```

### Check Status
```bash
aws lightsail get-container-services \
    --service-name security-recipes \
    --region us-east-1
```

## Updating Your App

### After Code Changes
```bash
# Rebuild and redeploy
./deploy-lightsail.sh
```

Or manually:
```bash
# Build new image
docker build -t security-recipes .

# Push to Lightsail
aws lightsail push-container-image \
    --service-name security-recipes \
    --label security-recipes \
    --image security-recipes:latest

# Redeploy (use new image name)
aws lightsail create-container-service-deployment ...
```

## Custom Domain (Optional)

### 1. Register Domain
- Use Route 53, Namecheap, or any registrar

### 2. Create SSL Certificate
```bash
aws lightsail create-certificate \
    --certificate-name security-recipes-cert \
    --domain-name yourdomain.com \
    --subject-alternative-names www.yourdomain.com
```

### 3. Attach to Service
```bash
aws lightsail attach-certificate-to-distribution \
    --certificate-name security-recipes-cert \
    --distribution-name security-recipes
```

### 4. Update DNS
Point your domain to the Lightsail URL

## Scaling

### Upgrade Instance Size
```bash
# Upgrade to medium (1GB RAM, 0.5 vCPU) - $7/month
aws lightsail update-container-service \
    --service-name security-recipes \
    --power medium

# Or large (2GB RAM, 1 vCPU) - $14/month
aws lightsail update-container-service \
    --service-name security-recipes \
    --power large
```

### Scale Horizontally
```bash
# Run 2 containers for high availability
aws lightsail update-container-service \
    --service-name security-recipes \
    --scale 2
```

## Backup & Recovery

### Backup Recipes
```bash
# SSH into container (if needed)
aws lightsail get-container-service-deployments \
    --service-name security-recipes

# Or use volumes
docker volume ls
docker run --rm -v security-recipes_recipes-data:/data \
    -v $(pwd):/backup alpine tar czf /backup/recipes-backup.tar.gz /data
```

### Restore
```bash
docker run --rm -v security-recipes_recipes-data:/data \
    -v $(pwd):/backup alpine tar xzf /backup/recipes-backup.tar.gz -C /
```

## Monitoring

### CloudWatch Metrics
- CPU utilization
- Memory usage
- Request count
- Response time

### Set Up Alarms
```bash
aws lightsail put-alarm \
    --alarm-name high-cpu \
    --metric-name CPUUtilization \
    --monitored-resource-name security-recipes \
    --comparison-operator GreaterThanThreshold \
    --threshold 80
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
aws lightsail get-container-log \
    --service-name security-recipes \
    --container-name security-recipes \
    --start-time $(date -u -d '10 minutes ago' +%s)
```

### Out of Memory
```bash
# Upgrade to medium
aws lightsail update-container-service \
    --service-name security-recipes \
    --power medium
```

### Deployment Failed
```bash
# Check deployment status
aws lightsail get-container-service-deployments \
    --service-name security-recipes

# Rollback to previous version
aws lightsail create-container-service-deployment \
    --service-name security-recipes \
    --containers <previous-config>
```

## Cost Optimization

### Current: $3.50/month
- Small instance
- 1 container
- Included data transfer

### If You Need More:
- Medium: $7/month (2x resources)
- Large: $14/month (4x resources)
- 2 containers: 2x price (high availability)

### Free Tier
- First 3 months free (if new AWS account)

## Cleanup

### Delete Everything
```bash
aws lightsail delete-container-service \
    --service-name security-recipes \
    --region us-east-1
```

This removes:
- Container service
- All deployments
- Stored images
- **⚠️ All recipes (backup first!)**

## Support

### AWS Support
- [Lightsail Documentation](https://docs.aws.amazon.com/lightsail/)
- [AWS Forums](https://forums.aws.amazon.com/forum.jspa?forumID=231)

### Common Issues
1. **Deployment timeout** - Increase health check interval
2. **Out of memory** - Upgrade instance size
3. **Slow performance** - Enable CloudFront CDN
4. **High costs** - Check data transfer usage

## Next Steps

1. ✅ Deploy with `./deploy-lightsail.sh`
2. ✅ Bookmark your URL
3. ✅ Set up custom domain (optional)
4. ✅ Configure backups
5. ✅ Share with team

Your app is now accessible from anywhere! 🎉
