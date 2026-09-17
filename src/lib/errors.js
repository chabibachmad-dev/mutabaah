/**
 * Mengubah error dari Supabase/fetch menjadi pesan yang gampang dipahami user.
 * Error jaringan (device offline, domain tidak bisa dijangkau, dll) sengaja
 * disamarkan jadi satu pesan umum; error lain dari Supabase (mis. tabel belum
 * dibuat, RLS menolak) tetap ditampilkan apa adanya karena berguna saat setup.
 */
export function friendlyError(err) {
  if (!err) return 'Terjadi kesalahan yang tidak diketahui.'

  const isNetworkError =
    err instanceof TypeError ||
    err?.name === 'AbortError' ||
    /failed to fetch|networkerror|load failed/i.test(err?.message || '')

  if (isNetworkError) {
    return 'Tidak bisa terhubung ke server. Periksa koneksi internetmu, lalu coba lagi.'
  }

  return err.message || 'Terjadi kesalahan, coba lagi.'
}
