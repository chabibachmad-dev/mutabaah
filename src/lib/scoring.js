/**
 * Menghitung persentase capaian satu target: actual/target, dibatasi maksimal 100%.
 * Target dengan target_amount <= 0 dianggap tidak valid dan diabaikan oleh pemanggil.
 */
export function habitPercent(actualAmount, targetAmount) {
  if (!targetAmount || targetAmount <= 0) return 0
  const pct = (Number(actualAmount) || 0) / Number(targetAmount)
  return Math.max(0, Math.min(1, pct))
}

/**
 * Menghitung skor rata-rata harian seorang user dari daftar targetnya + log capaiannya.
 * habitTypes: [{ id, target_amount }]
 * logsByHabitId: { [habit_type_id]: actual_amount }
 * Target yang tidak ada log-nya pada tanggal tsb dihitung sebagai 0%.
 * Mengembalikan { averagePct, totalHabits, completedHabits } — completedHabits = target yang capaiannya >= 100%.
 */
export function computeDailyScore(habitTypes, logsByHabitId) {
  if (!habitTypes || habitTypes.length === 0) {
    return { averagePct: 0, totalHabits: 0, completedHabits: 0 }
  }

  let sum = 0
  let completed = 0
  for (const habit of habitTypes) {
    const actual = logsByHabitId[habit.id] ?? 0
    const pct = habitPercent(actual, habit.target_amount)
    sum += pct
    if (pct >= 1) completed += 1
  }

  return {
    averagePct: sum / habitTypes.length,
    totalHabits: habitTypes.length,
    completedHabits: completed,
  }
}

export function pctToLabel(pct) {
  return `${Math.round(pct * 100)}%`
}
