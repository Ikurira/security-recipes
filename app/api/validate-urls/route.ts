import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const checkAll = searchParams.get('all') === 'true'

  // Sample URLs from RSS feeds to validate
  const sampleUrls = [
    'https://aws.amazon.com/blogs/security/feed/',
    'https://cloud.google.com/blog/products/identity-security/rss',
    'https://www.cloudflare.com/rss/blog/',
    'https://www.schneier.com/blog/atom.xml',
    'https://krebsonsecurity.com/feed/',
    'https://www.sans.org/blog/rss/',
    'https://www.bleepingcomputer.com/feed/',
    'https://www.cisa.gov/cybersecurity-advisories/all.xml'
  ]

  try {
    const results = await Promise.all(
      sampleUrls.map(async (url) => {
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
            title: url,
            status: response.status,
            valid: response.status >= 200 && response.status < 400,
            error: null
          }
        } catch (error: any) {
          return {
            url,
            title: url,
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
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      checked: 0,
      valid: 0,
      invalid: 0
    }, { status: 500 })
  }
}
