import { useCallback, useEffect, useState } from 'react'
import HabitCard from '../components/HabitCard'
import ProgressRing from '../components/ProgressRing'
import { getLogsForDate, listHabitTypes, upsertLog } from '../lib/api'
import { addDays, formatDateLong, isToday, todayKey } from '../lib/dateUtils'
import { friendlyError } from '../lib/errors'
import { computeDailyScore } from '../lib/scoring'

export default function TodayPage({ user, onManageTargets }) {
  const [dateKey, setDateKey] = useState(todayKey())
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [habitTypes, logMap] = await Promise.all([listHabitTypes(user.id), getLogsForDate(user.id, dateKey)])
      setHabits(habitTypes)
      setLogs(logMap)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [user.id, dateKey])

  useEffect(() => {
    load()
  }, [load])

  async function handleChange(habitId, value) {
    setLogs((prev) => ({ ...prev, [habitId]: value }))
    setSavingId(habitId)
    try {
      await upsertLog(user.id, habitId, dateKey, value)
    } catch (err) {
      setToast('Gagal menyimpan: ' + friendlyError(err))
      setTimeout(() => setToast(''), 2500)
    } finally {
      setSavingId(null)
    }
  }

  const score = computeDailyScore(habits, logs)

  return (
    <>
      <div className="card date-nav">
        <button onClick={() => setDateKey((d) => addDays(d, -1))} aria-label="Hari sebelumnya">
          ‹
        </button>
        <div className="date-label">
          {isToday(dateKey) ? 'Hari Ini' : formatDateLong(dateKey)}
          {!isToday(dateKey) && <div style={{ fontWeight: 400, fontSize: 11, color: 'var(--color-text-muted)' }}>{formatDateLong(dateKey)}</div>}
        </div>
        <button
          onClick={() => setDateKey((d) => addDays(d, 1))}
          disabled={isToday(dateKey)}
          aria-label="Hari berikutnya"
        >
          ›
        </button>
      </div>

      <div className="card summary-ring-row">
        <ProgressRing pct={score.averagePct} />
        <div className="summary-text">
          <div className="big">
            {score.completedHabits} dari {score.totalHabits} target tuntas
          </div>
          <div className="muted">Rata-rata capaian: {Math.round(score.averagePct * 100)}%</div>
        </div>
      </div>

      {loading && <div className="spinner-wrap">Memuat...</div>}
      {error && (
        <div className="card">
          <div className="error-text">{error}</div>
        </div>
      )}

      {!loading && !error && habits.length === 0 && (
        <div className="card empty-state">
          Belum ada target. Tambahkan lewat menu "Target" di bawah.
        </div>
      )}

      {!loading &&
        habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            actual={logs[habit.id] ?? 0}
            onChange={handleChange}
            disabled={savingId === habit.id}
          />
        ))}

      {!loading && habits.length > 0 && (
        <button className="btn btn-outline btn-full" onClick={onManageTargets}>
          + Kelola target
        </button>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
