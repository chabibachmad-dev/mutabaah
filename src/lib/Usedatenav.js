import { useEffect, useRef, useState } from 'react'
import { addDays, isToday, todayKey } from './dateUtils'

/**
 * State tanggal yang dipakai halaman "Hari Ini" & "Klasemen".
 *
 * Selama user tidak sengaja pindah lihat tanggal lain (tombol ‹ ›), tanggal
 * ini otomatis ikut berpindah ke hari baru begitu tengah malam lewat --
 * dicek ulang tiap kali PWA-nya dibuka/difokuskan lagi (misal HP dikunci
 * semalaman lalu dibuka pagi harinya dengan app masih di background), supaya
 * tidak nyangkut di tanggal kemarin. Tidak perlu ada job/cron terjadwal
 * apapun karena progress memang disimpan per-tanggal, jadi hari baru otomatis
 * mulai dari 0% begitu tanggalnya berganti.
 */
export function useDateNav() {
  const [dateKey, setDateKey] = useState(todayKey())
  const pinnedToToday = useRef(true)

  function goPrevDay() {
    pinnedToToday.current = false
    setDateKey((d) => addDays(d, -1))
  }

  function goNextDay() {
    setDateKey((d) => {
      const next = addDays(d, 1)
      if (isToday(next)) pinnedToToday.current = true
      return next
    })
  }

  useEffect(() => {
    function checkRollover() {
      if (!pinnedToToday.current) return
      setDateKey((prev) => {
        const nowKey = todayKey()
        return prev === nowKey ? prev : nowKey
      })
    }

    document.addEventListener('visibilitychange', checkRollover)
    window.addEventListener('focus', checkRollover)
    const interval = setInterval(checkRollover, 60000)

    return () => {
      document.removeEventListener('visibilitychange', checkRollover)
      window.removeEventListener('focus', checkRollover)
      clearInterval(interval)
    }
  }, [])

  return { dateKey, goPrevDay, goNextDay }
}