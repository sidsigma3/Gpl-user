import { Outlet } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import TopNav from '../components/TopNav'
import BottomTabNav from '../components/BottomTabNav'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop Header */}
      <TopNav />
      
      {/* Mobile Header (Standalone) */}
      <header className="md:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-6">
        <div className="flex flex-col">
          <span className="font-black text-lg tracking-tighter leading-none text-text-primary">GOVINDPALLY <span className="text-accent">PREMIER</span> LEAGUE</span>
          <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em]">Tournament Hub</span>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-surface border border-white/10 rounded-full flex items-center justify-center text-accent">
             <Trophy size={16} />
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Footer Navigation */}
      <BottomTabNav />
    </div>
  )
}
