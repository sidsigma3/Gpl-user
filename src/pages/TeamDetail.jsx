import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTeams, getMatches } from '../api/client'
import { ArrowLeft, Trophy, Users, Calendar, Target, TrendingUp, Info, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'

import { useSeason } from '../context/SeasonContext'

export default function TeamDetail() {
  const navigate = useNavigate()
  const { id: teamId } = useParams()
  const { activeSeason } = useSeason()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [teamId])

  const { data: teamsRes, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams', activeSeason?.id],
    queryFn: () => getTeams(activeSeason?.id),
    enabled: !!activeSeason
  })

  const { data: matchesRes, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches', activeSeason?.id],
    queryFn: () => getMatches(activeSeason?.id),
    enabled: !!activeSeason,
    refetchInterval: 60_000,
  })

  const teams = teamsRes?.data || []
  const team = teams.find(t => String(t.id) === String(teamId))

  // Filter matches involving this team, sorted most-recent first by start time.
  const teamMatches = (matchesRes?.data || [])
    .filter(m => {
      const match = m.data
      return String(match.team_a_id) === String(teamId) || String(match.team_b_id) === String(teamId)
    })
    .sort((a, b) => new Date(b.data?.match_start_time || 0) - new Date(a.data?.match_start_time || 0))

  // Played = past matches only. Wins are derived by matching the winning_team
  // string against this team's name (winning_team_id is sometimes blank in the
  // match-list payload, so the string match is more reliable).
  const teamName = team?.data?.team_name || team?.data?.name
  const pastMatches = teamMatches.filter(m => m.data?.status === 'past' && m.data?.match_result)
  const wins = pastMatches.filter(m => (m.data.winning_team || '').trim() === teamName).length
  const losses = pastMatches.filter(m => {
    const winner = (m.data.winning_team || '').trim()
    return winner && winner !== teamName
  }).length
  const tiesOrNoResult = pastMatches.length - wins - losses

  if (teamsLoading || matchesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-black uppercase tracking-widest text-text-muted animate-pulse">Loading Team Profile...</div>
      </div>
    )
  }

  if (!team || !team.data) {
    return (
      <div className="card m-12 p-12 text-center space-y-6 border-red-500/20 bg-red-500/5">
        <Info className="mx-auto text-red-500" size={48} />
        <div className="space-y-2">
           <h2 className="text-2xl font-black uppercase italic text-red-500">Team Profile Missing</h2>
           <p className="text-text-muted text-sm max-w-xs mx-auto">This team's data hasn't been synced to the database yet. Please run a sync to see their full profile.</p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="inline-block px-8 py-3 bg-primary text-white font-black uppercase text-xs rounded-xl shadow-lg hover:scale-105 transition-transform">Return Home</Link>
        </div>
      </div>
    )
  }

  const teamData = team.data

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black italic uppercase tracking-wider">Team Profile</h1>
      </div>

      {/* Team Banner */}
      <div className="card relative overflow-hidden border-primary/20 bg-gradient-to-br from-surface to-background shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative z-10">
           <div className="w-32 h-32 rounded-3xl bg-gray-900 border-4 border-surface shadow-2xl overflow-hidden flex items-center justify-center p-4">
              {teamData.team_logo ? (
                <img src={teamData.team_logo.startsWith('http') ? teamData.team_logo : `https://media.cricheroes.in/team_logo/${teamData.team_logo}`} alt="" className="w-full h-full object-contain" />
              ) : (
                <Trophy size={48} className="text-text-muted" />
              )}
           </div>
           <div className="text-center md:text-left space-y-2">
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-primary leading-none">{teamData.team_name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-4 text-text-muted font-bold text-xs uppercase tracking-widest pt-2">
                 <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full"><Users size={14} className="text-accent" /> Squad: {teamData.players?.length || 0}</span>
                 <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full"><Target size={14} className="text-accent" /> Group: {teamData.group_name || 'A'}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Stats Sidebar */}
         <div className="space-y-6">
            <div className="card p-6 space-y-4 bg-surface/50 backdrop-blur-sm">
               <h3 className="font-black italic uppercase text-sm text-accent flex items-center gap-2 border-b border-white/5 pb-2">
                  <TrendingUp size={16} /> Performance
               </h3>
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-background rounded-xl border border-white/5 text-center shadow-inner">
                     <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Played</div>
                     <div className="text-2xl font-black">{pastMatches.length}</div>
                  </div>
                  <div className="p-4 bg-background rounded-xl border border-white/5 text-center shadow-inner">
                     <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Wins</div>
                     <div className="text-2xl font-black text-primary">{wins}</div>
                  </div>
                  <div className="p-4 bg-background rounded-xl border border-white/5 text-center shadow-inner">
                     <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Losses</div>
                     <div className="text-2xl font-black text-red-400">{losses}</div>
                  </div>
                  <div className="p-4 bg-background rounded-xl border border-white/5 text-center shadow-inner">
                     <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Tie / NR</div>
                     <div className="text-2xl font-black text-accent">{tiesOrNoResult}</div>
                  </div>
               </div>
            </div>

            {/* Squad List */}
            <div className="card p-6 space-y-4">
               <h3 className="font-black italic uppercase text-sm text-primary flex items-center gap-2 border-b border-white/5 pb-2">
                  <Users size={16} /> Squad Members
               </h3>
               <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {teamData.players?.length > 0 ? teamData.players.map((player, idx) => (
                     <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                           {player.profile_photo ? <img src={player.profile_photo} alt="" className="w-full h-full object-cover" /> : <div className="text-[8px] font-black">{idx + 1}</div>}
                        </div>
                        <div className="font-bold text-sm uppercase tracking-tight">{player.player_name}</div>
                     </div>
                  )) : (
                    <div className="text-center p-8 bg-white/5 rounded-xl border border-dashed border-white/10">
                       <p className="text-[10px] font-bold text-text-muted uppercase">No players registered yet</p>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Match History */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="font-black italic uppercase text-lg flex items-center gap-2">
                  <Calendar size={20} className="text-primary" /> Recent Results
               </h3>
            </div>
            
            <div className="space-y-4">
               {teamMatches.length > 0 ? teamMatches.map((match) => {
                 const m = match.data
                 const isTeamA = String(m.team_a_id) === String(teamId)
                 const opponentName = isTeamA ? m.team_b : m.team_a
                 const opponentId = isTeamA ? m.team_b_id : m.team_a_id

                 const winner = (m.winning_team || '').trim()
                 const isPast = m.status === 'past' && !!m.match_result
                 const isLive = m.status === 'live'
                 const isWin = isPast && winner === teamName
                 const isLoss = isPast && winner && winner !== teamName
                 const isTie = isPast && !isWin && !isLoss

                 const cardBorder =
                   isWin  ? 'border-primary/40 bg-primary/5' :
                   isLoss ? 'border-red-500/30 bg-red-500/5 opacity-90' :
                   isTie  ? 'border-accent/30 bg-accent/5' :
                   isLive ? 'border-red-500/40' :
                   'border-dashed border-white/10 bg-surface/30'

                 const badgeStyle =
                   isWin  ? 'bg-primary text-white border-primary/20' :
                   isLoss ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                   isTie  ? 'bg-accent/20 text-accent border-accent/30' :
                   isLive ? 'bg-red-500 text-white border-red-500/30 animate-pulse' :
                   'bg-gray-800 text-text-muted border-gray-700'

                 const badgeLabel =
                   isWin  ? 'W' :
                   isLoss ? 'L' :
                   isTie  ? 'T' :
                   isLive ? 'LIVE' :
                   'VS'

                 const cornerLabel =
                   isWin  ? { text: 'Winner', cls: 'bg-primary' } :
                   isLoss ? { text: 'Loss', cls: 'bg-red-500' } :
                   isTie  ? { text: 'Tie / NR', cls: 'bg-accent text-background' } :
                   isLive ? { text: 'Live Now', cls: 'bg-red-500' } :
                   null

                 return (
                  <div
                    key={match.id}
                    onClick={() => navigate(`/matches/${match.id}`)}
                    className={`flex items-center justify-between p-6 card transition-all group relative overflow-hidden cursor-pointer ${cardBorder}`}
                  >
                    {cornerLabel && (
                      <div className={`absolute top-0 right-0 text-white text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-bl-lg shadow-lg ${cornerLabel.cls}`}>
                        {cornerLabel.text}
                      </div>
                    )}
                    <div className="space-y-1">
                       <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                         {m.match_start_time ? new Date(m.match_start_time).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'TBD'}
                       </div>

                       <div
                         onClick={(e) => {
                           e.stopPropagation();
                           if (opponentId) navigate(`/teams/${opponentId}`);
                         }}
                         className="block text-left group/opp cursor-pointer"
                       >
                         <div className="font-black uppercase text-lg group-hover/opp:text-primary transition-colors flex items-center gap-2">
                           vs {opponentName}
                           <ArrowRight size={14} className="opacity-0 group-hover/opp:opacity-100 -translate-x-2 group-hover/opp:translate-x-0 transition-all" />
                         </div>
                       </div>

                       <div className="text-xs font-bold text-text-muted italic">
                         {isPast ? (m.match_summary?.summary || m.win_by || m.match_result) :
                          isLive ? 'In progress' :
                          'Scheduled'}
                       </div>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black italic text-xs uppercase shadow-2xl border-4 ${badgeStyle}`}>
                       {badgeLabel}
                    </div>
                  </div>
                 )
               }) : (
                 <div className="card p-20 text-center space-y-4 bg-surface/30 border-dashed">
                    <Calendar size={48} className="mx-auto text-text-muted/30" />
                    <p className="text-text-muted font-bold uppercase tracking-widest text-xs">No matches recorded for this team</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  )
}
