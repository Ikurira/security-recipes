# Deploying to Vercel

This app is ready to deploy to Vercel with zero configuration.

## Quick Deploy

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Refactor for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

That's it! Vercel will automatically detect Next.js and deploy your app.

## How It Works

The app now fetches RSS feeds directly via HTTP requests instead of relying on local newsboat installation:

- **API Routes**: `/api/feeds`, `/api/counts`, `/api/validate-urls` fetch RSS feeds on-demand
- **RSS Parser**: Uses `rss-parser` npm package to parse feeds
- **Serverless**: All API routes run as serverless functions on Vercel
- **No Database**: No persistent storage needed - feeds are fetched fresh each time

## Environment Variables

No environment variables are required for basic functionality.

## Custom Domain (Optional)

After deployment, you can add a custom domain in Vercel's project settings.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
