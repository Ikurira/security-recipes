import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs-extra'
import path from 'path'
import matter from 'gray-matter'

export async function POST(request: NextRequest) {
  try {
    const { title, themes, brief, category = 'cloud-security' } = await request.json()
    
    // Create content directory if it doesn't exist
    const contentDir = path.join(process.cwd(), 'content', 'recipes')
    await fs.ensureDir(contentDir)
    
    // Generate filename from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    const filename = `${new Date().toISOString().split('T')[0]}-${slug}.md`
    const filepath = path.join(contentDir, filename)
    
    // Create frontmatter
    const frontmatter = {
      title,
      date: new Date().toISOString(),
      category,
      tags: themes.map((theme: string) => 
        theme.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      ),
      sources: 15,
      published: true
    }
    
    // Create markdown content
    const content = `
# Key Security Themes

${themes.map((theme: string) => `- ${theme}`).join('\n')}

# Security Recipe Brief

${brief}

---

*This recipe was automatically generated from security RSS feeds and curated for building secure systems.*
`
    
    // Generate markdown file with frontmatter
    const fileContent = matter.stringify(content.trim(), frontmatter)
    
    // Write file
    await fs.writeFile(filepath, fileContent)
    
    // Create index entry
    const indexPath = path.join(contentDir, 'index.json')
    let index = []
    
    if (await fs.pathExists(indexPath)) {
      index = await fs.readJson(indexPath)
    }
    
    index.unshift({
      slug,
      title,
      date: frontmatter.date,
      category,
      tags: frontmatter.tags,
      filepath: filename
    })
    
    await fs.writeJson(indexPath, index, { spaces: 2 })
    
    return NextResponse.json({
      success: true,
      message: 'Recipe published successfully!',
      filepath: filename,
      url: `/recipes/${slug}`
    })
    
  } catch (error) {
    console.error('Publishing error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to publish recipe' },
      { status: 500 }
    )
  }
}
