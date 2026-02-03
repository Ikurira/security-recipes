import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

// Import the same feeds used in the main app
const RSS_FEEDS: Record<string, string[]> = {
  'Cloud Security': [
    'https://aws.amazon.com/blogs/security/feed/',
    'https://blog.cloudflare.com/rss/'
  ],
  'Hardware Security': [
    'https://www.schneier.com/blog/atom.xml',
    'https://www.darkreading.com/rss.xml'
  ],
  'Infrastructure': [
    'https://krebsonsecurity.com/feed/',
    'https://isc.sans.edu/rssfeed.xml',
    'https://threatpost.com/feed/'
  ],
  'Malware Research': [
    'https://www.bleepingcomputer.com/feed/',
    'https://blog.talosintelligence.com/rss/'
  ],
  'Government Alerts': [
    'https://www.cisa.gov/cybersecurity-advisories/all.xml'
  ],
  'Zero Trust': [
    'https://www.csoonline.com/feed/'
  ],
  'Container Security': [
    'https://www.aquasec.com/feed/'
  ],
  'TPM/HSM': [
    'https://www.schneier.com/blog/atom.xml'
  ],
  'DevSecOps': [
    'https://devops.com/category/blogs/devsecops/feed/',
    'https://www.sonatype.com/blog/rss.xml'
  ],
  'Compliance': [
    'https://www.csoonline.com/feed/'
  ]
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const checkArticles = searchParams.get('articles') === 'true'

  // Get all unique URLs from RSS_FEEDS
  const allFeedUrls = Array.from(new Set(Object.values(RSS_FEEDS).flat()))

  try {
    if (!checkArticles) {
      // Quick check: Just validate feed URLs
      const results = await Promise.all(
        allFeedUrls.map(async (url) => {
          try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 5000)

            const response = await fetch(url, {
              method: 'HEAD',
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SecurityRecipes/1.0)'
              }
            })

            clearTimeout(timeout)

            return {
              url,
              title: url.split('/')[2],
              status: response.status,
              valid: response.status >= 200 && response.status < 400,
              error: null
            }
          } catch (error: any) {
            return {
              url,
              title: url.split('/')[2],
              status: 0,
              valid: false,
              error: error.name === 'AbortError' ? 'Timeout' : error.message
            }
          }
        })
      )

      const valid = results.filter(r => r.valid).length
      const invalid = results.filter(r => !r.valid).length

      return NextResponse.json({
        checked: results.length,
        valid,
        invalid,
        validPercentage: Math.round((valid / results.length) * 100),
        results: results.filter(r => !r.valid),
        timestamp: new Date().toISOString()
      })
    } else {
      // Full check: Fetch feeds and validate article links
      const allResults: any[] = []

      for (const feedUrl of allFeedUrls) {
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 5000)
          
          const feed = await parser.parseURL(feedUrl)
          clearTimeout(timeout)

          // Check first 5 articles from each feed
          const articles = feed.items.slice(0, 5)
          
          for (const article of articles) {
            if (article.link) {
              try {
                const artController = new AbortController()
                const artTimeout = setTimeout(() => artController.abort(), 3000)

                const response = await fetch(article.link, {
                  method: 'HEAD',
                  signal: artController.signal,
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; SecurityRecipes/1.0)'
                  }
                })

                clearTimeout(artTimeout)

                allResults.push({
                  url: article.link,
                  title: article.title || 'Untitled',
                  status: response.status,
                  valid: response.status >= 200 && response.status < 400,
                  error: null
                })
              } catch (error: any) {
                allResults.push({
                  url: article.link,
                  title: article.title || 'Untitled',
                  status: 0,
                  valid: false,
                  error: error.name === 'AbortError' ? 'Timeout' : error.message
                })
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch feed ${feedUrl}:`, error)
        }
      }

      const valid = allResults.filter(r => r.valid).length
      const invalid = allResults.filter(r => !r.valid).length

      return NextResponse.json({
        checked: allResults.length,
        valid,
        invalid,
        validPercentage: valid > 0 ? Math.round((valid / allResults.length) * 100) : 0,
        results: allResults.filter(r => !r.valid),
        timestamp: new Date().toISOString()
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      checked: 0,
      valid: 0,
      invalid: 0
    }, { status: 500 })
  }
}
