// Shared league standings + NRR computation used by Home and Standings pages.
// Cricket convention: 2 pts for a win, 1 each for a tie or no-result, 0 for a loss.
// NRR is computed using actual overs faced/bowled, except when a side is all-out
// — then the full match overs are counted (standard ICC behaviour).

const LEAGUE_ROUND = 'League Matches'

function oversToDecimal(oversStr) {
  if (oversStr === null || oversStr === undefined) return 0
  const s = String(oversStr)
  const [whole, balls] = s.split('.')
  const w = parseInt(whole, 10) || 0
  const b = parseInt(balls || '0', 10) || 0
  return w + b / 6
}

function effectiveOvers(innings, fallbackOvers) {
  if (!innings) return 0
  if (innings.is_allout && fallbackOvers) return fallbackOvers
  return oversToDecimal(innings.overs_played)
}

export function buildLeagueStandings(teams, matches) {
  const rows = new Map()

  const ensureRow = (teamId, name, logo) => {
    const key = String(teamId)
    if (!rows.has(key)) {
      rows.set(key, {
        team_id: teamId,
        team_name: name,
        logo,
        played: 0,
        won: 0,
        lost: 0,
        tied: 0,
        points: 0,
        runs_for: 0,
        overs_for: 0,
        runs_against: 0,
        overs_against: 0,
        nrr: 0,
      })
    }
    const row = rows.get(key)
    if (!row.team_name && name) row.team_name = name
    if (!row.logo && logo) row.logo = logo
    return row
  }

  for (const t of teams) {
    const teamId = t.id ?? t.data?.id ?? t.data?.team_id
    const name = t.data?.team_name || t.data?.name
    const logo = t.data?.logo || t.data?.team_logo
    if (teamId) ensureRow(teamId, name, logo)
  }

  for (const m of matches) {
    const match = m.data
    if (!match) continue
    if (match.tournament_round_name !== LEAGUE_ROUND) continue
    if (match.status !== 'past') continue
    if (!match.match_result) continue

    const teamA = ensureRow(match.team_a_id, match.team_a, match.team_a_logo)
    const teamB = ensureRow(match.team_b_id, match.team_b, match.team_b_logo)

    teamA.played += 1
    teamB.played += 1

    const winner = (match.winning_team || '').trim()
    const isTied = !winner || /tie|no\s*result|abandon/i.test(match.match_result)

    if (isTied) {
      teamA.tied += 1; teamA.points += 1
      teamB.tied += 1; teamB.points += 1
    } else if (winner === match.team_a) {
      teamA.won += 1; teamA.points += 2
      teamB.lost += 1
    } else if (winner === match.team_b) {
      teamB.won += 1; teamB.points += 2
      teamA.lost += 1
    } else {
      teamA.tied += 1; teamA.points += 1
      teamB.tied += 1; teamB.points += 1
    }

    // NRR contributions
    const aIn = match.team_a_innings?.[0]
    const bIn = match.team_b_innings?.[0]
    const fullOvers = oversToDecimal(match.overs)

    const aRuns = aIn?.total_run || 0
    const bRuns = bIn?.total_run || 0
    const aOvers = effectiveOvers(aIn, fullOvers)
    const bOvers = effectiveOvers(bIn, fullOvers)

    teamA.runs_for += aRuns
    teamA.overs_for += aOvers
    teamA.runs_against += bRuns
    teamA.overs_against += bOvers

    teamB.runs_for += bRuns
    teamB.overs_for += bOvers
    teamB.runs_against += aRuns
    teamB.overs_against += aOvers
  }

  // Compute NRR per team
  for (const row of rows.values()) {
    const rfPerOver = row.overs_for > 0 ? row.runs_for / row.overs_for : 0
    const raPerOver = row.overs_against > 0 ? row.runs_against / row.overs_against : 0
    row.nrr = rfPerOver - raPerOver
  }

  return Array.from(rows.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.nrr !== a.nrr) return b.nrr - a.nrr
    if (b.won !== a.won) return b.won - a.won
    return (a.team_name || '').localeCompare(b.team_name || '')
  })
}

export function formatNRR(nrr) {
  if (!Number.isFinite(nrr) || nrr === 0) return '0.000'
  const sign = nrr > 0 ? '+' : ''
  return sign + nrr.toFixed(3)
}

export const LEAGUE_ROUND_NAME = LEAGUE_ROUND
