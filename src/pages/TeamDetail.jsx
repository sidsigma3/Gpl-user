import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTeams, getMatches } from '../api/client'
import { ArrowLeft, Trophy, Users, Calendar, Target, TrendingUp, Info } from 'lucide-react'

export default function TeamDetail() {
  const { id: teamId } = useParams()

  const { data: teamsRes, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams
  })

  const { data: matchesRes, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches
  })

  const team = teamsRes?.data?.find(t => String(t.id) === String(teamId))
  
  // Robust match filtering
  const teamMatches = matchesRes?.data?.filter(m => {
    const match = m.data
    return String(match.team_a_id) === String(teamId) || String(match.team_b_id) === String(teamId)
  }) || []

  if (teamsLoading || matchesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-black uppercase tracking-widest text-text-muted animate-pulse">Loading Team Profile...</div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="card m-12 p-12 text-center space-y-6 border-red-500/20 bg-red-500/5">
        <Info className="mx-auto text-red-500" size={48} />
        <div className="space-y-2">
           <h2 className="text-2xl font-black uppercase italic text-red-500">Team Not Found</h2>
           <p className="text-text-muted text-sm max-w-xs mx-auto">We couldn't find the data for this team (ID: {teamId}).</p>
        </div>
        <Link to="/" className="inline-block px-8 py-3 bg-primary text-white font-black uppercase text-xs rounded-xl shadow-lg hover:scale-105 transition-transform">Return Home</Link>
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
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-background rounded-xl border border-white/5 text-center shadow-inner">
                     <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Played</div>
                     <div className="text-2xl font-black">{teamMatches.length}</div>
                  </div>
                  <div className="p-4 bg-background rounded-xl border border-white/5 text-center shadow-inner">
                     <div className="text-[10px] font-bold text-text-muted uppercase mb-1">Wins</div>
                     <div className="text-2xl font-black text-primary">
                        {teamMatches.filter(m => String(m.data.winning_team_id) === String(teamId)).length}
                     </div>
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
               {teamMatches.length > 0 ? [...teamMatches].reverse().map((match, idx) => {
                 const isWin = String(match.data.winning_team_id) === String(teamId)
                 const opponent = String(match.data.team_a_id) === String(teamId) ? match.data.team_b : match.data.team_a
                 
                 return (
                  <Link 
                    to={`/matches/${match.id}/details`}
                    key={idx} 
                    className="flex items-center justify-between p-6 card bg-surface hover:border-primary transition-all group relative overflow-hidden"
                  >
                    {isWin && <div className="absolute top-0 right-0 p-1 bg-primary text-white text-[8px] font-black uppercase tracking-tighter px-2 rounded-bl-lg shadow-lg">Winner</div>}
                    <div className="space-y-1">
                       <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">{match.data.match_date}</div>
                       <div className="font-black uppercase text-lg group-hover:text-primary transition-colors">vs {opponent}</div>
                       <div className="text-xs font-bold text-text-muted italic">{match.data.result_desc}</div>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black italic text-xs uppercase shadow-2xl border-4 ${isWin ? 'bg-primary text-white border-primary/20' : 'bg-gray-800 text-text-muted border-gray-700'}`}>
                       {isWin ? 'W' : 'L'}
                    </div>
                  </Link>
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
