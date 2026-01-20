'use client'

import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import RecipeContent from './components/RecipeContent'
import Footer from './components/Footer'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState('Cloud Security')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] max-w-7xl mx-auto p-4 lg:p-8 gap-8">
        <Sidebar onTopicChange={setSelectedTopic} />
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-white">Recipe Generator</h2>
            <Link
              href="/recipes"
              className="flex items-center space-x-2 bg-slate-700/60 text-slate-200 border border-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700/80 hover:border-slate-500 transition-all duration-300"
            >
              <span>📚</span>
              <span>View All Recipes</span>
            </Link>
          </div>
          <RecipeContent selectedTopic={selectedTopic} />
        </div>
      </div>
      <Footer />
    </div>
  )
}
