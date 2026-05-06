import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Target, Flame, Zap, TrendingUp } from 'lucide-react'

import { getStats } from '../api/client'
import { useSeason } from '../context/SeasonContext'

const TABS = [
  { id: 'most_runs', label: 'Most Runs', icon: Trophy, accent: 'primary',
    primaryCol: { key: 'runs', label: 'Runs' },
    secondaryCols: [
      { key: 'innings', label: 'Inn' },
      { key: 'highest', label: 'HS' },
      { key: 'strike_rate', label: 'SR' },
    ]
  },
  { id: 'most_wickets', label: 'Most Wickets', icon: Target, accent: 'red',
    primaryCol: { key: 'wickets', label: 'Wkts' },
    secondaryCols: [
      { key: 'innings', label: 'Inn' },
      { key: 'overs', label: 'Ov' },
      { key: 'economy', label: 'Eco' },
    ]
  },
  { id: 'most_boundaries', label: 'Boundaries', icon: Flame, accent: 'accent',
    primaryCol: { key: 'boundaries', label: '4s+6s' },
    secondaryCols: [
      { key: 'fours', label: '4s' },
      { key: 'sixes', label: '6s' },
      { key: 'runs', label: 'Runs' },
    ]
  },
  { id: 'best_strike_rate', label: 'Strike Rate', icon: Zap, accent: 'primary',
    primaryCol: { key: 'strike_rate', label: 'SR' },
    secondaryCols: [
      { key: 'runs', label: 'Runs' },
      { key: 'balls', label: 'Balls' },
      { key: 'innings', label: 'Inn' },
    ]
  },
  { id: 'best_economy', label: 'Economy', icon: TrendingUp, accent: 'red',
    primaryCol: { key: 'economy', label: 'Eco' },
    secondaryCols: [
      { key: 'wickets', label: 'Wkts' },
      { key: 'overs', label: 'Ov' },
      { key: 'innings', label: 'Inn' },
    ]
  },
]

const accentClasses = {
  primary: { text: 'text-primary', bg: 'bg-primary/10 border-primary/30', solid: 'bg-primary text-white' },
  accent:  { text: 'text-accent',  bg: 'bg-accent/10 border-accent/30',   solid: 'bg-accent text-background' },
  red:     { text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', solid: 'bg-red-500 text-white' },
}

export default function Stats() {
  const navigate = useNavigate()
  const { activeSeason } = useSeason()
  const [activeTab, setActiveTab] = useState('most_runs')

  const { data: statsRes, isLoading } = useQuery({
    queryKey: ['stats', activeSeason?.id],
    queryFn: () => getStats(activeSeason?.id),
    enabled: !!activeSeason,
    refetchInterval: 5 * 60_000,
  })

  const tab = TABS.find(t => t.id === activeTab) || TABS[0]
  const rows = statsRes?.data?.[activeTab] || []
  const accent = accentClasses[tab.accent]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h1 className="text-3xl font-black italic uppercase tracking-wider text-accent">Tournament Stats</h1>
        <p className="text-text-muted text-sm font-medium">Player rankings across all played matches in {activeSeason?.name || 'the season'}.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-gray-800 overflow-x-auto whitespace-nowrap">
        {TABS.map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center justify-center gap-2 py-3 px-4 md:px-5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shrink-0
                ${isActive ? `${accentClasses[t.accent].solid} shadow-lg` : 'text-text-muted hover:bg-white/5'}`}
            >
              <Icon size={14} /> {t.label}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="card animate-pulse h-96" />
      ) : rows.length === 0 ? (
        <div className="card p-12 text-center text-text-muted italic">
          No data yet — stats appear once matches are scored.
        </div>
      ) : (
        <div className={`card overflow-hidden border ${accent.bg} shadow-2xl`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/60 border-b border-gray-800">
                  <th className="p-3 md:p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">#</th>
                  <th className="p-3 md:p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Player</th>
                  <th className={`p-3 md:p-4 text-[10px] font-black uppercase tracking-widest text-center ${accent.text}`}>{tab.primaryCol.label}</th>
                  {tab.secondaryCols.map(c => (
                    <th key={c.key} className="p-3 md:p-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center hidden md:table-cell">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {rows.map((row, i) => (
                  <tr
                    key={row.player_id}
                    onClick={() => row.team_id && navigate(`/teams/${row.team_id}`)}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="p-3 md:p-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-xs
                        ${i === 0 ? 'bg-accent text-background' :
                          i === 1 ? 'bg-slate-300 text-background' :
                          i === 2 ? 'bg-orange-500 text-background' : 'bg-gray-800 text-text-muted'}`}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gray-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          {row.photo ? <img src={row.photo} alt="" className="w-full h-full object-cover" /> : <Trophy size={14} className="text-text-muted" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black uppercase text-sm tracking-tight truncate">{row.name}</div>
                          <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest md:hidden">
                            {tab.secondaryCols.map((c, idx) => (
                              <span key={c.key}>
                                {idx > 0 && ' • '}
                                {c.label} {row[c.key] ?? '-'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`p-3 md:p-4 text-center font-black text-2xl tabular-nums ${accent.text}`}>
                      {row[tab.primaryCol.key] ?? '-'}
                    </td>
                    {tab.secondaryCols.map(c => (
                      <td key={c.key} className="p-3 md:p-4 text-center font-black text-text-muted tabular-nums hidden md:table-cell">
                        {row[c.key] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
