import { useQuery } from '@tanstack/react-query'
import { getLeaderboard, getMatches, getTeams } from '../api/client'
import { Trophy, Star, TrendingUp, Search, Zap } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { useSeason } from '../context/SeasonContext'

export default function Standings() {
  const navigate = useNavigate()
  const { activeSeason } = useSeason()
  
  const { data: leadRes, isLoading: leadLoading } = useQuery({
    queryKey: ['leaderboard', activeSeason?.id],
    queryFn: () => getLeaderboard(activeSeason?.id),
    enabled: !!activeSeason
  })

  const { data: matchesRes, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches', activeSeason?.id],
    queryFn: () => getMatches(activeSeason?.id),
    enabled: !!activeSeason
  })

  const { data: teamsRes, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams', activeSeason?.id],
    queryFn: () => getTeams(activeSeason?.id),
    enabled: !!activeSeason
  })

  const matches = matchesRes?.data || []
  const teams = teamsRes?.data || []
  
  // Logic: Use leaderboard if available, otherwise fallback to teams list
  const rawLeaderboard = leadRes?.data || []
  const leaderboard = rawLeaderboard.length > 0 
    ? rawLeaderboard 
    : teams.map(t => ({
        team_id: t.id,
        team_name: t.data.team_name,
        logo: t.data.logo || t.data.team_logo,
        points: 0,
        total_six: 0,
        total_four: 0
      }))

  const getTeamStats = (teamId) => {
    let runs = 0
    let wickets = 0
    matches.forEach(m => {
      const match = m.data
      if (String(match.team_a_id) === String(teamId)) {
        if (match.team_a_innings?.[0]) runs += match.team_a_innings[0].total_run || 0
        if (match.team_b_innings?.[0]) wickets += match.team_b_innings[0].total_wicket || 0
      } else if (String(match.team_b_id) === String(teamId)) {
        if (match.team_b_innings?.[0]) runs += match.team_b_innings[0].total_run || 0
        if (match.team_a_innings?.[0]) wickets += match.team_a_innings[0].total_wicket || 0
      }
    })
    return { runs, wickets }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-wider text-accent">Tournament Standings</h1>
          <p className="text-text-muted text-sm font-medium">Top performing teams based on tournament stats.</p>
        </div>
      </div>

      {leadLoading || matchesLoading || teamsLoading ? (
        <div className="card animate-pulse h-96" />
      ) : (
        <div className="card overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/10 border-b border-gray-800">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-text-muted">Rank</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-text-muted">Team</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-text-muted text-center">Points</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-text-muted text-center">Runs</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-text-muted text-center">Wickets</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-text-muted text-center">Boundaries</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-text-muted text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {leaderboard.map((team, i) => {
                  const stats = getTeamStats(team.team_id)
                  return (
                  <tr 
                    key={team.team_id} 
                    onClick={() => navigate(`/teams/${team.team_id}`)}
                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                  >
                    <td className="p-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic shadow-lg transition-transform group-hover:scale-110
                        ${i === 0 ? 'bg-accent text-background border-2 border-white/20' : 
                          i === 1 ? 'bg-slate-300 text-background' :
                          i === 2 ? 'bg-orange-500 text-background' : 'bg-gray-800 text-text-muted'}`}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-900 border-2 border-white/5 flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-primary/50 transition-all">
                          {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-contain" /> : <Trophy size={24} className="text-text-muted" />}
                        </div>
                        <div>
                          <div className="font-black text-lg text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight">
                            {team.team_name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-widest">Group A</span>
                            <span className="text-[9px] font-black bg-white/5 text-text-muted px-2 py-0.5 rounded uppercase tracking-widest">Active</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="font-black text-text-primary text-2xl">{team.points || '0'}</div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Points</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="font-black text-text-primary text-xl">{stats.runs}</div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Runs</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="font-black text-text-primary text-xl">{stats.wickets}</div>
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Wickets</div>
                    </td>
                    <td className="p-6 text-center">
                       <div className="flex items-center justify-center gap-2">
                          <div className="text-center">
                             <div className="font-black text-accent text-lg">{team.total_six || '0'}</div>
                             <div className="text-[8px] font-black text-text-muted uppercase">6s</div>
                          </div>
                          <div className="w-px h-6 bg-white/10" />
                          <div className="text-center">
                             <div className="font-black text-primary text-lg">{team.total_four || '0'}</div>
                             <div className="text-[8px] font-black text-text-muted uppercase">4s</div>
                          </div>
                       </div>
                    </td>
                    <td className="p-6 text-right">
                       <button className="px-4 py-2 bg-white/5 group-hover:bg-primary group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                          View Profile
                       </button>
                    </td>
                  </tr>
                )})}
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
