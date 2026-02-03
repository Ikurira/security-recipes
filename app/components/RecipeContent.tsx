'use client'

import { useState, useEffect } from 'react'

interface RecipeContentProps {
  selectedTopic: string
}

export default function RecipeContent({ selectedTopic }: RecipeContentProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [keyThemes, setKeyThemes] = useState<Array<{title: string, url: string, date?: string}>>([])
  const [brief, setBrief] = useState('')
  const [articleCount, setArticleCount] = useState(0)
  const [showSources, setShowSources] = useState(false)

  useEffect(() => {
    fetchFeedData()
  }, [selectedTopic])

  const fetchFeedData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/feeds?topic=${encodeURIComponent(selectedTopic)}`)
      const data = await response.json()

      if (data.success) {
        setKeyThemes(data.themes)
        setBrief(data.brief)
        setArticleCount(data.articleCount)
      } else {
        // Fallback to static data if feeds unavailable
        setKeyThemes([
          { title: `${selectedTopic} Best Practices`, url: '', date: undefined },
          { title: `Emerging Threats in ${selectedTopic}`, url: '', date: undefined },
          { title: `${selectedTopic} Architecture`, url: '', date: undefined },
          { title: `Compliance and ${selectedTopic}`, url: '', date: undefined },
          { title: `${selectedTopic} Automation`, url: '', date: undefined },
          { title: `Future of ${selectedTopic}`, url: '', date: undefined }
        ])
        setBrief(`Security analysis for ${selectedTopic}. ${data.message || 'Loading feed data...'}`)
        setArticleCount(0)
      }
    } catch (error) {
      console.error('Error fetching feeds:', error)
      setKeyThemes([{ title: `${selectedTopic} Overview`, url: '', date: undefined }])
      setBrief(`Unable to load feed data for ${selectedTopic}. Please try again later.`)
      setArticleCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${selectedTopic} Recipe`,
          themes: keyThemes.map(t => t.title), // Extract just the titles
          brief: brief,
          category: selectedTopic.toLowerCase().replace(/\s+/g, '-')
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        const fullUrl = `${window.location.origin}${result.url}`
        alert(`✅ Recipe Published Successfully!\n\n📄 File: ${result.filepath}\n🔗 URL: ${fullUrl}\n\nClick OK to view the recipe.`)
        
        // Optional: Open the recipe in a new tab
        window.open(fullUrl, '_blank')
      } else {
        alert(`❌ Publishing failed: ${result.message}`)
      }
    } catch (error) {
      alert(`Publishing error: ${error}`)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleReadAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel()
      setIsReading(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(brief)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onstart = () => setIsReading(true)
      utterance.onend = () => setIsReading(false)
      utterance.onerror = () => setIsReading(false)
      
      window.speechSynthesis.speak(utterance)
    }
  }

  if (isLoading) {
    return (
      <main className="glass rounded-2xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400 text-lg">Loading {selectedTopic} feeds...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="glass rounded-2xl p-8">
      {/* Recipe Header */}
      <div className="mb-8 pb-6 border-b border-slate-700">
        <h1 className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent mb-2">
          {selectedTopic} Recipe
        </h1>
        <div className="flex flex-wrap gap-6 text-sm text-slate-400">
          <div className="flex items-center space-x-2">
            <span>📊</span>
            <span>{articleCount} articles analyzed</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🕒</span>
            <span>Updated just now</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🏷️</span>
            <span>{selectedTopic}</span>
          </div>
        </div>
      </div>

      {/* Key Themes Section */}
      {keyThemes.length > 0 ? (
        <div className="bg-dark-800/40 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <span>🎯</span>
            <span>Key Security Themes</span>
            <span className="text-xs text-slate-400 font-normal ml-2">(Ordered by date)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keyThemes.map((theme, index) => (
              <a
                key={index}
                href={theme.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4 hover:bg-primary-500/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-slate-200 text-sm font-medium flex-1">{theme.title}</div>
                  <svg className="w-4 h-4 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <span>📅</span>
                  <span>{formatDate(theme.date)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-dark-800/40 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <span>🎯</span>
            <span>Key Security Themes</span>
          </h2>
          <div className="text-slate-400 text-center py-8">
            No themes available. Please try again later.
          </div>
        </div>
      )}

      {/* Security Brief Section */}
      <div className="bg-dark-800/40 border border-slate-700 rounded-xl p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <span>📝</span>
            <span>Security Recipe Brief</span>
          </h2>
          <button
            onClick={handleReadAloud}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              isReading 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30'
            }`}
          >
            <span>{isReading ? '⏹️' : '🔊'}</span>
            <span>{isReading ? 'Stop Reading' : 'Read Aloud'}</span>
          </button>
        </div>
        <div className="text-slate-200 leading-relaxed text-base max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {brief ? (
            <p className="whitespace-pre-line">{brief}</p>
          ) : (
            <div className="text-slate-400 text-center py-8">
              No content available for {selectedTopic}. Please try again later.
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-700">
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="flex items-center space-x-2 bg-gradient-accent text-white px-6 py-3 rounded-lg font-medium hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isPublishing ? '⏳' : '🚀'}</span>
          <span>{isPublishing ? 'Publishing...' : 'Publish Recipe'}</span>
        </button>
        
        <button 
          onClick={() => setShowSources(!showSources)}
          className="flex items-center space-x-2 bg-slate-700/60 text-slate-200 border border-slate-600 px-6 py-3 rounded-lg font-medium hover:bg-slate-700/80 hover:border-slate-500 transition-all duration-300">
          <span>🔗</span>
          <span>{showSources ? 'Hide Sources' : 'View All Sources'}</span>
        </button>
        
        <button className="flex items-center space-x-2 bg-slate-700/60 text-slate-200 border border-slate-600 px-6 py-3 rounded-lg font-medium hover:bg-slate-700/80 hover:border-slate-500 transition-all duration-300">
          <span>✏️</span>
          <span>Edit Content</span>
        </button>
        
        <button className="flex items-center space-x-2 bg-slate-700/60 text-slate-200 border border-slate-600 px-6 py-3 rounded-lg font-medium hover:bg-slate-700/80 hover:border-slate-500 transition-all duration-300"
          onClick={fetchFeedData}>
          <span>🔄</span>
          <span>Regenerate</span>
        </button>
        
        <button className="flex items-center space-x-2 bg-slate-700/60 text-slate-200 border border-slate-600 px-6 py-3 rounded-lg font-medium hover:bg-slate-700/80 hover:border-slate-500 transition-all duration-300">
          <span>📤</span>
          <span>Export</span>
        </button>
      </div>

      {/* Sources List */}
      {showSources && keyThemes.length > 0 && (
        <div className="mt-6 bg-dark-800/40 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <span>📚</span>
            <span>Article Sources</span>
          </h3>
          <div className="space-y-3">
            {keyThemes.map((theme, index) => (
              <a
                key={index}
                href={theme.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-200 group"
              >
                <span className="text-primary-400 font-mono text-sm flex-shrink-0">{index + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-200 text-sm font-medium mb-1 group-hover:text-primary-400 transition-colors">
                    {theme.title}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 truncate">{theme.url}</span>
                    <span className="text-slate-500 flex items-center gap-1 flex-shrink-0">
                      <span>📅</span>
                      <span>{formatDate(theme.date)}</span>
                    </span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
