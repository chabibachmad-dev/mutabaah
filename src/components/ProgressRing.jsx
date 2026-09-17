export default function ProgressRing({ pct, size = 74 }) {
  const percent = Math.round(pct * 100)
  const color = percent >= 100 ? '#16a34a' : 'var(--color-primary)'
  const bg = `conic-gradient(${color} ${percent * 3.6}deg, var(--color-border) 0deg)`

  return (
    <div
      className="summary-ring"
      style={{
        width: size,
        height: size,
        background: bg,
      }}
    >
      <div
        style={{
          width: size - 14,
          height: size - 14,
          borderRadius: '50%',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {percent}%
      </div>
    </div>
  )
}
