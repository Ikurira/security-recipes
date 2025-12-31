'use client'

import { useState } from 'react'

const feedTopics = [
  { name: 'Cloud Security', count: 23, active: true },
  { name: 'Hardware Security', count: 15, active: false },
  { name: 'Infrastructure', count: 31, active: false },
  { name: 'Malware Research', count: 18, active: false },
  { name: 'Government Alerts', count: 7, active: false },
]

const popularTags = [
  { name: 'Zero Trust', count: 12 },
  { name: 'Container Security', count: 8 },
  { name: 'TPM/HSM', count: 6 },
  { name: 'DevSecOps', count: 9 },
  { name: 'Compliance', count: 5 },
]

export default function Sidebar() {
  const [activeTopics, setActiveTopics] = useState(feedTopics)

  const handleTopicClick = (index: number) => {
    setActiveTopics(prev => 
      prev.map((topic, i) => ({
        ...topic,
        active: i === index
      }))
    )
  }

  return (
    <aside className="glass rounded-2xl p-6 h-fit sticky top-24">
      <div className="space-y-8">
        {/* Feed Topics */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <span>📡</span>
            <span>Feed Topics</span>
          </h3>
          <div className="space-y-2">
            {activeTopics.map((topic, index) => (
              <div
                key={topic.name}
                onClick={() => handleTopicClick(index)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-300 flex justify-between items-center ${
                  topic.active
                    ? 'bg-gradient-accent/20 border border-primary-500'
                    : 'bg-slate-700/30 hover:bg-primary-500/10 hover:border-primary-500 border border-transparent'
                }`}
              >
                <span className="text-sm text-slate-200">{topic.name}</span>
                <span className="bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full text-xs font-medium">
                  {topic.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Tags */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <span>🏷️</span>
            <span>Popular Tags</span>
          </h3>
          <div className="space-y-2">
            {popularTags.map((tag) => (
              <div
                key={tag.name}
                className="p-3 rounded-lg bg-slate-700/30 hover:bg-primary-500/10 hover:border-primary-500 border border-transparent cursor-pointer transition-all duration-300 flex justify-between items-center"
              >
                <span className="text-sm text-slate-200">{tag.name}</span>
                <span className="bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full text-xs font-medium">
                  {tag.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
