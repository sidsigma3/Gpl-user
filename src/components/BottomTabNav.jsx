import { useState } from 'react'
import { Home, Trophy, BarChart3, Vote, Menu, Image as ImageIcon, Newspaper, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const mainTabs = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Matches', path: '/matches', icon: Trophy },
  { name: 'Rankings', path: '/standings', icon: BarChart3 },
  { name: 'Vote', path: '/vote', icon: Vote },
]

const moreTabs = [
  { name: 'Gallery', path: '/gallery', icon: ImageIcon },
  { name: 'News', path: '/news', icon: Newspaper },
]

export default function BottomTabNav() {
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 animate-in slide-in-from-bottom-full duration-500">
            <div className="bg-surface border border-white/10 rounded-[32px] overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black italic uppercase tracking-wider text-primary">More Sections</h3>
                <button onClick={() => setShowMore(false)} className="p-2 bg-white/5 rounded-full text-text-muted"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 p-6">
                {moreTabs.map((tab) => (
                  <Link
                    key={tab.name}
                    to={tab.path}
                    onClick={() => setShowMore(false)}
                    className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-[24px] hover:bg-primary/10 transition-all border border-white/5 group"
                  >
                    <tab.icon size={28} className="text-accent group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">{tab.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-surface/90 backdrop-blur-md border-t border-gray-800 md:hidden pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {mainTabs.map((tab) => {
            const isActive = location.pathname === tab.path
            const Icon = tab.icon
            return (
              <Link
                key={tab.name}
                to={tab.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 transition-colors",
                  isActive ? "text-accent" : "text-text-muted hover:text-text-primary"
                )}
              >
                <Icon size={24} className={cn(isActive && "fill-accent/20")} />
                <span className="text-[10px] mt-1 font-black uppercase tracking-tighter">{tab.name}</span>
              </Link>
            )
          })}
          
          <button
            onClick={() => setShowMore(true)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 transition-colors",
              showMore ? "text-accent" : "text-text-muted"
            )}
          >
            <Menu size={24} />
            <span className="text-[10px] mt-1 font-black uppercase tracking-tighter">More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
