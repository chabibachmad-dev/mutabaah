import { useCallback, useEffect, useState } from 'react'
import { getLeaderboardData } from '../lib/api'
import { formatDateLong, isToday } from '../lib/dateUtils'
import { friendlyError } from '../lib/errors'
import { computeDailyScore } from '../lib/scoring'
import { useDateNav } from '../lib/useDateNav'

function rankClass(index) {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return ''
}

export default function LeaderboardPage({ user }) {
  const { dateKey, goPrevDay, goNextDay } = useDateNav()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { users, habitTypes, logs } = await getLeaderboardData(dateKey)

      const habitsByUser = {}
      for (const h of habitTypes) {
        if (!habitsByUser[h.user_id]) habitsByUser[h.user_id] = []
        habitsByUser[h.user_id].push(h)
      }

      const logsByUser = {}
      for (const l of logs) {
        if (!logsByUser[l.user_id]) logsByUser[l.user_id] = {}
        logsByUser[l.user_id][l.habit_type_id] = Number(l.actual_amount)
      }

      const computed = users.map((u) => {
        const userHabits = habitsByUser[u.id] || []
        const score = computeDailyScore(userHabits, logsByUser[u.id] || {})
        return { ...u, ...score }
      })

      computed.sort((a, b) => b.averagePct - a.averagePct || b.completedHabits - a.completedHabits)
      setRows(computed)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [dateKey])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <div className="card date-nav">
        <button onClick={goPrevDay} aria-label="Hari sebelumnya">
          ‹
        </button>
        <div className="date-label">
          {isToday(dateKey) ? 'Klasemen Hari Ini' : 'Klasemen'}
          <div style={{ fontWeight: 400, fontSize: 11, color: 'var(--color-text-muted)' }}>{formatDateLong(dateKey)}</div>
        </div>
        <button onClick={goNextDay} disabled={isToday(dateKey)} aria-label="Hari berikutnya">
          ›
        </button>
      </div>

      {loading && <div className="spinner-wrap">Memuat...</div>}
      {error && (
        <div className="card">
          <div className="error-text">{error}</div>
        </div>
      )}

      {!loading && !error && (
        <div className="card">
          {rows.length === 0 && <div className="empty-state">Belum ada user.</div>}
          {rows.map((row, i) => (
            <div className="leaderboard-row" key={row.id}>
              <div className={`rank-badge ${rankClass(i)}`}>{i + 1}</div>
              <div className="leaderboard-info">
                <div className={`leaderboard-name${row.id === user.id ? ' me' : ''}`}>{row.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  {row.completedHabits}/{row.totalHabits} target tuntas
                </div>
              </div>
              <div className="leaderboard-pct">{Math.round(row.averagePct * 100)}%</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
