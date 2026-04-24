import { Trophy, Clock, Bell, Share2, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMatches, getLeaderboard } from '../api/client'
import { Link } from 'react-router-dom'

const announcements = [
  { id: 1, title: 'Tournament Semi-Finals Schedule Out!', time: '2h ago' },
  { id: 2, title: 'Player Registration deadline extended to Friday.', time: '1d ago' },
]

export default function Home() {
  const { data: matchRes, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches
  })

  const { data: leadRes, isLoading: leadLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard
  })

  const matches = matchRes?.data || []
  const leaderboard = leadRes?.data || []
  
  // Get latest match
  const latestMatch = matches[0]?.data

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="relative h-72 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(26,107,58,0.2)] group">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-1000" />
        
        <div className="absolute bottom-8 left-8 z-20 space-y-3">
          <div className="inline-flex items-center gap-2 bg-accent/90 backdrop-blur-md text-background px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
            Season 2024
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
          { label: 'Teams', count: 5, path: '/players', icon: Trophy, color: 'text-accent' },
          { label: 'Runs Scored', count: '4,280', path: '#', icon: Trophy, color: 'text-primary' },
          { label: 'Wickets', count: '142', path: '#', icon: Trophy, color: 'text-red-400' },
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
              <span className="w-8 h-1 bg-primary rounded-full" /> Latest Match
            </h3>
            <Link to="/matches" className="text-xs font-bold text-accent uppercase flex items-center gap-1 hover:gap-2 transition-all">
              Full Schedule <ArrowRight size={14} />
            </Link>
          </div>

          {matchesLoading ? (
            <div className="card h-48 animate-pulse bg-surface/50" />
          ) : latestMatch ? (
            <div className="card relative group overflow-hidden border-primary/20 bg-gradient-to-br from-surface to-background shadow-xl">
              <div className="absolute top-0 right-0 p-4">
                <Share2 size={18} className="text-text-muted hover:text-accent cursor-pointer" />
              </div>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  {/* Team A */}
                  <Link to={`/teams/${latestMatch.team_a_id}`} className="flex flex-col items-center gap-3 text-center w-full md:w-1/3 group/team">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-4 border-surface shadow-2xl flex items-center justify-center overflow-hidden group-hover/team:border-primary transition-all">
                       {latestMatch.team_a_logo ? (
                         <img src={`https://media.cricheroes.in/team_logo/${latestMatch.team_a_logo}`} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-2xl font-black text-white">{latestMatch.team_a?.substring(0,3).toUpperCase()}</span>
                       )}
                    </div>
                    <div className="font-black text-lg group-hover/team:text-primary transition-colors">{latestMatch.team_a}</div>
                    <div className="text-3xl font-black text-primary">{latestMatch.team_a_summary || '0/0'}</div>
                  </Link>

                  {/* VS Divider */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-accent text-background rounded-full flex items-center justify-center font-black italic shadow-lg -rotate-12">VS</div>
                    <div className="text-[10px] font-bold text-text-muted mt-4 uppercase tracking-[0.2em]">
                      {latestMatch.match_start_time ? new Date(latestMatch.match_start_time).toLocaleDateString() : 'TBD'}
                    </div>
                  </div>

                  {/* Team B */}
                  <Link to={`/teams/${latestMatch.team_b_id}`} className="flex flex-col items-center gap-3 text-center w-full md:w-1/3 group/team">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border-4 border-surface shadow-2xl flex items-center justify-center overflow-hidden group-hover/team:border-primary transition-all">
                       {latestMatch.team_b_logo ? (
                         <img src={`https://media.cricheroes.in/team_logo/${latestMatch.team_b_logo}`} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-2xl font-black text-white">{latestMatch.team_b?.substring(0,3).toUpperCase()}</span>
                       )}
                    </div>
                    <div className="font-black text-lg group-hover/team:text-primary transition-colors">{latestMatch.team_b}</div>
                    <div className="text-3xl font-black text-primary">{latestMatch.team_b_summary || '0/0'}</div>
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                  <div className="text-accent font-black italic uppercase tracking-widest text-sm">
                    {latestMatch.match_result === 'Resulted' ? (latestMatch.match_summary?.summary || latestMatch.win_by) : 'Match Scheduled'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center text-text-muted">No matches found.</div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Top Performers */}
          <div className="space-y-4">
            <h3 className="text-lg font-black italic uppercase tracking-wider flex items-center gap-2 text-accent">
              <Trophy size={20} /> Leaderboard
            </h3>
            <div className="card p-2 bg-surface/40 backdrop-blur-sm border-white/5">
              {leadLoading ? (
                <div className="space-y-2 p-4">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {leaderboard.slice(0, 5).map((player, i) => (
                    <div key={player.player_id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                           <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                             {player.profile_photo ? <img src={player.profile_photo} alt="" /> : <Trophy className="m-2 text-text-muted" />}
                           </div>
                           <div className="absolute -top-1 -left-1 w-5 h-5 bg-accent text-background text-[10px] font-black rounded-full flex items-center justify-center border-2 border-surface">{i+1}</div>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-text-primary group-hover:text-accent transition-colors">{player.player_name}</div>
                          <Link 
                            to={`/teams/${player.team_id}`}
                            className="text-[10px] text-accent uppercase font-black hover:underline transition-all block"
                          >
                            {player.team_name}
                          </Link>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-accent font-black italic">{player.points || player.total_runs}</div>
                        <div className="text-[9px] text-text-muted font-bold uppercase">Points</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-text-muted italic">No leaderboard data.</div>
              )}
              <Link to="/standings" className="block w-full p-3 text-center text-[10px] font-black uppercase text-accent hover:bg-accent/10 transition-colors border-t border-white/5">
                Full Rankings
              </Link>
            </div>
          </div>

          {/* News Snippet */}
          <section className="space-y-4">
            <h3 className="text-lg font-black italic uppercase tracking-wider flex items-center gap-2 text-primary">
              <Bell size={20} /> Live News
            </h3>
            <div className="space-y-3">
              {announcements.map((news) => (
                <div key={news.id} className="p-4 bg-surface/20 hover:bg-surface/60 rounded-2xl border border-white/5 transition-all flex flex-col gap-1 group cursor-pointer">
                  <div className="font-bold text-sm group-hover:text-primary transition-colors">{news.title}</div>
                  <div className="text-[10px] text-text-muted font-bold uppercase">{news.time}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

