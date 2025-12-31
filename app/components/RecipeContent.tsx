'use client'

import { useState } from 'react'

const keyThemes = [
  'Zero Trust Architecture Implementation',
  'Multi-Cloud Security Posture',
  'Container Runtime Protection',
  'AI-Powered Threat Detection',
  'Identity & Access Evolution',
  'DevSecOps Integration',
]

const sampleBrief = `Modern cloud security demands a paradigm shift from traditional perimeter defenses to comprehensive zero trust architectures that authenticate and authorize every interaction. Organizations adopting multi-cloud strategies must implement unified security posture management across AWS, Azure, and GCP environments to maintain consistent protection standards. Container security has evolved beyond static image scanning to encompass real-time runtime protection and behavioral anomaly detection. Identity management has become the new security perimeter, emphasizing privileged access management, just-in-time access controls, and continuous authentication mechanisms. Artificial intelligence and machine learning technologies are revolutionizing threat detection capabilities, enabling real-time analysis and response to security events across distributed cloud infrastructures. The integration of DevSecOps practices ensures security considerations are embedded throughout the entire development lifecycle rather than treated as an afterthought. Compliance frameworks are rapidly adapting to cloud-native architectures, requiring innovative approaches to audit trails, data governance, and regulatory adherence. Organizations must strategically balance automated security controls with human oversight to maintain both robust protection and operational efficiency in their cloud environments.`

export default function RecipeContent() {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isReading, setIsReading] = useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)
    
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Cloud Security Recipe #001',
          themes: keyThemes,
          brief: sampleBrief,
          category: 'cloud-security'
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
      // Stop reading
      window.speechSynthesis.cancel()
      setIsReading(false)
    } else {
      // Start reading
      const utterance = new SpeechSynthesisUtterance(sampleBrief)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onstart = () => setIsReading(true)
      utterance.onend = () => setIsReading(false)
      utterance.onerror = () => setIsReading(false)
      
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <main className="glass rounded-2xl p-8">
      {/* Recipe Header */}
      <div className="mb-8 pb-6 border-b border-slate-700">
        <h1 className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent mb-2">
          Cloud Security Recipe #001
        </h1>
        <div className="flex flex-wrap gap-6 text-sm text-slate-400">
          <div className="flex items-center space-x-2">
            <span>📊</span>
            <span>15 articles analyzed</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🕒</span>
            <span>Updated 2 hours ago</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🏷️</span>
            <span>Cloud Security</span>
          </div>
        </div>
      </div>

      {/* Key Themes Section */}
      <div className="bg-dark-800/40 border border-slate-700 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <span>🎯</span>
          <span>Key Security Themes</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {keyThemes.map((theme, index) => (
            <div
              key={index}
              className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4 hover:bg-primary-500/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-slate-200 text-sm font-medium">{theme}</div>
            </div>
          ))}
        </div>
      </div>

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
        <div className="text-slate-200 leading-relaxed text-base">
          <p>{sampleBrief}</p>
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
        
        <button className="flex items-center space-x-2 bg-slate-700/60 text-slate-200 border border-slate-600 px-6 py-3 rounded-lg font-medium hover:bg-slate-700/80 hover:border-slate-500 transition-all duration-300">
          <span>✏️</span>
          <span>Edit Content</span>
        </button>
        
        <button className="flex items-center space-x-2 bg-slate-700/60 text-slate-200 border border-slate-600 px-6 py-3 rounded-lg font-medium hover:bg-slate-700/80 hover:border-slate-500 transition-all duration-300">
          <span>🔄</span>
          <span>Regenerate</span>
        </button>
        
        <button className="flex items-center space-x-2 bg-slate-700/60 text-slate-200 border border-slate-600 px-6 py-3 rounded-lg font-medium hover:bg-slate-700/80 hover:border-slate-500 transition-all duration-300">
          <span>📤</span>
          <span>Export</span>
        </button>
      </div>
    </main>
  )
}
