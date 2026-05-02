import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Optional: Check if already dismissed via localStorage
      const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500 max-w-sm mx-auto">
      <div className="bg-gradient-to-br from-primary to-primary-light text-white p-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl relative flex flex-col gap-3">
        <button 
          onClick={handleDismiss} 
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="GPL Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h3 className="font-black italic uppercase tracking-wider text-sm mb-1">Install GPL App</h3>
            <p className="text-xs text-white/80 leading-relaxed font-medium">Add the Govindpally Premier League app to your home screen for a better experience!</p>
          </div>
        </div>
        <button 
          onClick={handleInstall}
          className="w-full py-2.5 bg-white text-primary font-black uppercase tracking-widest text-xs rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Download size={16} /> Install Now
        </button>
      </div>
    </div>
  );
}
