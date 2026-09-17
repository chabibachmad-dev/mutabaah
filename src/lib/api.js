import { supabase } from './supabaseClient'

/** Membuat user baru. Trigger di database otomatis mengisi 5 target default. */
export async function createUser(name) {
  const { data, error } = await supabase
    .from('users')
    .insert({ name: name.trim() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function renameUser(userId, newName) {
  const { error } = await supabase.from('users').update({ name: newName.trim() }).eq('id', userId)
  if (error) throw error
}

/** Daftar semua user, untuk fitur "pilih user yang sudah ada" & klasemen. */
export async function listUsers() {
  const { data, error } = await supabase.from('users').select('id, name, created_at').order('name')
  if (error) throw error
  return data
}

export async function listHabitTypes(userId, { includeArchived = false } = {}) {
  let query = supabase
    .from('habit_types')
    .select('id, user_id, name, unit, target_amount, is_default, sort_order, archived')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (!includeArchived) query = query.eq('archived', false)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createHabitType(userId, { name, unit, targetAmount }) {
  const { data, error } = await supabase
    .from('habit_types')
    .insert({
      user_id: userId,
      name: name.trim(),
      unit: unit.trim() || 'kali',
      target_amount: targetAmount,
      is_default: false,
      sort_order: 999,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateHabitType(habitId, patch) {
  const { error } = await supabase.from('habit_types').update(patch).eq('id', habitId)
  if (error) throw error
}

export async function deleteHabitType(habitId) {
  const { error } = await supabase.from('habit_types').delete().eq('id', habitId)
  if (error) throw error
}

/** Ambil log capaian seorang user pada satu tanggal, dalam bentuk map habit_type_id -> actual_amount. */
export async function getLogsForDate(userId, dateKey) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('habit_type_id, actual_amount')
    .eq('user_id', userId)
    .eq('log_date', dateKey)
  if (error) throw error

  const map = {}
  for (const row of data) map[row.habit_type_id] = Number(row.actual_amount)
  return map
}

/** Simpan/update capaian satu target pada satu tanggal (upsert berdasarkan unique constraint). */
export async function upsertLog(userId, habitTypeId, dateKey, actualAmount) {
  const { error } = await supabase
    .from('daily_logs')
    .upsert(
      { user_id: userId, habit_type_id: habitTypeId, log_date: dateKey, actual_amount: actualAmount },
      { onConflict: 'user_id,habit_type_id,log_date' }
    )
  if (error) throw error
}

/**
 * Data untuk klasemen harian: semua user + semua target aktif mereka + log pada tanggal tsb.
 * Perhitungan skor dilakukan di client (lihat lib/scoring.js) supaya mudah disesuaikan.
 */
export async function getLeaderboardData(dateKey) {
  const [usersRes, habitsRes, logsRes] = await Promise.all([
    supabase.from('users').select('id, name'),
    supabase
      .from('habit_types')
      .select('id, user_id, name, unit, target_amount')
      .eq('archived', false),
    supabase.from('daily_logs').select('user_id, habit_type_id, actual_amount').eq('log_date', dateKey),
  ])

  if (usersRes.error) throw usersRes.error
  if (habitsRes.error) throw habitsRes.error
  if (logsRes.error) throw logsRes.error

  return {
    users: usersRes.data,
    habitTypes: habitsRes.data,
    logs: logsRes.data,
  }
}
