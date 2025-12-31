export default function Navbar() {
  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <span className="text-2xl bg-gradient-accent bg-clip-text text-transparent">
                🔒
              </span>
              <span className="text-xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                Security Recipes
              </span>
            </div>
            <div className="hidden lg:block text-sm text-slate-400 italic">
              Security-focused recipes for building securely
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500 px-3 py-1 rounded-full text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full pulse-animation"></div>
              <span>Live Feeds</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
