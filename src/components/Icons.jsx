// Ikon flat, minimalis, satu warna (garis) — dipakai di navigasi bawah.
// Semua pakai currentColor supaya otomatis ikut warna teks tab (aktif/nonaktif).

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconCheck({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12.3 10.8 15.2 16 9.3" />
    </svg>
  )
}

export function IconTrophy({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M7 4h10v4.2a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4.5A1.5 1.5 0 0 0 3 6.5v.5A2.5 2.5 0 0 0 5.5 9.5H7" />
      <path d="M17 5h2.5A1.5 1.5 0 0 1 21 6.5v.5a2.5 2.5 0 0 1-2.5 2.5H17" />
      <path d="M9.5 20.5h5" />
      <path d="M12 15.5v5" />
    </svg>
  )
}

export function IconTarget({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
