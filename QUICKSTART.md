# Quick Deploy - Security Recipes to AWS Lightsail

## One-Command Deploy
```bash
./deploy-lightsail.sh
```

## Prerequisites (One-Time Setup)
```bash
# 1. Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 2. Configure AWS
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Format (json)

# 3. Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## What Happens
1. ✅ Builds Docker image (~2 min)
2. ✅ Creates Lightsail service (~3 min)
3. ✅ Pushes image to AWS (~1 min)
4. ✅ Deploys container (~2 min)
5. ✅ Gives you public URL

**Total Time: ~8 minutes**

## Your App URL
```
https://security-recipes-xxxxx.us-east-1.cs.amazonlightsail.com
```

## Cost
**$3.50/month** - Cancel anytime

## Common Commands

### View Logs
```bash
aws lightsail get-container-log \
    --service-name security-recipes \
    --container-name security-recipes
```

### Check Status
```bash
aws lightsail get-container-services \
    --service-name security-recipes
```

### Update App
```bash
# After code changes
./deploy-lightsail.sh
```

### Delete Everything
```bash
aws lightsail delete-container-service \
    --service-name security-recipes
```

## Access Your App
1. Get URL from deployment output
2. Bookmark it
3. Access from any device
4. Share with team

## Support
- Full guide: `DEPLOYMENT.md`
- AWS Docs: https://docs.aws.amazon.com/lightsail/
