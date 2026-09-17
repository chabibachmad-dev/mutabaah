const STORAGE_KEY = 'mutabaah_user'

/**
 * Menyimpan identitas user (id + nama) di localStorage perangkat ini.
 * Karena aplikasi tidak memakai login, "identitas" hanyalah id user yang
 * tersimpan di perangkat — cukup untuk menandai data mana yang milik siapa.
 */
export function getSavedUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.id && parsed.name) return parsed
    return null
  } catch {
    return null
  }
}

export function saveUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: user.id, name: user.name }))
  } catch {
    // localStorage tidak tersedia (mode private/incognito ketat) — abaikan,
    // user akan diminta membuat/pilih nama lagi tiap buka app.
  }
}

export function clearSavedUser() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
