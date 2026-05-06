import { Trophy, Clock, Bell, Share2, ArrowRight, Image as ImageIcon, Flame, Target } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMatches, getTeams, getStats, getMatchOverrides } from '../api/client'
import { Link, useNavigate } from 'react-router-dom'

import { useSeason } from '../context/SeasonContext'
import PwaPrompt from '../components/PwaPrompt'
import { buildLeagueStandings, formatNRR, indexOverrides, withOverrides } from '../lib/leagueStandings'


export default function Home() {
  const navigate = useNavigate()
  const { activeSeason } = useSeason()
  
  const { data: matchRes, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches', activeSeason?.id],
    queryFn: () => getMatches(activeSeason?.id),
    enabled: !!activeSeason,
    refetchInterval: 60_000,
  })

  const { data: teamRes, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams', activeSeason?.id],
    queryFn: () => getTeams(activeSeason?.id),
    enabled: !!activeSeason
  })

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', activeSeason?.id],
    queryFn: () => getStats(activeSeason?.id),
    enabled: !!activeSeason,
    refetchInterval: 5 * 60_000,
  })

  const { data: overridesRes } = useQuery({
    queryKey: ['match-overrides', activeSeason?.id],
    queryFn: () => getMatchOverrides(activeSeason?.id),
    enabled: !!activeSeason,
  })

  const topRunScorer = statsRes?.data?.most_runs?.[0]
  const topWicketTaker = statsRes?.data?.most_wickets?.[0]
  const topBoundaries = statsRes?.data?.most_boundaries?.[0]
  const overridesIndex = indexOverrides(overridesRes?.data || [])

  const rawMatches = matchRes?.data || []
  const matches = withOverrides(rawMatches, overridesIndex)
  const teams = teamRes?.data || []

  // League standings — top 5 for the home sidebar.
  const standings = buildLeagueStandings(teams, matches)
  const topStandings = standings.slice(0, 5)
  const standingsLoading = teamsLoading || matchesLoading

  // Calculate aggregate stats from match data (more reliable than leaderboard)
  const stats = matches.reduce((acc, m) => {
    const match = m.data
    if (match.team_a_innings?.[0]) {
      acc.runs += (match.team_a_innings[0].total_run || 0)
      acc.wickets += (match.team_b_innings?.[0]?.total_wicket || 0)
    }
    if (match.team_b_innings?.[0]) {
      acc.runs += (match.team_b_innings[0].total_run || 0)
      acc.wickets += (match.team_a_innings?.[0]?.total_wicket || 0)
    }
    return acc
  }, { runs: 0, wickets: 0 })

  // Featured match: prefer currently-live, else most-recent past, else first available
  const liveRow = matches.find(m => m.data?.status === 'live')
  const lastPastRow = liveRow
    ? null
    : [...matches]
        .filter(m => m.data?.status === 'past')
        .sort((a, b) => new Date(b.data?.match_start_time || 0) - new Date(a.data?.match_start_time || 0))[0]
  const featuredRow = liveRow || lastPastRow || matches[0]
  const latestMatch = featuredRow?.data
  const isLive = latestMatch?.status === 'live'

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="relative h-72 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(26,107,58,0.2)] group">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-1000" />
        
        <div className="absolute bottom-8 left-8 z-20 space-y-3">
          <div className="inline-flex items-center gap-2 bg-accent/90 backdrop-blur-md text-background px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
            {activeSeason?.name || 'Tournament Official'}
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic text-white drop-shadow-2xl leading-none">
            GOVINDPALLY <span className="text-accent">PREMIER</span> LEAGUE
          </h1>
          <p className="text-white/80 text-sm md:text-base font-medium max-w-md">The heartbeat of Govindpally. Experience the thrill, the rivalry, and the glory.</p>
        </div>
      </section>

      {/* Stats Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Matches', count: matches.length, path: '/matches', icon: Clock, color: 'text-blue-400' },
          { label: 'Teams', count: teams.length, path: '/standings', icon: Trophy, color: 'text-accent' },
          { label: 'Runs Scored', count: stats.runs.toLocaleString(), path: '#', icon: Trophy, color: 'text-primary' },
          { label: 'Wickets', count: stats.wickets.toLocaleString(), path: '#', icon: Trophy, color: 'text-red-400' },
        ].map((stat) => (
          <Link key={stat.label} to={stat.path} className="card p-4 hover:border-accent/50 transition-all group active:scale-95">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color} group-hover:bg-accent group-hover:text-background transition-colors`}>
                <stat.icon size={20} />
              </div>
              <div>
                <div className="text-lg font-black">{stat.count}</div>
                <div className="text-[10px] uppercase font-bold text-text-muted">{stat.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Match Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black italic uppercase tracking-wider flex items-center gap-2 text-primary">
              <span className="w-8 h-1 bg-primary rounded-full" /> {isLive ? 'Live Now' : 'Latest Match'}
              {isLive && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/40 text-[10px] font-black uppercase tracking-widest text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live
                </span>
              )}
            </h3>
            <Link to="/matches" className="text-xs font-bold text-accent uppercase flex items-center gap-1 hover:gap-2 transition-all">
              Full Schedule <ArrowRight size={14} />
            </Link>
          </div>

          {matchesLoading ? (
            <div className="card h-48 animate-pulse bg-surface/50" />
          ) : latestMatch ? (
            <Link to={`/matches/${latestMatch.match_id}`} className="block card relative group overflow-hidden border-primary/20 bg-gradient-to-br from-surface to-background shadow-xl hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 p-4 z-30">
                <Share2 size={18} className="text-text-muted hover:text-accent cursor-pointer" />
              </div>
              
              <div className="p-4 md:p-8">
                <div className="flex flex-row items-center justify-between gap-2 md:gap-8">
                  {/* Team A */}
                  <div onClick={(e) => { e.preventDefault(); navigate(`/teams/${latestMatch.team_a_id}`) }} className="flex flex-col items-center gap-2 md:gap-3 text-center flex-1 min-w-0 group/team">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-2 md:border-4 border-surface shadow-2xl flex items-center justify-center overflow-hidden group-hover/team:border-primary transition-all shrink-0">
                       {latestMatch.team_a_logo ? (
                         <img src={latestMatch.team_a_logo.startsWith('http') ? latestMatch.team_a_logo : `https://media.cricheroes.in/team_logo/${latestMatch.team_a_logo}`} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-base md:text-2xl font-black text-white">{latestMatch.team_a?.substring(0,3).toUpperCase()}</span>
                       )}
                    </div>
                    <div className="font-black text-xs md:text-lg group-hover/team:text-primary transition-colors uppercase tracking-tight w-full truncate">{latestMatch.team_a}</div>
                    <div className="text-xl md:text-3xl font-black text-primary tabular-nums">{latestMatch.team_a_summary || '0/0'}</div>
                  </div>

                  {/* VS Divider */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-accent text-background rounded-full flex items-center justify-center font-black italic text-xs md:text-base shadow-lg -rotate-12">VS</div>
                    <div className="text-[9px] md:text-[10px] font-bold text-text-muted mt-3 md:mt-4 uppercase tracking-[0.2em] text-center">
                      {latestMatch.match_start_time ? new Date(latestMatch.match_start_time).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' }) : 'TBD'}
                    </div>
                  </div>

                  {/* Team B */}
                  <div onClick={(e) => { e.preventDefault(); navigate(`/teams/${latestMatch.team_b_id}`) }} className="flex flex-col items-center gap-2 md:gap-3 text-center flex-1 min-w-0 group/team">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-2 md:border-4 border-surface shadow-2xl flex items-center justify-center overflow-hidden group-hover/team:border-primary transition-all shrink-0">
                       {latestMatch.team_b_logo ? (
                         <img src={latestMatch.team_b_logo.startsWith('http') ? latestMatch.team_b_logo : `https://media.cricheroes.in/team_logo/${latestMatch.team_b_logo}`} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-base md:text-2xl font-black text-white">{latestMatch.team_b?.substring(0,3).toUpperCase()}</span>
                       )}
                    </div>
                    <div className="font-black text-xs md:text-lg group-hover/team:text-primary transition-colors uppercase tracking-tight w-full truncate">{latestMatch.team_b}</div>
                    <div className="text-xl md:text-3xl font-black text-primary tabular-nums">{latestMatch.team_b_summary || '0/0'}</div>
                  </div>
                </div>

                <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-gray-800 text-center">
                  <div className={`font-black italic uppercase tracking-widest text-xs md:text-sm ${isLive ? 'text-red-400' : 'text-accent'}`}>
                    {isLive
                      ? `Live • ${latestMatch.toss_details || 'In Progress'}`
                      : latestMatch.match_result === 'Resulted'
                        ? (latestMatch.match_summary?.summary || latestMatch.win_by)
                        : 'Match Scheduled'}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="card p-12 text-center text-text-muted">No matches found.</div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* League Standings */}
          <div className="space-y-4">
            <h3 className="text-lg font-black italic uppercase tracking-wider flex items-center gap-2 text-accent">
              <Trophy size={20} /> League Standings
            </h3>
            <div className="card p-2 bg-surface/40 backdrop-blur-sm border-white/5">
              {standingsLoading ? (
                <div className="space-y-2 p-4">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
                </div>
              ) : topStandings.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {topStandings.map((row, i) => (
                    <Link
                      key={row.team_id}
                      to={`/teams/${row.team_id}`}
                      className="flex items-center justify-between p-4 hover:bg-primary/10 transition-all group block"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-gray-900 overflow-hidden border border-white/10 shadow-lg group-hover:border-primary/50 transition-all flex items-center justify-center">
                            {row.logo ? (
                              <img src={row.logo} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <Trophy className="text-primary/20" size={24} />
                            )}
                          </div>
                          <div className="absolute -top-1 -left-1 w-6 h-6 bg-primary text-white text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-surface shadow-lg">{i+1}</div>
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-sm text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight truncate">{row.team_name || '—'}</div>
                          <div className="text-[10px] text-text-muted uppercase font-black tracking-widest">
                            {row.played} P • {row.won}W {row.lost}L {row.tied ? `${row.tied}T` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <div className="text-accent font-black italic text-xl leading-none">{row.points}</div>
                        <div className="text-[9px] text-text-muted font-bold uppercase tracking-tighter mt-0.5 tabular-nums">
                          NRR {formatNRR(row.nrr)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-text-muted italic">No league data yet.</div>
              )}
              <Link to="/standings" className="block w-full p-3 text-center text-[10px] font-black uppercase text-accent hover:bg-accent/10 transition-colors border-t border-white/5">
                Full Standings
              </Link>
            </div>
          </div>

          {/* Top Performers */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black italic uppercase tracking-wider flex items-center gap-2 text-primary">
                <Flame size={20} /> Top Performers
              </h3>
              <Link to="/stats" className="text-[10px] font-black uppercase text-accent hover:underline">All Stats</Link>
            </div>
            {statsLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse" />)}
              </div>
            ) : (topRunScorer || topWicketTaker || topBoundaries) ? (
              <div className="space-y-3">
                {topRunScorer && (
                  <div className="card p-4 border-primary/20 bg-primary/5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {topRunScorer.photo ? <img src={topRunScorer.photo} alt="" className="w-full h-full object-cover" /> : <Trophy size={20} className="text-primary/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-black uppercase tracking-widest text-primary">Most Runs</div>
                      <div className="font-black uppercase text-sm truncate">{topRunScorer.name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-2xl text-primary tabular-nums">{topRunScorer.runs}</div>
                      <div className="text-[9px] font-bold text-text-muted uppercase">{topRunScorer.innings} inn</div>
                    </div>
                  </div>
                )}
                {topWicketTaker && (
                  <div className="card p-4 border-red-500/20 bg-red-500/5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {topWicketTaker.photo ? <img src={topWicketTaker.photo} alt="" className="w-full h-full object-cover" /> : <Target size={20} className="text-red-400/40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-black uppercase tracking-widest text-red-400">Most Wickets</div>
                      <div className="font-black uppercase text-sm truncate">{topWicketTaker.name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-2xl text-red-400 tabular-nums">{topWicketTaker.wickets}</div>
                      <div className="text-[9px] font-bold text-text-muted uppercase tabular-nums">Eco {topWicketTaker.economy}</div>
                    </div>
                  </div>
                )}
                {topBoundaries && (
                  <div className="card p-4 border-accent/20 bg-accent/5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {topBoundaries.photo ? <img src={topBoundaries.photo} alt="" className="w-full h-full object-cover" /> : <Flame size={20} className="text-accent/40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-black uppercase tracking-widest text-accent">Most Boundaries</div>
                      <div className="font-black uppercase text-sm truncate">{topBoundaries.name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-xl text-accent tabular-nums">
                        <span className="text-primary">{topBoundaries.fours}</span>
                        <span className="text-text-muted text-sm">×4 </span>
                        <span>{topBoundaries.sixes}</span>
                        <span className="text-text-muted text-sm">×6</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-6 text-center text-[10px] font-bold uppercase tracking-widest text-text-muted italic">
                Stats appear once matches are scored
              </div>
            )}
          </section>

          {/* News Snippet */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black italic uppercase tracking-wider flex items-center gap-2 text-primary">
                <Bell size={20} /> Latest Updates
              </h3>
              <Link to="/news" className="text-[10px] font-black uppercase text-accent hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {[
                { id: 1, title: "Tournament Schedule Finalized", time: "2h ago", type: "Official" },
                { id: 2, title: "Player Registration Extended", time: "1d ago", type: "Admin" }
              ].map((news) => (
                <Link key={news.id} to="/news" className="block p-4 bg-surface/50 border border-white/5 rounded-2xl hover:border-primary/40 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-primary/20 text-primary rounded-md tracking-widest">{news.type}</span>
                    <span className="text-[9px] font-bold text-text-muted">{news.time}</span>
                  </div>
                  <div className="text-sm font-black text-text-primary group-hover:text-primary transition-colors">{news.title}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Gallery Preview */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black italic uppercase tracking-wider flex items-center gap-2 text-accent">
                <ImageIcon size={20} /> Gallery
              </h3>
              <Link to="/gallery" className="text-[10px] font-black uppercase text-accent hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600",
                "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600"
              ].map((img, i) => (
                <Link key={i} to="/gallery" className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 shadow-xl group">
                  <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
      
      {/* PWA Install Prompt */}
      <PwaPrompt />
    </div>
  )
}

