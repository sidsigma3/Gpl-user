import React from 'react';
import { useSeason } from '../context/SeasonContext';
import { ChevronDown, Calendar } from 'lucide-react';

const SeasonSelector = () => {
  const { tournaments, activeSeason, changeSeason, loading } = useSeason();

  if (loading || !activeSeason) return null;

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm font-medium border border-white/10">
        <Calendar size={14} className="text-primary-light" />
        <span>{activeSeason.name}</span>
        <ChevronDown size={14} className="opacity-50" />
      </button>

      <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
        <div className="p-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Select Season
        </div>
        {tournaments.map((season) => (
          <button
            key={season.id}
            onClick={() => changeSeason(season)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors ${
              activeSeason.id === season.id ? 'text-primary-light bg-primary/10' : 'text-gray-300'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${season.is_active ? 'bg-green-500' : 'bg-gray-600'}`} />
            <div className="flex flex-col">
              <span className="font-medium">{season.name}</span>
              <span className="text-xs opacity-50">{season.year}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SeasonSelector;
