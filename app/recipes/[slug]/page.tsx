import fs from 'fs-extra'
import path from 'path'
import matter from 'gray-matter'
import { notFound } from 'next/navigation'

interface Recipe {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  content: string
  frontmatter: any
}

async function getRecipe(slug: string): Promise<Recipe | null> {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'recipes')
    const indexPath = path.join(contentDir, 'index.json')
    
    if (!await fs.pathExists(indexPath)) {
      return null
    }
    
    const index = await fs.readJson(indexPath)
    const recipeEntry = index.find((entry: any) => entry.slug === slug)
    
    if (!recipeEntry) {
      return null
    }
    
    const filepath = path.join(contentDir, recipeEntry.filepath)
    const fileContent = await fs.readFile(filepath, 'utf-8')
    const { data, content } = matter(fileContent)
    
    return {
      slug,
      title: data.title,
      date: data.date,
      category: data.category,
      tags: data.tags,
      content,
      frontmatter: data
    }
  } catch (error) {
    console.error('Error loading recipe:', error)
    return null
  }
}

export default async function RecipePage({ params }: { params: { slug: string } }) {
  const recipe = await getRecipe(params.slug)
  
  if (!recipe) {
    notFound()
  }
  
  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="max-w-4xl mx-auto p-8">
        <div className="glass rounded-2xl p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent mb-4">
              {recipe.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
              <span>📅 {new Date(recipe.date).toLocaleDateString()}</span>
              <span>🏷️ {recipe.category}</span>
              <span>📊 {recipe.frontmatter.sources} sources</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: recipe.content.replace(/\n/g, '<br>') }} />
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-700">
            <a
              href="/"
              className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors"
            >
              <span>←</span>
              <span>Back to Recipes</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
