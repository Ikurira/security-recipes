import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

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

  const topicKeywords: Record<string, string[]> = {
    'Cloud Security': ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'kubernetes', 'container', 'saas', 'serverless', 'lambda'],
    'Hardware Security': ['hardware', 'firmware', 'chip', 'processor', 'tpm', 'hsm', 'device', 'iot', 'embedded', 'silicon'],
    'Infrastructure': ['network', 'infrastructure', 'server', 'breach', 'attack', 'vulnerability', 'exploit', 'penetration', 'firewall', 'vpn'],
    'Malware Research': ['malware', 'ransomware', 'trojan', 'virus', 'threat', 'exploit', 'phishing', 'botnet', 'backdoor', 'payload'],
    'Government Alerts': ['cisa', 'cert', 'government', 'advisory', 'cve', 'alert', 'nist', 'fbi', 'dhs', 'federal'],
    // Popular Tags
    'Zero Trust': ['zero trust', 'ztna', 'least privilege', 'microsegmentation', 'identity', 'authentication', 'authorization'],
    'Container Security': ['container', 'docker', 'kubernetes', 'k8s', 'pod', 'orchestration', 'containerization'],
    'TPM/HSM': ['tpm', 'hsm', 'hardware security module', 'trusted platform module', 'secure enclave', 'hardware'],
    'DevSecOps': ['devsecops', 'devops', 'ci/cd', 'pipeline', 'shift left', 'automation', 'development'],
    'Compliance': ['compliance', 'gdpr', 'hipaa', 'sox', 'pci', 'regulation', 'audit', 'regulatory']
  }

  try {
    const dbPath = `${process.env.HOME}/snap/newsboat/8729/.newsboat/cache.db`
    
    // First get titles to identify relevant articles
    const titleQuery = `SELECT id, title FROM rss_item WHERE deleted = 0 ORDER BY pubDate DESC LIMIT 200`
    const { stdout: titleOutput } = await execAsync(`sqlite3 -separator '|||' "${dbPath}" "${titleQuery}"`)
    
    if (!titleOutput.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'No articles found. Run: newsboat -x reload' 
      })
    }

    const titleData = titleOutput.trim().split('\n').map(line => {
      const [id, title] = line.split('|||')
      return { id, title: cleanHTML(title || '') }
    })

    // Score by title keywords
    const keywords = topicKeywords[topic] || [topic.toLowerCase()]
    const scoredTitles = titleData.map(item => {
      const titleLower = item.title.toLowerCase()
      let score = 0
      keywords.forEach(kw => {
        if (titleLower.includes(kw)) score += 100
      })
      return { ...item, score }
    })

    let relevantIds = scoredTitles
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(a => a.id)

    if (relevantIds.length === 0) {
      return NextResponse.json({
        success: true,
        topic,
        articleCount: 0,
        themes: [],
        brief: `No recent articles found for ${topic}. Run 'newsboat -x reload' to fetch more feeds, or check back later as new content is published.`
      })
    }

    // Get content for relevant articles
    const contentQuery = `SELECT title, content, url FROM rss_item WHERE id IN (${relevantIds.join(',')})`
    const { stdout: contentOutput } = await execAsync(`sqlite3 -separator '|||' "${dbPath}" "${contentQuery}"`)
    
    const articles = contentOutput.trim().split('\n').map(line => {
      const parts = line.split('|||')
      const title = cleanHTML(parts[0] || '')
      const rawContent = parts.slice(1, -1).join('|||') // Content might have |||
      const url = parts[parts.length - 1] || '' // URL is always last
      const content = cleanHTML(rawContent)
      return { title, content, url }
    }).filter(a => a.title.length > 5 && a.content.length > 50)

    const themes = articles.slice(0, 6).map(a => ({
      title: a.title,
      url: a.url
    }))
    
    // Generate comprehensive professional brief
    const briefParagraphs = articles.slice(0, 8).map(a => {
      // Extract meaningful sentences from content
      const sentences = a.content
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 40 && s.length < 300)
      
      // Take first 2-3 good sentences per article
      return sentences.slice(0, 3).join('. ') + '.'
    }).filter(text => text.length > 50)

    // Structure as professional brief with paragraphs
    const brief = briefParagraphs.length > 0
      ? briefParagraphs.join('\n\n')
      : `Recent ${topic} updates from security industry sources.`

    return NextResponse.json({
      success: true,
      topic,
      articleCount: articles.length,
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
