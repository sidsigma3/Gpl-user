import React, { useState, useRef, useEffect } from 'react';
import { useSeason } from '../context/SeasonContext';
import { ChevronDown, Calendar } from 'lucide-react';

const SeasonSelector = () => {
  const { tournaments, activeSeason, changeSeason, loading } = useSeason();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading || !activeSeason) return null;

  const handleSeasonSelect = (season) => {
    changeSeason(season);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-black uppercase tracking-wider border ${
          isOpen ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10'
        }`}
      >
        <Calendar size={14} className={isOpen ? 'text-primary' : 'text-accent'} />
        <span>GPL {activeSeason.year}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] bg-white/5 border-b border-white/5">
            Select Tournament
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {tournaments.map((season) => (
              <button
                key={season.id}
                onClick={() => handleSeasonSelect(season)}
                className={`w-full flex items-center gap-4 px-4 py-4 text-left transition-all hover:bg-white/5 ${
                  activeSeason.id === season.id ? 'bg-primary/5' : ''
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${
                  season.id === activeSeason.id ? 'bg-primary animate-pulse' : 'bg-gray-700'
                }`} />
                <div className="flex flex-col">
                  <span className={`text-sm font-black uppercase tracking-tight ${
                    season.id === activeSeason.id ? 'text-primary' : 'text-text-primary'
                  }`}>
                    {season.name}
                  </span>
                  <span className="text-[10px] font-bold text-text-muted">{season.year} Season</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonSelector;
