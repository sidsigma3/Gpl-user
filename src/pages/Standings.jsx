import { useQuery } from '@tanstack/react-query'
import { getMatches, getTeams } from '../api/client'
import { Trophy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useSeason } from '../context/SeasonContext'
import { buildLeagueStandings, formatNRR, LEAGUE_ROUND_NAME } from '../lib/leagueStandings'

export default function Standings() {
  const navigate = useNavigate()
  const { activeSeason } = useSeason()

  const { data: matchesRes, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches', activeSeason?.id],
    queryFn: () => getMatches(activeSeason?.id),
    enabled: !!activeSeason,
    refetchInterval: 60_000,
  })

  const { data: teamsRes, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams', activeSeason?.id],
    queryFn: () => getTeams(activeSeason?.id),
    enabled: !!activeSeason,
  })

  const matches = matchesRes?.data || []
  const teams = teamsRes?.data || []
  const standings = buildLeagueStandings(teams, matches)
  const leagueMatchCount = matches.filter(
    m => m.data?.tournament_round_name === LEAGUE_ROUND_NAME && m.data?.status === 'past',
  ).length

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-wider text-accent">League Standings</h1>
          <p className="text-text-muted text-sm font-medium">
            2 points for a win • 1 each for a tie or no-result • only league-stage matches count.
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black italic text-primary">{leagueMatchCount}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">League Matches Played</div>
        </div>
      </div>

      {matchesLoading || teamsLoading ? (
        <div className="card animate-pulse h-96" />
      ) : (
        <div className="card overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/10 border-b border-gray-800">
                  <th className="p-4 md:p-6 text-xs font-black uppercase tracking-widest text-text-muted">#</th>
                  <th className="p-4 md:p-6 text-xs font-black uppercase tracking-widest text-text-muted">Team</th>
                  <th className="p-4 md:p-6 text-xs font-black uppercase tracking-widest text-text-muted text-center">P</th>
                  <th className="p-4 md:p-6 text-xs font-black uppercase tracking-widest text-text-muted text-center">W</th>
                  <th className="p-4 md:p-6 text-xs font-black uppercase tracking-widest text-text-muted text-center">L</th>
                  <th className="p-4 md:p-6 text-xs font-black uppercase tracking-widest text-text-muted text-center">T/NR</th>
                  <th className="p-4 md:p-6 text-xs font-black uppercase tracking-widest text-text-muted text-center">NRR</th>
                  <th className="p-4 md:p-6 text-xs font-black uppercase tracking-widest text-text-muted text-center">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {standings.map((team, i) => (
                  <tr
                    key={team.team_id}
                    onClick={() => navigate(`/teams/${team.team_id}`)}
                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                  >
                    <td className="p-4 md:p-6">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black italic shadow-lg transition-transform group-hover:scale-110
                        ${i === 0 ? 'bg-accent text-background border-2 border-white/20' :
                          i === 1 ? 'bg-slate-300 text-background' :
                          i === 2 ? 'bg-orange-500 text-background' : 'bg-gray-800 text-text-muted'}`}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="p-4 md:p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-900 border-2 border-white/5 flex items-center justify-center overflow-hidden shadow-xl group-hover:border-primary/50 transition-all shrink-0">
                          {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-contain" /> : <Trophy size={20} className="text-text-muted" />}
                        </div>
                        <div className="font-black text-base md:text-lg text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight">
                          {team.team_name || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 md:p-6 text-center font-black text-text-primary">{team.played}</td>
                    <td className="p-4 md:p-6 text-center font-black text-primary">{team.won}</td>
                    <td className="p-4 md:p-6 text-center font-black text-text-muted">{team.lost}</td>
                    <td className="p-4 md:p-6 text-center font-black text-text-muted">{team.tied}</td>
                    <td className="p-4 md:p-6 text-center font-black tabular-nums">
                      <span className={team.nrr > 0 ? 'text-primary' : team.nrr < 0 ? 'text-red-400' : 'text-text-muted'}>
                        {formatNRR(team.nrr)}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-center">
                      <div className="font-black text-accent text-2xl">{team.points}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {standings.length === 0 && (
            <div className="p-12 text-center text-text-muted italic">
              No teams found for this season yet.
            </div>
          )}
          {standings.length > 0 && leagueMatchCount === 0 && (
            <div className="p-6 text-center text-xs text-text-muted italic border-t border-gray-800/50">
              League matches haven't started yet — points will appear once results come in.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
