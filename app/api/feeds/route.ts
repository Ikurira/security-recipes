import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

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

const topicKeywords: Record<string, string[]> = {
  'Cloud Security': ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'kubernetes', 'container', 'saas', 'serverless', 'lambda'],
  'Hardware Security': ['hardware', 'firmware', 'chip', 'processor', 'tpm', 'hsm', 'device', 'iot', 'embedded', 'silicon'],
  'Infrastructure': ['network', 'infrastructure', 'server', 'breach', 'attack', 'vulnerability', 'exploit', 'penetration', 'firewall', 'vpn'],
  'Malware Research': ['malware', 'ransomware', 'trojan', 'virus', 'threat', 'exploit', 'phishing', 'botnet', 'backdoor', 'payload'],
  'Government Alerts': ['cisa', 'cert', 'government', 'advisory', 'cve', 'alert', 'nist', 'fbi', 'dhs', 'federal'],
  'Zero Trust': ['zero trust', 'ztna', 'least privilege', 'microsegmentation', 'identity', 'authentication', 'authorization'],
  'Container Security': ['container', 'docker', 'kubernetes', 'k8s', 'pod', 'orchestration', 'containerization'],
  'TPM/HSM': ['tpm', 'hsm', 'hardware security module', 'trusted platform module', 'secure enclave', 'hardware'],
  'DevSecOps': ['devsecops', 'devops', 'ci/cd', 'pipeline', 'shift left', 'automation', 'development'],
  'Compliance': ['compliance', 'gdpr', 'hipaa', 'sox', 'pci', 'regulation', 'audit', 'regulatory']
}

function cleanHTML(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const topic = searchParams.get('topic') || 'Cloud Security'

  try {
    const feedUrls = RSS_FEEDS[topic] || RSS_FEEDS['Cloud Security']
    const allArticles: Array<{ title: string; content: string; url: string; score: number }> = []

    // Fetch feeds with timeout
    const fetchPromises = feedUrls.map(async (url) => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)
        
        const feed = await parser.parseURL(url)
        clearTimeout(timeout)
        
        return feed.items.slice(0, 20)
      } catch (error) {
        console.error(`Failed to fetch ${url}:`, error)
        return []
      }
    })

    const feedResults = await Promise.all(fetchPromises)
    const items = feedResults.flat()

    // Score and filter articles with recency boost
    const keywords = topicKeywords[topic] || [topic.toLowerCase()]
    const now = Date.now()
    
    items.forEach(item => {
      const title = cleanHTML(item.title || '')
      const content = cleanHTML(item.contentSnippet || item.content || '')
      const titleLower = title.toLowerCase()
      const contentLower = content.toLowerCase()
      
      let score = 0
      keywords.forEach(kw => {
        if (titleLower.includes(kw)) score += 100
        if (contentLower.includes(kw)) score += 10
      })

      // Add recency boost: newer articles get higher scores
      const pubDate = item.pubDate || item.isoDate
      if (pubDate) {
        const articleDate = new Date(pubDate).getTime()
        const ageInDays = (now - articleDate) / (1000 * 60 * 60 * 24)
        
        // Boost recent articles: 200 points for today, decreasing over 30 days
        if (ageInDays < 30) {
          score += Math.max(0, 200 - (ageInDays * 6))
        }
      }

      if (score > 0 && title.length > 5) {
        allArticles.push({
          title,
          content,
          url: item.link || '',
          score
        })
      }
    })

    allArticles.sort((a, b) => b.score - a.score)
    const topArticles = allArticles.slice(0, 20)

    if (topArticles.length === 0) {
      return NextResponse.json({
        success: true,
        topic,
        articleCount: 0,
        themes: [],
        brief: `No recent articles found for ${topic}. Please try again later.`
      })
    }

    const themes = topArticles.slice(0, 6).map(a => ({
      title: a.title,
      url: a.url
    }))

    // Generate brief
    const briefParagraphs = topArticles.slice(0, 8).map(a => {
      const sentences = a.content
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 40 && s.length < 300)
      
      return sentences.slice(0, 2).join('. ') + '.'
    }).filter(text => text.length > 50)

    const brief = briefParagraphs.length > 0
      ? briefParagraphs.join('\n\n')
      : `Recent ${topic} updates from security industry sources.`

    return NextResponse.json({
      success: true,
      topic,
      articleCount: topArticles.length,
      themes,
      brief
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `Error: ${error.message}`,
      fallback: true
    })
  }
}
