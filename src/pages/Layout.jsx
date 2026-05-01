import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Trophy, Download, X } from 'lucide-react'
import TopNav from '../components/TopNav'
import BottomTabNav from '../components/BottomTabNav'
import SeasonSelector from '../components/SeasonSelector'

export default function Layout() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBanner(true)
    })
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallBanner(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="fixed top-20 left-4 right-4 z-[100] md:max-w-sm md:left-auto animate-in fade-in slide-in-from-top-4">
          <div className="card p-4 bg-primary/95 backdrop-blur-xl border-accent/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl p-1 overflow-hidden shrink-0 shadow-lg">
                <img src="https://media.cricheroes.in/tournament_logo/1777186363265_5ID8kvwSWX8f.jpg" className="w-full h-full object-contain" />
              </div>
              <div className="text-white">
                <div className="font-black text-sm uppercase tracking-tight">Install GPL App</div>
                <div className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Fast & Official Scorecard</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleInstall} className="bg-accent text-background px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform">Install</button>
              <button onClick={() => setShowInstallBanner(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60"><X size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <TopNav />
      
      {/* Mobile Header (Standalone) */}
      <header className="md:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 h-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-transparent rounded-xl flex items-center justify-center overflow-hidden border border-white/10 shadow-lg">
             <img src="/logo.png" className="w-full h-full object-contain p-0.5" />
           </div>
           <div className="flex flex-col">
             <span className="font-black text-xl tracking-tighter leading-none text-text-primary">GPL <span className="text-accent">2026</span></span>
             <span className="text-[8px] font-bold text-accent/80 uppercase tracking-[0.2em]">Official App</span>
           </div>
        </div>
        <SeasonSelector />
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
