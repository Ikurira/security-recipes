import fs from 'fs-extra'
import path from 'path'
import Link from 'next/link'

interface RecipeIndex {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  filepath: string
}

async function getRecipes(): Promise<RecipeIndex[]> {
  try {
    const contentDir = path.join(process.cwd(), 'content', 'recipes')
    const indexPath = path.join(contentDir, 'index.json')
    
    if (!await fs.pathExists(indexPath)) {
      return []
    }
    
    const recipes = await fs.readJson(indexPath)
    return recipes
  } catch (error) {
    console.error('Error loading recipes:', error)
    return []
  }
}

export default async function RecipesPage() {
  const recipes = await getRecipes()
  
  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent mb-4">
            🔒 Security Recipes
          </h1>
          <p className="text-slate-400 text-lg">
            Security-focused recipes for building securely
          </p>
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors mt-4"
          >
            <span>←</span>
            <span>Back to Generator</span>
          </Link>
        </div>

        {recipes.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-white mb-4">No Recipes Yet</h2>
            <p className="text-slate-400 mb-6">
              Generate your first security recipe to see it listed here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 bg-gradient-accent text-white px-6 py-3 rounded-lg font-medium hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
            >
              <span>🚀</span>
              <span>Create First Recipe</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.slug} className="glass rounded-xl p-6 hover:bg-slate-800/40 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link 
                      href={`/recipes/${recipe.slug}`}
                      className="text-xl font-semibold text-white hover:text-primary-400 transition-colors"
                    >
                      {recipe.title}
                    </Link>
                    <div className="flex items-center space-x-4 text-sm text-slate-400 mt-2">
                      <span>📅 {new Date(recipe.date).toLocaleDateString()}</span>
                      <span>🏷️ {recipe.category}</span>
                    </div>
                  </div>
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    className="bg-primary-500/20 text-primary-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-500/30 transition-colors"
                  >
                    View Recipe →
                  </Link>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">📊 Recipe Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-400">{recipes.length}</div>
                <div className="text-sm text-slate-400">Total Recipes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-400">
                  {new Set(recipes.map(r => r.category)).size}
                </div>
                <div className="text-sm text-slate-400">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-400">
                  {new Set(recipes.flatMap(r => r.tags)).size}
                </div>
                <div className="text-sm text-slate-400">Unique Tags</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
