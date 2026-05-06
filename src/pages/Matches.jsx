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

  // Schedule order: live first, then upcoming sorted soonest-first, then past most-recent first.
  const sortedMatches = (() => {
    const live = []
    const upcoming = []
    const past = []
    const other = []
    for (const m of matches) {
      const status = m.data?.status
      if (status === 'live') live.push(m)
      else if (status === 'upcoming') upcoming.push(m)
      else if (status === 'past') past.push(m)
      else other.push(m)
    }
    const byTimeAsc = (a, b) => new Date(a.data?.match_start_time || 0) - new Date(b.data?.match_start_time || 0)
    const byTimeDesc = (a, b) => new Date(b.data?.match_start_time || 0) - new Date(a.data?.match_start_time || 0)
    return [
      ...live.sort(byTimeAsc),
      ...upcoming.sort(byTimeAsc),
      ...past.sort(byTimeDesc),
      ...other,
    ]
  })()

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
          {sortedMatches.map((item) => {
            const m = item.data
            const isLive = m.status === 'live'
            return (
              <div
                key={item.id}
                onClick={() => navigate(`/matches/${item.id}`)}
                className={`card group transition-all bg-gradient-to-r from-surface to-background overflow-hidden block cursor-pointer ${isLive ? 'border-red-500/40 hover:border-red-500/60' : 'hover:border-primary/40'}`}
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
                    <div className={`mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      isLive ? 'bg-red-500/15 border-red-500/40 text-red-400 inline-flex items-center gap-1.5' :
                      m.status === 'past' ? 'bg-surface border-gray-700 text-text-muted' :
                      'bg-surface border-gray-700 text-accent'
                    }`}>
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
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

                    {/* Whole row click → match detail. Only the team logo
                        opens the team profile (small tap target). */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/teams/${m.team_a_id}`) }}
                          aria-label={`Open ${m.team_a} profile`}
                          className="w-12 h-12 rounded-lg bg-gray-900 border border-white/5 flex items-center justify-center overflow-hidden shrink-0 hover:border-primary hover:scale-105 active:scale-95 transition-all"
                        >
                           {m.team_a_logo ? <img src={m.team_a_logo.startsWith('http') ? m.team_a_logo : `https://media.cricheroes.in/team_logo/${m.team_a_logo}`} alt="" className="w-full h-full object-cover" /> : <Trophy size={16} className="text-text-muted" />}
                        </button>
                        <div className="min-w-0">
                          <div className="text-base md:text-lg font-black uppercase tracking-tight truncate">{m.team_a}</div>
                          <div className="text-xl md:text-2xl font-black text-text-muted mt-0.5 tabular-nums">{m.team_a_summary || '-'}</div>
                        </div>
                      </div>

                      <div className="text-xs font-black italic text-accent shrink-0">VS</div>

                      <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
                        <div className="min-w-0 text-right">
                          <div className="text-base md:text-lg font-black uppercase tracking-tight truncate">{m.team_b}</div>
                          <div className="text-xl md:text-2xl font-black text-text-muted mt-0.5 tabular-nums">{m.team_b_summary || '-'}</div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/teams/${m.team_b_id}`) }}
                          aria-label={`Open ${m.team_b} profile`}
                          className="w-12 h-12 rounded-lg bg-gray-900 border border-white/5 flex items-center justify-center overflow-hidden shrink-0 hover:border-primary hover:scale-105 active:scale-95 transition-all"
                        >
                           {m.team_b_logo ? <img src={m.team_b_logo.startsWith('http') ? m.team_b_logo : `https://media.cricheroes.in/team_logo/${m.team_b_logo}`} alt="" className="w-full h-full object-cover" /> : <Trophy size={16} className="text-text-muted" />}
                        </button>
                      </div>
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
