import { useEffect, useState } from 'react'
import { habitPercent, pctToLabel } from '../lib/scoring'

/**
 * Kartu satu target harian di halaman "Hari Ini".
 * Input jumlah pakai stepper (+/-) supaya nyaman di HP, plus bisa diketik langsung.
 */
export default function HabitCard({ habit, actual, onChange, disabled }) {
  const [value, setValue] = useState(actual ?? 0)

  useEffect(() => {
    setValue(actual ?? 0)
  }, [actual])

  const pct = habitPercent(value, habit.target_amount)
  const step = habit.target_amount >= 20 ? Math.max(1, Math.round(habit.target_amount / 10)) : 1

  function commit(next) {
    const clamped = Math.max(0, next)
    setValue(clamped)
    onChange(habit.id, clamped)
  }

  return (
    <div className="card habit-card">
      <div className="habit-card-top">
        <div>
          <div className="habit-name">{habit.name}</div>
          <div className="habit-target">
            Target: {habit.target_amount} {habit.unit}
          </div>
        </div>
        <div className="habit-pct">{pctToLabel(pct)}</div>
      </div>

      <div className="progress-bar-track">
        <div className={`progress-bar-fill${pct >= 1 ? ' done' : ''}`} style={{ width: `${pct * 100}%` }} />
      </div>

      <div className="habit-controls">
        <button
          type="button"
          className="stepper-btn"
          disabled={disabled || value <= 0}
          onClick={() => commit(value - step)}
        >
          −
        </button>
        <input
          className="stepper-input"
          type="number"
          inputMode="decimal"
          min="0"
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => commit(Number(value) || 0)}
        />
        <button type="button" className="stepper-btn" disabled={disabled} onClick={() => commit(value + step)}>
          +
        </button>
      </div>
    </div>
  )
}
