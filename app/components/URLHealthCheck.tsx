'use client'

import { useState } from 'react'

export default function URLHealthCheck() {
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  const checkURLs = async (checkArticles = false) => {
    setChecking(true)
    setResults(null)
    
    try {
      const response = await fetch(`/api/validate-urls${checkArticles ? '?articles=true' : ''}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('URL check failed:', error)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="bg-dark-800/40 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <span>🔗</span>
          <span>URL Health Check</span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => checkURLs(false)}
            disabled={checking}
            className="px-4 py-2 bg-primary-500/20 text-primary-400 border border-primary-500/50 rounded-lg text-sm font-medium hover:bg-primary-500/30 transition-all disabled:opacity-50"
          >
            {checking ? '⏳ Checking...' : '🔍 Check Feeds'}
          </button>
          <button
            onClick={() => checkURLs(true)}
            disabled={checking}
            className="px-4 py-2 bg-slate-700/60 text-slate-200 border border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-700/80 transition-all disabled:opacity-50"
          >
            {checking ? '⏳ Checking...' : '🔍 Check Articles'}
          </button>
        </div>
      </div>

      {results && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-slate-400 text-xs mb-1">Checked</div>
              <div className="text-2xl font-bold text-white">{results.checked}</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="text-green-400 text-xs mb-1">Valid</div>
              <div className="text-2xl font-bold text-green-400">{results.valid}</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="text-red-400 text-xs mb-1">Invalid</div>
              <div className="text-2xl font-bold text-red-400">{results.invalid}</div>
            </div>
          </div>

          {/* Health Score */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Health Score</span>
              <span className={`text-lg font-bold ${
                results.validPercentage >= 90 ? 'text-green-400' :
                results.validPercentage >= 70 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {results.validPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  results.validPercentage >= 90 ? 'bg-green-500' :
                  results.validPercentage >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${results.validPercentage}%` }}
              />
            </div>
          </div>

          {/* Invalid URLs */}
          {results.invalid > 0 && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
              >
                <span className="text-sm font-medium">
                  {results.invalid} Invalid URL{results.invalid > 1 ? 's' : ''} Found
                </span>
                <span>{showDetails ? '▼' : '▶'}</span>
              </button>

              {showDetails && (
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {results.results.map((result: any, index: number) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-3 text-sm">
                      <div className="text-slate-200 font-medium mb-1 truncate">
                        {result.title}
                      </div>
                      <div className="text-slate-400 text-xs truncate mb-1">
                        {result.url}
                      </div>
                      <div className="text-red-400 text-xs">
                        {result.error || `HTTP ${result.status}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Last Checked */}
          <div className="text-xs text-slate-400 text-center">
            Last checked: {new Date(results.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {!results && !checking && (
        <div className="text-center py-8 text-slate-400">
          Click a button above to check URL validity
        </div>
      )}
    </div>
  )
}
