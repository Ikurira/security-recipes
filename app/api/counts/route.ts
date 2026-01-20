import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    const dbPath = `${process.env.HOME}/snap/newsboat/8729/.newsboat/cache.db`

    // Get titles
    const query = `SELECT id, title FROM rss_item WHERE deleted = 0 LIMIT 200`
    const { stdout } = await execAsync(`sqlite3 -separator '|||' "${dbPath}" "${query}"`)
    
    if (!stdout || !stdout.trim()) {
      return NextResponse.json({ 
        'Cloud Security': 0,
        'Hardware Security': 0,
        'Infrastructure': 0,
        'Malware Research': 0,
        'Government Alerts': 0
      })
    }

    const titles = stdout.trim().split('\n').map(line => {
      const [id, title] = line.split('|||')
      return { id, title: (title || '').toLowerCase() }
    })

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

    const counts: Record<string, number> = {}
    
    Object.keys(topicKeywords).forEach(topic => {
      const keywords = topicKeywords[topic]
      const scored = titles.map(item => {
        let score = 0
        keywords.forEach(kw => {
          if (item.title.includes(kw)) score += 100
        })
        return { ...item, score }
      })
      
      const matching = scored
        .filter(a => a.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20) // Top 20 matches
      
      counts[topic] = matching.length
    })

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
