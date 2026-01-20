'use client'

import { useState, useEffect } from 'react'

const feedTopics = [
  { name: 'Cloud Security', count: 0, active: true },
  { name: 'Hardware Security', count: 0, active: false },
  { name: 'Infrastructure', count: 0, active: false },
  { name: 'Malware Research', count: 0, active: false },
  { name: 'Government Alerts', count: 0, active: false },
]

const popularTags = [
  { name: 'Zero Trust', count: 0 },
  { name: 'Container Security', count: 0 },
  { name: 'TPM/HSM', count: 0 },
  { name: 'DevSecOps', count: 0 },
  { name: 'Compliance', count: 0 },
]

interface SidebarProps {
  onTopicChange: (topic: string) => void
}

export default function Sidebar({ onTopicChange }: SidebarProps) {
  const [activeTopics, setActiveTopics] = useState(feedTopics)
  const [tags, setTags] = useState(popularTags)

  useEffect(() => {
    // Fetch real counts by calling feeds API for each topic and tag
    const allItems = [...feedTopics.map(t => t.name), ...popularTags.map(t => t.name)]
    
    Promise.all(
      allItems.map(item => 
        fetch(`/api/feeds?topic=${encodeURIComponent(item)}`)
          .then(res => res.json())
          .then(data => ({ name: item, count: data.articleCount || 0 }))
      )
    ).then(results => {
      // Update topics
      setActiveTopics(prev => prev.map(topic => {
        const result = results.find(r => r.name === topic.name)
        return {
          ...topic,
          count: result ? result.count : 0
        }
      }))
      
      // Update tags
      setTags(prev => prev.map(tag => {
        const result = results.find(r => r.name === tag.name)
        return {
          ...tag,
          count: result ? result.count : 0
        }
      }))
    }).catch(err => console.error('Failed to fetch counts:', err))
  }, [])

  const handleTopicClick = (index: number) => {
    setActiveTopics(prev => 
      prev.map((topic, i) => ({
        ...topic,
        active: i === index
      }))
    )
    onTopicChange(feedTopics[index].name)
  }

  const handleTagClick = (tagName: string) => {
    // Deactivate all feed topics
    setActiveTopics(prev => prev.map(topic => ({ ...topic, active: false })))
    // Trigger topic change with the tag name
    onTopicChange(tagName)
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
            {tags.map((tag) => (
              <div
                key={tag.name}
                onClick={() => handleTagClick(tag.name)}
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
