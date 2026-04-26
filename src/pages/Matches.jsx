import { useQuery } from '@tanstack/react-query'
import { getMatches } from '../api/client'
import { Clock, Trophy, MapPin, Share2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useSeason } from '../context/SeasonContext'

export default function Matches() {
  const navigate = useNavigate()
  const { activeSeason } = useSeason()
  
  const { data: matchRes, isLoading } = useQuery({
    queryKey: ['matches', activeSeason?.id],
    queryFn: () => getMatches(activeSeason?.id),
    enabled: !!activeSeason
  })

  const matches = matchRes?.data || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black italic uppercase tracking-wider text-primary">Match Schedule</h1>
        <div className="text-xs font-bold text-text-muted bg-surface px-3 py-1 rounded-full border border-gray-800">
          {matches.length} Matches Found
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => <div key={i} className="card h-40 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-6">
          {matches.map((item) => {
            const m = item.data
            return (
              <div 
                key={item.id} 
                onClick={() => navigate(`/matches/${item.id}`)}
                className="card group hover:border-primary/40 transition-all bg-gradient-to-r from-surface to-background overflow-hidden block cursor-pointer"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Status Side */}
                  <div className="md:w-48 bg-primary/5 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-800">
                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                      {new Date(m.match_start_time).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                    <div className="text-xl font-black text-primary">
                       {new Date(m.match_start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="mt-4 px-3 py-1 rounded-full bg-surface border border-gray-700 text-[10px] font-bold uppercase text-accent">
                      {m.status || 'Upcoming'}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        <MapPin size={12} className="text-accent" /> {m.ground_name || 'Main Stadium'}
                      </div>
                      <Share2 size={16} className="text-text-muted hover:text-accent cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/teams/${m.team_a_id}`) }}
                        className="flex-1 flex items-center gap-3 group/team text-left hover:bg-white/5 p-2 rounded-xl transition-all active:scale-95"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gray-900 border border-white/5 flex items-center justify-center overflow-hidden shrink-0 group-hover/team:border-primary transition-colors">
                           {m.team_a_logo ? <img src={m.team_a_logo.startsWith('http') ? m.team_a_logo : `https://media.cricheroes.in/team_logo/${m.team_a_logo}`} alt="" className="w-full h-full object-cover" /> : <Trophy size={16} className="text-text-muted" />}
                        </div>
                        <div>
                          <div className="text-lg font-black group-hover/team:text-primary transition-colors">
                            {m.team_a}
                          </div>
                          <div className="text-2xl font-black text-text-muted mt-1">{m.team_a_summary || '-'}</div>
                        </div>
                      </button>

                      <div className="text-xs font-black italic text-accent mx-4">VS</div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/teams/${m.team_b_id}`) }}
                        className="flex-1 flex items-center justify-end gap-3 group/team text-right hover:bg-white/5 p-2 rounded-xl transition-all active:scale-95"
                      >
                        <div>
                          <div className="text-lg font-black group-hover/team:text-primary transition-colors">
                            {m.team_b}
                          </div>
                          <div className="text-2xl font-black text-text-muted mt-1">{m.team_b_summary || '-'}</div>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-gray-900 border border-white/5 flex items-center justify-center overflow-hidden shrink-0 group-hover/team:border-primary transition-colors">
                           {m.team_b_logo ? <img src={m.team_b_logo.startsWith('http') ? m.team_b_logo : `https://media.cricheroes.in/team_logo/${m.team_b_logo}`} alt="" className="w-full h-full object-cover" /> : <Trophy size={16} className="text-text-muted" />}
                        </div>
                      </button>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-800/50">
                      <div className="text-xs font-medium text-text-muted italic">
                        {m.match_result === 'Resulted' ? (
                          <span className="text-accent font-bold uppercase tracking-tight">{m.match_summary?.summary}</span>
                        ) : (
                          'Match has not started yet'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
