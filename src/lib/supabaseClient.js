import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Konfigurasi Supabase belum lengkap. Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sudah diisi di file .env'
  )
}

const REQUEST_TIMEOUT_MS = 15000

/**
 * fetch dengan timeout, supaya kalau koneksi internet bermasalah, request ke
 * Supabase gagal dengan jelas (dan ditangkap oleh try/catch di lib/api.js)
 * alih-alih menggantung tanpa batas dan membuat UI terjebak di "Memuat...".
 */
function fetchWithTimeout(input, init) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
  global: {
    fetch: fetchWithTimeout,
  },
})
