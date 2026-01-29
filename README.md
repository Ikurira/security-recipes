# Security Recipes

Security-focused recipes for building securely. A React/Next.js application that processes security RSS feeds and generates curated security content.

## Features

- 🔒 **Security Recipe Generator** - Creates themed security content from RSS feeds
- 🔊 **Text-to-Speech** - Read recipes aloud with built-in speech synthesis
- 📝 **Publishing System** - Save recipes as markdown files with metadata
- 📚 **Recipe Listings** - Browse all published security recipes
- 🌙 **Dark Theme UI** - Modern glass morphism design
- 📱 **Responsive Layout** - Works on desktop and mobile
- ☁️ **Vercel Ready** - Deploys to Vercel with no external dependencies

## Tech Stack

- **Frontend**: React, Next.js 14, TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Content**: Markdown with frontmatter, RSS feed processing
- **APIs**: Next.js API routes for publishing

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:3000`

## Usage

### Recipe Generation
1. Select a feed topic from the sidebar
2. View generated key themes and security brief
3. Click "Read Aloud" to hear the content
4. Click "Publish Recipe" to save as markdown

### Viewing Recipes
- Visit `/recipes` to see all published recipes
- Click individual recipes to view full content
- Each recipe includes themes, brief, and metadata

## RSS Integration

The application fetches RSS feeds directly from security news sources covering:
- General security news (Krebs, SANS, Dark Reading)
- Cloud security (AWS, Microsoft, Google Cloud)
- Infrastructure security (hardware, firmware, TPM)
- Security research and government alerts

Feeds are fetched on-demand when you select a topic, with no local dependencies required.

## Project Structure

```
├── app/
│   ├── components/          # React components
│   ├── api/publish/         # Publishing API endpoint
│   ├── recipes/             # Recipe listing and detail pages
│   └── globals.css          # Global styles
├── content/recipes/         # Published recipe markdown files
└── package.json
```

## Contributing

This is a personal security knowledge platform. Feel free to fork and adapt for your own use.

## License

MIT License - See LICENSE file for details.
