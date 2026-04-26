import { Link, useLocation } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import SeasonSelector from './SeasonSelector'

const tabs = [
  { name: 'Home', path: '/' },
  { name: 'Schedule', path: '/matches' },
  { name: 'Rankings', path: '/standings' },
  { name: 'Fan Vote', path: '/vote' },
]

export default function TopNav() {
  const location = useLocation()

  return (
    <nav className="hidden md:block sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 overflow-hidden border border-white/10">
              <img src="https://media.cricheroes.in/tournament_logo/1777186363265_5ID8kvwSWX8f.jpg" alt="GPL Logo" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter leading-none bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">GPL <span className="text-accent">2026</span></span>
              <span className="text-[9px] font-bold text-accent uppercase tracking-[0.4em] opacity-80">Govindpally Premier League</span>
            </div>
          </Link>
          <SeasonSelector />
        </div>
        
        <div className="flex items-center gap-10">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.path}
              className={`text-xs font-black uppercase tracking-widest transition-all hover:text-accent relative py-2 ${
                location.pathname === tab.path ? 'text-accent' : 'text-text-muted'
              }`}
            >
              {tab.name}
              {location.pathname === tab.path && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full animate-in fade-in zoom-in" />
              )}
            </Link>
          ))}
          <button className="bg-accent text-background px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-accent/20">
            Cheer Now
          </button>
        </div>
      </div>
    </nav>
  )
}
