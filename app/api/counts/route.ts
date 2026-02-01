import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

const RSS_FEEDS: Record<string, string[]> = {
  'Cloud Security': [
    'https://aws.amazon.com/blogs/security/feed/',
    'https://cloud.google.com/blog/products/identity-security/rss',
    'https://www.cloudflare.com/rss/blog/'
  ],
  'Hardware Security': [
    'https://www.schneier.com/blog/atom.xml',
    'https://www.darkreading.com/rss/all.xml'
  ],
  'Infrastructure': [
    'https://krebsonsecurity.com/feed/',
    'https://www.sans.org/blog/rss/',
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
    'https://sysdig.com/blog/feed/',
    'https://www.aquasec.com/blog/feed/'
  ],
  'TPM/HSM': [
    'https://trustedcomputinggroup.org/feed/'
  ],
  'DevSecOps': [
    'https://devops.com/category/blogs/devsecops/feed/',
    'https://www.sonatype.com/blog/rss.xml'
  ],
  'Compliance': [
    'https://www.complianceweek.com/rss'
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

export async function GET() {
  try {
    const counts: Record<string, number> = {}

    const countPromises = Object.entries(RSS_FEEDS).map(async ([topic, feedUrls]) => {
      try {
        const fetchPromises = feedUrls.map(async (url) => {
          try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 5000)
            
            const feed = await parser.parseURL(url)
            clearTimeout(timeout)
            
            return feed.items.slice(0, 20)
          } catch {
            return []
          }
        })

        const feedResults = await Promise.all(fetchPromises)
        const items = feedResults.flat()

        const keywords = topicKeywords[topic] || [topic.toLowerCase()]
        let matchCount = 0

        items.forEach(item => {
          const title = cleanHTML(item.title || '').toLowerCase()
          let score = 0
          keywords.forEach(kw => {
            if (title.includes(kw)) score += 100
          })
          if (score > 0) matchCount++
        })

        counts[topic] = Math.min(matchCount, 20)
      } catch {
        counts[topic] = 0
      }
    })

    await Promise.all(countPromises)

    return NextResponse.json(counts)
  } catch (error: any) {
    console.error('Counts API error:', error)
    return NextResponse.json({
      'Cloud Security': 0,
      'Hardware Security': 0,
      'Infrastructure': 0,
      'Malware Research': 0,
      'Government Alerts': 0
    })
  }
}
