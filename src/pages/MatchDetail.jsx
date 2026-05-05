import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMatchDetails, submitVote, getVoteCounts, getMatchInsights } from '../api/client'
import { ArrowLeft, Trophy, Info, Users, BarChart3, ChevronDown, ChevronUp, Heart, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function MatchDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'summary')
  const [expandedInning, setExpandedInning] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) setActiveTab(tab)
  }, [searchParams])

  const { data: detailsRes, isLoading } = useQuery({
    queryKey: ['match-details', id],
    queryFn: () => getMatchDetails(id),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.summary?.summaryData?.data?.status
      return status === 'live' ? 30_000 : false
    },
  })

  const { data: voteRes } = useQuery({
    queryKey: ['match-votes', id],
    queryFn: () => getVoteCounts(id)
  })

  const { data: insightsRes } = useQuery({
    queryKey: ['match-insights', id],
    queryFn: () => getMatchInsights(id),
    refetchInterval: 60000 // Refetch every minute
  })

  const voteMutation = useMutation({
    mutationFn: ({ playerId, playerName }) => submitVote(id, playerId, playerName),
    onSuccess: () => {
      queryClient.invalidateQueries(['match-votes', id])
      setShowToast(true)
    }
  })

  const details = detailsRes?.data
  const summary = details?.summary?.summaryData?.data
  const scorecard = details?.scorecard?.scorecard || []
  const votes = voteRes?.data || []
  const insights = insightsRes || {}

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Handle API failure or missing data
  if (detailsRes?.success === false || !details || !summary) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh] space-y-6 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center">
          <Info className="text-accent" size={40} />
        </div>
        <div className="space-y-2 max-w-sm">
           <h2 className="text-2xl font-black uppercase italic text-accent">Sync Required</h2>
           <p className="text-text-muted text-sm leading-relaxed">
             {detailsRes?.error || "This match data hasn't been synced to the database yet. Live updates are blocked in the cloud."}
           </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link to="/" className="px-8 py-3 bg-primary text-white font-black uppercase text-xs rounded-xl shadow-lg hover:scale-105 transition-all text-center">
            Return Home
          </Link>
          <button onClick={() => window.location.reload()} className="text-[10px] font-black uppercase text-text-muted hover:text-accent">
            Try Refreshing
          </button>
        </div>
      </div>
    )
  }

  // Extract all players from scorecard for voting
  const allPlayers = scorecard.reduce((acc, inning) => {
    const players = [...inning.batting, ...inning.bowling].map(p => ({
      id: p.player_id,
      name: p.name,
      team: inning.teamName
    }))
    // Filter out duplicates
    players.forEach(p => {
      if (!acc.find(prev => prev.id === p.id)) acc.push(p)
    })
    return acc
  }, [])

  // Helper to get team logo by ID
  const getTeamLogo = (teamId) => {
    if (String(summary.team_a_id) === String(teamId)) return summary.team_a_logo
    if (String(summary.team_b_id) === String(teamId)) return summary.team_b_logo
    return null
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-xl">
            <div className="bg-white/20 p-1 rounded-full">
              <CheckCircle2 size={18} />
            </div>
            <div className="font-black uppercase italic tracking-wider text-xs">Vote Recorded Successfully!</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/matches" className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black italic uppercase tracking-wider">Match Report</h1>
      </div>

      {/* Main Scorecard Banner */}
      <div className="card relative overflow-hidden border-primary/20 bg-gradient-to-br from-surface to-background shadow-2xl">
        <div className="p-6 md:p-10 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Team A */}
            <Link to={summary?.team_a?.id ? `/teams/${summary.team_a.id}` : '#'} className="flex flex-col items-center gap-4 text-center w-full md:w-1/3 group transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <div className="w-24 h-24 rounded-3xl bg-gray-900 border-4 border-surface shadow-2xl overflow-hidden flex items-center justify-center p-2 group-hover:border-primary transition-all">
                {summary?.team_a?.logo ? <img src={summary.team_a.logo} alt="" className="w-full h-full object-contain" /> : <Trophy size={32} className="text-text-muted" />}
              </div>
              <div className="font-black text-xl group-hover:text-primary transition-colors">{summary?.team_a?.name}</div>
              <div className="text-4xl font-black text-primary">{summary?.team_a?.summary || '0/0'}</div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{summary?.team_a?.innings?.[0]?.summary?.over}</div>
            </Link>

            {/* VS */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-accent text-background rounded-full flex items-center justify-center font-black italic shadow-lg -rotate-12 z-10">VS</div>
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-gray-800 to-transparent my-4" />
              <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{summary?.tournament_round_name}</div>
            </div>

            {/* Team B */}
            <Link to={summary?.team_b?.id ? `/teams/${summary.team_b.id}` : '#'} className="flex flex-col items-center gap-4 text-center w-full md:w-1/3 group transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <div className="w-24 h-24 rounded-3xl bg-gray-900 border-4 border-surface shadow-2xl overflow-hidden flex items-center justify-center p-2 group-hover:border-primary transition-all">
                {summary?.team_b?.logo ? <img src={summary.team_b.logo} alt="" className="w-full h-full object-contain" /> : <Trophy size={32} className="text-text-muted" />}
              </div>
              <div className="font-black text-xl group-hover:text-primary transition-colors">{summary?.team_b?.name}</div>
              <div className="text-4xl font-black text-primary">{summary?.team_b?.summary || '0/0'}</div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{summary?.team_b?.innings?.[0]?.summary?.over}</div>
            </Link>
          </div>

          <div className="pt-6 border-t border-gray-800 text-center">
            <div className="text-accent font-black italic uppercase tracking-widest text-lg">
              {summary?.winning_team ? `${summary.winning_team} won by ${summary.win_by}` : 'Match in Progress / TBD'}
            </div>
            <div className="text-[10px] font-bold text-text-muted mt-2 uppercase tracking-widest flex items-center justify-center gap-2">
              <Info size={12} /> {summary.toss_details}
            </div>
          </div>
        </div>
      </div>

      {/* Win Predictor & AI Commentary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-6 bg-gradient-to-br from-surface to-background border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
              <BarChart3 size={16} /> Win Probability
            </h3>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Live AI Prediction</span>
          </div>
          
          <div className="space-y-4">
            <div className="relative h-12 bg-gray-900 rounded-2xl overflow-hidden flex border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-1000 relative group"
                style={{ width: `${insights.probability?.team_a_pct || 50}%` }}
              >
                <div className="absolute inset-0 flex items-center px-4 font-black text-xs text-white">
                  {summary?.team_a?.name}: {insights.probability?.team_a_pct || 50}%
                </div>
              </div>
              <div className="flex-1 h-full bg-gradient-to-l from-accent to-accent/80 transition-all duration-1000 relative">
                <div className="absolute inset-0 flex items-center justify-end px-4 font-black text-xs text-background">
                  {insights.probability?.team_b_pct || 50}% :{summary?.team_b?.name}
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-10" />
            </div>
            <div className="text-[10px] text-text-muted font-bold italic text-center uppercase tracking-wider">
              "{insights.probability?.analysis || 'Calculating match dynamics and momentum...'}"
            </div>
          </div>
        </div>

        <div className="card p-6 bg-primary/5 border-primary/20 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <Info size={16} /> AI Commentary
          </h3>
          <p className="text-sm font-medium italic text-text-primary leading-relaxed">
            {insights.commentary || "The AI is currently analyzing the latest ball-by-ball data to provide a professional update."}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-gray-800 overflow-x-auto whitespace-nowrap">
        {[
          { id: 'summary', label: 'Summary', icon: BarChart3 },
          { id: 'scorecard', label: 'Scorecard', icon: Trophy },
          { id: 'squads', label: 'Squads', icon: Users },
          { id: 'vote', label: 'Fan Vote', icon: Heart },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-xs font-black uppercase tracking-widest transition-all
              ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:bg-white/5'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'summary' && (
          <div className="space-y-6">
             <div className="card p-6 space-y-4">
                <h3 className="font-black italic uppercase text-primary border-b border-gray-800 pb-2">Match Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Venue</div>
                      <div className="font-bold">{summary.ground_name}</div>
                      <div className="text-xs text-text-muted">{summary.city_name}</div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Match Type</div>
                      <div className="font-bold">{summary.match_type} ({summary.overs} Overs)</div>
                      <div className="text-xs text-text-muted">Ball Type: {summary.ball_type}</div>
                   </div>
                </div>
             </div>

             {/* MOM Standings Snippet */}
             {votes.length > 0 && (
               <div className="card p-6 space-y-4 border-accent/20 bg-accent/5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black italic uppercase text-accent">Fan's Man of the Match</h3>
                    <Heart size={20} className="text-accent animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    {votes.slice(0, 1).map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-accent/10">
                        <div className="font-black uppercase">{v.name}</div>
                        <div className="text-accent font-black">{v.count} Votes</div>
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'scorecard' && (
          <div className="space-y-4">
            {scorecard.map((inning, idx) => (
              <div key={idx} className="card overflow-hidden border-white/5">
                <button 
                  onClick={() => setExpandedInning(expandedInning === idx ? -1 : idx)}
                  className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-lg bg-gray-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                       {getTeamLogo(inning.team_id) ? (
                         <img src={`https://media.cricheroes.in/team_logo/${getTeamLogo(inning.team_id)}`} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-black text-xs">{idx + 1}</div>
                       )}
                    </div>
                    <div className="text-left">
                      <div className="font-black italic uppercase text-sm">{inning.teamName}</div>
                      <div className="text-[10px] font-bold text-text-muted uppercase">Innings {idx + 1}</div>
                    </div>
                  </div>
                  {expandedInning === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedInning === idx && (
                  <div className="p-4 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Batting Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-800 text-[10px] font-black uppercase text-text-muted tracking-widest">
                            <th className="py-3 px-2">Batter</th>
                            <th className="py-3 px-2 text-right">R</th>
                            <th className="py-3 px-2 text-right">B</th>
                            <th className="py-3 px-2 text-right">4s</th>
                            <th className="py-3 px-2 text-right">6s</th>
                            <th className="py-3 px-2 text-right">SR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {inning.batting.map((player, pIdx) => (
                            <tr key={pIdx} className="text-sm">
                              <td className="py-3 px-2">
                                <div className="font-bold">{player.name}</div>
                                <div className="text-[10px] text-text-muted">{player.how_to_out}</div>
                              </td>
                              <td className="py-3 px-2 text-right font-black">{player.runs}</td>
                              <td className="py-3 px-2 text-right text-text-muted">{player.balls}</td>
                              <td className="py-3 px-2 text-right text-text-muted">{player['4s'] || 0}</td>
                              <td className="py-3 px-2 text-right text-text-muted">{player['6s'] || 0}</td>
                              <td className="py-3 px-2 text-right text-accent font-bold">{player.SR}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Extras & Total */}
                    <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20">
                       <div>
                          <div className="text-xs font-black uppercase text-primary">Extras: {inning.extras?.total || 0}</div>
                          <div className="text-[10px] text-text-muted uppercase font-bold">{inning.extras?.summary}</div>
                       </div>
                       <div className="text-lg font-black italic">Total: {inning.batting.reduce((acc, p) => acc + (parseInt(p.runs) || 0), 0) + (parseInt(inning.extras?.total) || 0)}</div>
                    </div>

                    {/* Bowling Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-800 text-[10px] font-black uppercase text-text-muted tracking-widest">
                            <th className="py-3 px-2">Bowler</th>
                            <th className="py-3 px-2 text-right">O</th>
                            <th className="py-3 px-2 text-right">M</th>
                            <th className="py-3 px-2 text-right">R</th>
                            <th className="py-3 px-2 text-right">W</th>
                            <th className="py-3 px-2 text-right">ER</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {inning.bowling.map((player, pIdx) => (
                            <tr key={pIdx} className="text-sm">
                              <td className="py-3 px-2 font-bold">{player.name}</td>
                              <td className="py-3 px-2 text-right font-black">{player.overs}</td>
                              <td className="py-3 px-2 text-right text-text-muted">{player.maidens}</td>
                              <td className="py-3 px-2 text-right text-text-muted">{player.runs}</td>
                              <td className="py-3 px-2 text-right font-black text-primary">{player.wickets}</td>
                              <td className="py-3 px-2 text-right text-accent font-bold">{player.economy_rate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'squads' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scorecard.map((inning, idx) => (
              <div key={idx} className="card p-6 border-white/5 space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-900 border border-white/10 flex items-center justify-center overflow-hidden">
                    {getTeamLogo(inning.team_id) ? (
                      <img src={`https://media.cricheroes.in/team_logo/${getTeamLogo(inning.team_id)}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="text-primary" size={20} />
                    )}
                  </div>
                  <div className="font-black italic uppercase">{inning.teamName}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[...new Set([...inning.batting, ...inning.bowling].map(p => p.name))].map((name, pIdx) => (
                    <div key={pIdx} className="text-xs font-bold p-2 bg-white/5 rounded border border-white/5">
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vote' && (
          <div className="space-y-8 animate-in zoom-in duration-500">
             <div className="text-center space-y-2">
                <h2 className="text-2xl font-black italic uppercase tracking-widest text-accent">Fan Favorite Vote</h2>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Who was the Man of the Match?</p>
             </div>

             {/* Results Section */}
             {votes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {votes.map((v, i) => (
                      <div key={i} className="card p-4 flex items-center justify-between border-accent/20 bg-accent/5">
                         <div className="font-black uppercase text-sm">{v.name}</div>
                         <div className="px-3 py-1 bg-accent text-background text-[10px] font-black rounded-full shadow-lg">{v.count} Votes</div>
                      </div>
                   ))}
                </div>
             )}

             {/* Voting Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[summary.team_a, summary.team_b].map((team, tIdx) => (
                  <div key={tIdx} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                       <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center font-black text-[10px]">{tIdx === 0 ? 'A' : 'B'}</div>
                       <div className="font-black italic uppercase text-xs text-text-muted">{team.name}</div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                       {allPlayers.filter(p => p.team === team.name).map((p, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => voteMutation.mutate({ playerId: p.id, playerName: p.name })}
                            disabled={voteMutation.isPending}
                            className="flex items-center justify-between p-4 card bg-surface hover:border-accent transition-all group"
                          >
                             <div className="font-black uppercase text-sm group-hover:text-accent transition-colors">{p.name}</div>
                             <Heart size={18} className="text-text-muted group-hover:text-accent transition-all" />
                          </button>
                       ))}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
