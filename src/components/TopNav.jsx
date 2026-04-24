import { Link, useLocation } from 'react-router-dom'
import { Trophy } from 'lucide-react'

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
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-green-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
            <Trophy className="text-accent" size={28} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter leading-none">GOVINDPALLY <span className="text-accent">PREMIER</span> LEAGUE</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em]">Season 2 Official</span>
          </div>
        </Link>
        
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
