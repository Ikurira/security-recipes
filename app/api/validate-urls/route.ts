import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const checkAll = searchParams.get('all') === 'true'

  try {
    const dbPath = `${process.env.HOME}/snap/newsboat/8729/.newsboat/cache.db`
    
    // Get all unique URLs from recent articles
    const query = `SELECT DISTINCT url, title FROM rss_item WHERE deleted = 0 AND url != '' LIMIT ${checkAll ? 200 : 50}`
    const { stdout } = await execAsync(`sqlite3 -separator '|||' "${dbPath}" "${query}"`)
    
    if (!stdout.trim()) {
      return NextResponse.json({ 
        checked: 0,
        valid: 0,
        invalid: 0,
        results: []
      })
    }

    const urls = stdout.trim().split('\n').map(line => {
      const [url, title] = line.split('|||')
      return { url, title }
    })

    // Check URLs in batches
    const results = await Promise.all(
      urls.map(async ({ url, title }) => {
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout

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
            title: title.substring(0, 100),
            status: response.status,
            valid: response.status >= 200 && response.status < 400,
            error: null
          }
        } catch (error: any) {
          return {
            url,
            title: title.substring(0, 100),
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
      results: results.filter(r => !r.valid), // Only return invalid URLs
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
