import { useQuery } from '@tanstack/react-query'
import { getLeaderboard } from '../api/client'
import { Trophy, Star, TrendingUp, Search, Zap } from 'lucide-react'

export default function Standings() {
  const { data: leadRes, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard
  })

  const leaderboard = leadRes?.data || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-wider text-accent">Tournament Standings</h1>
          <p className="text-text-muted text-sm font-medium">Top performing teams based on tournament stats.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="card animate-pulse h-96" />
      ) : (
        <div className="card overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/10 border-b border-gray-800">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-text-muted">Rank</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-text-muted">Team</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-text-muted text-center">Sixes</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-text-muted text-center">Fours</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-text-muted text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {leaderboard.map((team, i) => (
                  <tr key={team.team_id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black italic
                        ${i === 0 ? 'bg-accent text-background scale-110 shadow-lg' : 
                          i === 1 ? 'bg-gray-300 text-background' :
                          i === 2 ? 'bg-orange-600 text-background' : 'bg-gray-800 text-text-muted'}`}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden border border-white/10 flex items-center justify-center">
                          {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-cover" /> : <Trophy size={20} className="text-text-muted" />}
                        </div>
                        <div>
                          <div className="font-black text-text-primary group-hover:text-accent transition-colors">{team.team_name}</div>
                          <div className="text-[10px] font-bold text-accent uppercase">Season Contender</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="font-black text-text-primary text-xl">{team.total_six || '0'}</div>
                      <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Total Sixes</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="font-black text-text-primary text-xl">{team.total_four || '0'}</div>
                      <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Total Fours</div>
                    </td>
                    <td className="p-6 text-right">
                       <div className="inline-flex items-center gap-1 text-primary">
                          <Zap size={14} className="fill-primary" />
                          <span className="text-[10px] font-black uppercase">Active</span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {leaderboard.length === 0 && (
             <div className="p-12 text-center text-text-muted italic">No team data available yet.</div>
          )}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 border-l-4 border-accent bg-gradient-to-br from-surface to-background">
          <h4 className="font-bold flex items-center gap-2 mb-2 text-accent uppercase tracking-tighter"><TrendingUp size={18} /> Tournament High</h4>
          <div className="text-2xl font-black italic">Golden Boyz <span className="text-xs font-medium text-text-muted block mt-1 uppercase">Most boundaries in season 2</span></div>
        </div>
        <div className="card p-6 border-l-4 border-primary bg-gradient-to-br from-surface to-background">
          <h4 className="font-bold flex items-center gap-2 mb-2 text-primary uppercase tracking-tighter"><Zap size={18} /> Impact Team</h4>
          <div className="text-2xl font-black italic">Hiras Hurricane <span className="text-xs font-medium text-text-muted block mt-1 uppercase">Highest strike rate in powerplay</span></div>
        </div>
      </div>
    </div>
  )
}
