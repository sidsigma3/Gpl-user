import { useQuery } from '@tanstack/react-query'
import { getMatches } from '../api/client'
import { Trophy, Heart, ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Vote() {
  const { data: matchRes, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches
  })

  const matches = matchRes?.data?.filter(m => m.data.status === 'past') || []

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-black uppercase tracking-widest text-text-muted">Loading Votes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black italic uppercase tracking-wider text-accent">Fan's Choice</h1>
        <p className="text-text-muted text-sm font-medium uppercase tracking-widest">Vote for your Man of the Match in every game!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((item) => {
          const m = item.data
          return (
            <Link 
              key={item.id} 
              to={`/matches/${item.id}?tab=vote`}
              className="card group hover:border-accent/40 transition-all bg-gradient-to-br from-surface to-background overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1 space-y-6">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <div className="flex items-center gap-1"><Clock size={12} /> {m.match_date}</div>
                  <div className="text-accent">{m.tournament_round_name}</div>
                </div>

                <div className="flex items-center justify-between gap-4">
                   <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gray-900 border border-white/5 flex items-center justify-center overflow-hidden">
                         {m.team_a_logo ? <img src={`https://media.cricheroes.in/team_logo/${m.team_a_logo}`} alt="" className="w-full h-full object-cover" /> : <Trophy size={16} className="text-text-muted" />}
                      </div>
                      <div className="text-[10px] font-black uppercase line-clamp-1">{m.team_a}</div>
                   </div>
                   <div className="text-xs font-black italic text-accent opacity-50">VS</div>
                   <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gray-900 border border-white/5 flex items-center justify-center overflow-hidden">
                         {m.team_b_logo ? <img src={`https://media.cricheroes.in/team_logo/${m.team_b_logo}`} alt="" className="w-full h-full object-cover" /> : <Trophy size={16} className="text-text-muted" />}
                      </div>
                      <div className="text-[10px] font-black uppercase line-clamp-1">{m.team_b}</div>
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5 text-center">
                   <div className="text-xs font-bold text-text-muted mb-4 line-clamp-1 italic">{m.match_summary?.summary}</div>
                   <div className="inline-flex items-center gap-2 px-6 py-2 bg-accent text-background rounded-full font-black uppercase text-[10px] shadow-lg group-hover:scale-105 transition-transform">
                      Vote Now <Heart size={12} className="fill-background" />
                   </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {matches.length === 0 && (
        <div className="card p-20 text-center space-y-4 border-dashed">
           <Trophy size={48} className="mx-auto text-text-muted/20" />
           <p className="text-text-muted font-bold uppercase tracking-widest text-xs">No matches available for voting yet</p>
        </div>
      )}
    </div>
  )
}
