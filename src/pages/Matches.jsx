import { useQuery } from '@tanstack/react-query'
import { getMatches } from '../api/client'
import { Clock, Trophy, MapPin, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Matches() {
  const { data: matchRes, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches
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
              <Link key={item.id} to={`/matches/${item.id}`} className="card group hover:border-primary/40 transition-all bg-gradient-to-r from-surface to-background overflow-hidden block">
                <div className="flex flex-col md:flex-row">
                  {/* Status Side */}
                  <div className="md:w-48 bg-primary/5 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-800">
                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                      {new Date(m.match_start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xl font-black text-primary">
                       {new Date(m.match_start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
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
                      <div className="flex-1 text-center md:text-left">
                        <div className="text-lg font-black group-hover:text-primary transition-colors">{m.team_a}</div>
                        <div className="text-2xl font-black text-text-muted mt-1">{m.team_a_summary || '-'}</div>
                      </div>

                      <div className="w-px h-12 bg-gray-800 hidden md:block" />
                      <div className="text-xs font-black italic text-accent md:mx-4">VS</div>
                      <div className="w-px h-12 bg-gray-800 hidden md:block" />

                      <div className="flex-1 text-center md:text-right">
                        <div className="text-lg font-black group-hover:text-primary transition-colors">{m.team_b}</div>
                        <div className="text-2xl font-black text-text-muted mt-1">{m.team_b_summary || '-'}</div>
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
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
