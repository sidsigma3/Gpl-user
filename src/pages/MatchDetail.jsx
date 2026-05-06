import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMatchDetails, submitVote, getVoteCounts, getMatchInsights, getTeams, getMatchOverrides } from '../api/client'
import { useSeason } from '../context/SeasonContext'
import { ArrowLeft, Trophy, Info, Users, BarChart3, ChevronDown, ChevronUp, Heart, CheckCircle2, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function MatchDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'summary')
  const [expandedInning, setExpandedInning] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const queryClient = useQueryClient()
  const { activeSeason } = useSeason()

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
      return status === 'live' ? 15_000 : false
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

  // Full team rosters for the active season — used by both Squads and Vote tabs
  // so they show every squad member, not just the players who have already
  // batted/bowled in this match.
  const { data: teamsRes } = useQuery({
    queryKey: ['teams', activeSeason?.id],
    queryFn: () => getTeams(activeSeason?.id),
    enabled: !!activeSeason,
  })

  const { data: overridesRes } = useQuery({
    queryKey: ['match-overrides', activeSeason?.id],
    queryFn: () => getMatchOverrides(activeSeason?.id),
    enabled: !!activeSeason,
  })
  const matchOverride = (overridesRes?.data || []).find(
    o => String(o.match_id) === String(id),
  )

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

  // Commentary feed: prefer the dedicated commentary tab, fall back to whatever
  // miniScorecard the live/scorecard tab carries. commentary_with_extended_summary
  // mixes ball-by-ball entries with end-of-over summaries — best for display.
  const commentarySource =
    details?.commentary?.miniScorecard?.data ||
    details?.scorecard?.miniScorecard?.data ||
    summary ||
    {}
  const commentaryFeed =
    commentarySource.commentary_with_extended_summary ||
    (commentarySource.commentary || []).map(b => ({ type: 'ball', data: b }))

  // Build the two squads from the season-level team cache. Falls back to the
  // players who have batted/bowled in this match if a team has no roster yet.
  const teamsList = teamsRes?.data || []
  const buildSquad = (teamSummary) => {
    if (!teamSummary?.id) return []
    const cached = teamsList.find(t => String(t.id) === String(teamSummary.id))
    const roster = cached?.data?.players || []
    if (roster.length > 0) {
      return roster.map(p => ({
        id: p.player_id || p.id,
        name: p.player_name || p.name,
        photo: p.profile_photo,
      }))
    }
    // Fallback: derive from match scorecard innings
    const inningForTeam = scorecard.find(i => String(i.team_id) === String(teamSummary.id))
    const fromMatch = [
      ...(inningForTeam?.batting || []),
      ...(inningForTeam?.bowling || []),
    ]
    const seen = new Set()
    return fromMatch.reduce((acc, p) => {
      if (!p?.player_id || seen.has(p.player_id)) return acc
      seen.add(p.player_id)
      acc.push({ id: p.player_id, name: p.name, photo: p.profile_photo })
      return acc
    }, [])
  }
  const teamASquad = buildSquad(summary?.team_a)
  const teamBSquad = buildSquad(summary?.team_b)

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
        <div className="p-4 md:p-10 space-y-6 md:space-y-8">
          <div className="flex flex-row items-center justify-between gap-2 md:gap-8">
            {/* Team A */}
            <Link to={summary?.team_a?.id ? `/teams/${summary.team_a.id}` : '#'} className="flex flex-col items-center gap-2 md:gap-4 text-center flex-1 min-w-0 group transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <div className="w-14 h-14 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gray-900 border-2 md:border-4 border-surface shadow-2xl overflow-hidden flex items-center justify-center p-1.5 md:p-2 group-hover:border-primary transition-all shrink-0">
                {summary?.team_a?.logo ? <img src={summary.team_a.logo} alt="" className="w-full h-full object-contain" /> : <Trophy size={24} className="text-text-muted" />}
              </div>
              <div className="font-black text-xs md:text-xl group-hover:text-primary transition-colors uppercase tracking-tight w-full truncate">{summary?.team_a?.name}</div>
              <div className="text-xl md:text-4xl font-black text-primary tabular-nums">{summary?.team_a?.summary || '0/0'}</div>
              <div className="text-[9px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest">{summary?.team_a?.innings?.[0]?.summary?.over}</div>
            </Link>

            {/* VS */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-9 h-9 md:w-12 md:h-12 bg-accent text-background rounded-full flex items-center justify-center font-black italic text-xs md:text-base shadow-lg -rotate-12 z-10">VS</div>
              <div className="h-px w-16 md:w-32 bg-gradient-to-r from-transparent via-gray-800 to-transparent my-3 md:my-4" />
              <div className="text-[9px] md:text-[10px] font-black text-accent uppercase tracking-[0.2em] text-center max-w-[80px] md:max-w-none truncate">{summary?.tournament_round_name}</div>
            </div>

            {/* Team B */}
            <Link to={summary?.team_b?.id ? `/teams/${summary.team_b.id}` : '#'} className="flex flex-col items-center gap-2 md:gap-4 text-center flex-1 min-w-0 group transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <div className="w-14 h-14 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gray-900 border-2 md:border-4 border-surface shadow-2xl overflow-hidden flex items-center justify-center p-1.5 md:p-2 group-hover:border-primary transition-all shrink-0">
                {summary?.team_b?.logo ? <img src={summary.team_b.logo} alt="" className="w-full h-full object-contain" /> : <Trophy size={24} className="text-text-muted" />}
              </div>
              <div className="font-black text-xs md:text-xl group-hover:text-primary transition-colors uppercase tracking-tight w-full truncate">{summary?.team_b?.name}</div>
              <div className="text-xl md:text-4xl font-black text-primary tabular-nums">{summary?.team_b?.summary || '0/0'}</div>
              <div className="text-[9px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest">{summary?.team_b?.innings?.[0]?.summary?.over}</div>
            </Link>
          </div>

          <div className="pt-4 md:pt-6 border-t border-gray-800 text-center">
            <div className="text-accent font-black italic uppercase tracking-widest text-sm md:text-lg">
              {matchOverride
                ? matchOverride.result_type === 'win'
                  ? `${matchOverride.winning_team_name} awarded${matchOverride.win_by ? ` by ${matchOverride.win_by}` : ''}`
                  : matchOverride.result_type === 'tie'
                    ? 'Match tied'
                    : 'No result'
                : summary?.winning_team
                  ? `${summary.winning_team} won by ${summary.win_by}`
                  : 'Match in Progress'}
            </div>
            {matchOverride?.notes && (
              <div className="text-[10px] font-bold text-accent/80 mt-1 uppercase tracking-widest">
                {matchOverride.notes}
              </div>
            )}
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
          { id: 'commentary', label: 'Commentary', icon: MessageSquare },
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

        {activeTab === 'commentary' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {commentaryFeed.length === 0 ? (
              <div className="card p-12 text-center text-text-muted italic">
                No ball-by-ball commentary available yet.
              </div>
            ) : (
              commentaryFeed.map((entry, idx) => {
                if (entry.type === 'over') {
                  const o = entry.data
                  return (
                    <div
                      key={`over-${o.match_over_summary_id || idx}`}
                      className="card p-4 border-accent/20 bg-accent/5"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-black italic">
                            {o.over}
                          </div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-accent">End of Over {o.over}</div>
                            <div className="font-black text-lg">{o.score} <span className="text-text-muted text-xs font-bold">• {o.run} runs{o.wicket ? `, ${o.wicket} wkt` : ''}</span></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Run Rate</div>
                          <div className="font-black text-primary">{o.run_rate}</div>
                        </div>
                      </div>
                      {o.over_balls && (
                        <div className="mt-3 pt-3 border-t border-accent/10 text-[11px] font-mono text-text-muted tracking-wider">
                          {o.over_balls.trim()}
                        </div>
                      )}
                    </div>
                  )
                }

                // "new_player" entries are CricHeroes' inline player cards that
                // appear when a new batsman or bowler comes in. Different shape
                // — they have data.type ('next_bowler' / 'next_batsman'),
                // player_info, player_stat[], statements[] (HTML). Render as
                // a player intro card rather than a ball.
                if (entry.type === 'new_player') {
                  const np = entry.data || {}
                  const isBowler = np.type === 'next_bowler'
                  const info = np.player_info || {}
                  const stats = Array.isArray(np.player_stat) ? np.player_stat : []
                  const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, '').trim()
                  const cardCls = isBowler ? 'border-red-500/20 bg-red-500/5' : 'border-primary/20 bg-primary/5'
                  const chipCls = isBowler ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'
                  const headerCls = isBowler ? 'text-red-400' : 'text-primary'
                  const valueCls = isBowler ? 'text-red-400' : 'text-primary'
                  const visibleStats = stats.slice(0, 4)
                  const gridCols = visibleStats.length === 1 ? 'grid-cols-1'
                    : visibleStats.length === 2 ? 'grid-cols-2'
                    : visibleStats.length === 3 ? 'grid-cols-3'
                    : 'grid-cols-4'
                  return (
                    <div
                      key={`np-${info.player_id || idx}-${idx}`}
                      className={`card p-4 ${cardCls}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          {info.profile_photo ? (
                            <img src={info.profile_photo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users size={18} className="text-text-muted" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[10px] font-black uppercase tracking-widest ${headerCls} flex items-center gap-2 flex-wrap`}>
                            <span className={`px-2 py-0.5 rounded ${chipCls}`}>{np.header_text || (isBowler ? 'Next Bowler' : 'Next Batter')}</span>
                            {info.bowling_type && <span className="text-text-muted normal-case tracking-normal text-[10px] truncate">{info.bowling_type}</span>}
                            {info.batting_hand && <span className="text-text-muted normal-case tracking-normal text-[10px]">{info.batting_hand}</span>}
                          </div>
                          <div className="font-black uppercase text-base mt-1 truncate">{info.player_name || 'New Player'}</div>
                          {info.city_name && (
                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{info.city_name}</div>
                          )}
                        </div>
                      </div>
                      {visibleStats.length > 0 && (
                        <div className={`mt-3 pt-3 border-t border-white/5 grid ${gridCols} gap-2`}>
                          {visibleStats.map((s, sIdx) => (
                            <div key={sIdx} className="text-center">
                              <div className={`font-black ${valueCls} tabular-nums`}>{s.value ?? '-'}</div>
                              <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{s.title}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {Array.isArray(np.statements) && np.statements.length > 0 && (
                        <ul className="mt-3 pt-3 border-t border-white/5 space-y-1">
                          {np.statements.slice(0, 3).map((line, sIdx) => {
                            const txt = stripHtml(line)
                            if (!txt) return null
                            return (
                              <li key={sIdx} className="text-xs text-text-primary">{txt}</li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )
                }

                const b = entry.data
                if (!b) return null
                // Skip entries that don't look like a regular ball — defensive
                // against future CricHeroes types we haven't seen yet.
                if (typeof b.commentary !== 'string') return null
                const isWicket = b.is_out === 1
                const isBoundary = b.is_boundry === 1
                const isExtra = !!b.extra_type_code
                return (
                  <div
                    key={`ball-${b.ball_id || idx}`}
                    className={`card p-4 flex items-start gap-4 border-white/5 ${isWicket ? 'bg-red-500/5 border-red-500/20' : isBoundary ? 'bg-primary/5 border-primary/20' : ''}`}
                  >
                    <div className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-[10px] ${
                      isWicket ? 'bg-red-500 text-white' :
                      b.run === 6 ? 'bg-accent text-background' :
                      b.run === 4 ? 'bg-primary text-white' :
                      isExtra ? 'bg-yellow-500/30 text-yellow-200' :
                      'bg-gray-800 text-text-muted'
                    }`}>
                      <div className="text-base leading-none">
                        {isWicket ? 'W' : isExtra ? b.extra_type_code : b.run}
                      </div>
                      <div className="text-[9px] opacity-70 mt-0.5">{b.ball}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-text-primary">{b.commentary}</div>
                      {b.out_how && (
                        <div className="text-[11px] font-bold text-red-400 mt-1 uppercase tracking-wider">{b.out_how}</div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'squads' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { team: summary?.team_a, squad: teamASquad },
              { team: summary?.team_b, squad: teamBSquad },
            ].map(({ team, squad }, idx) => (
              <div key={idx} className="card p-5 border-white/5 space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {team?.logo ? (
                      <img src={team.logo} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Users className="text-primary" size={20} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black italic uppercase truncate">{team?.name}</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{squad.length} player{squad.length === 1 ? '' : 's'}</div>
                  </div>
                </div>
                {squad.length === 0 ? (
                  <div className="p-6 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest italic">
                    Squad not synced yet
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {squad.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          {p.photo ? (
                            <img src={p.photo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users size={14} className="text-text-muted" />
                          )}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-tight truncate">{p.name}</div>
                      </div>
                    ))}
                  </div>
                )}
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
                {[
                  { team: summary.team_a, squad: teamASquad, label: 'A' },
                  { team: summary.team_b, squad: teamBSquad, label: 'B' },
                ].map(({ team, squad, label }) => (
                  <div key={label} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                       <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center font-black text-[10px]">{label}</div>
                       <div className="font-black italic uppercase text-xs text-text-muted truncate">{team.name}</div>
                    </div>
                    {squad.length === 0 ? (
                      <div className="card p-6 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest italic">
                        Squad not synced yet
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {squad.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => voteMutation.mutate({ playerId: p.id, playerName: p.name })}
                            disabled={voteMutation.isPending}
                            className="flex items-center justify-between p-3 card bg-surface hover:border-accent transition-all group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-gray-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <Heart size={12} className="text-text-muted" />}
                              </div>
                              <div className="font-black uppercase text-sm group-hover:text-accent transition-colors truncate">{p.name}</div>
                            </div>
                            <Heart size={18} className="text-text-muted group-hover:text-accent transition-all shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
