import { useEffect, useState } from 'react'
import { createUser, listUsers } from '../lib/api'
import { friendlyError } from '../lib/errors'

export default function Onboarding({ onDone }) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [existingUsers, setExistingUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    listUsers()
      .then(setExistingUsers)
      .catch(() => setExistingUsers([]))
      .finally(() => setLoadingUsers(false))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Nama tidak boleh kosong.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const user = await createUser(trimmed)
      onDone(user)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  function handlePickExisting(user) {
    onDone(user)
  }

  return (
    <div className="onboarding-screen">
      <div className="onboarding-hero">
        <div className="onboarding-logo">🕌</div>
        <div className="onboarding-title">Mutabaah</div>
        <div className="onboarding-subtitle">Pantau target ibadah & kebiasaan harianmu, bareng-bareng.</div>
      </div>

      <div className="onboarding-body">
        <div className="onboarding-card">
          <form onSubmit={handleCreate} className="field">
            <label htmlFor="name">Nama kamu</label>
            <input
              id="name"
              type="text"
              placeholder="mis. Ahmad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoFocus
            />
            {error && <div className="error-text">{error}</div>}
            <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
              {submitting ? 'Membuat...' : 'Mulai'}
            </button>
          </form>

          {!loadingUsers && existingUsers.length > 0 && (
            <>
              <div className="divider-text">atau lanjutkan sebagai</div>
              <div className="existing-user-list">
                {existingUsers.map((u) => (
                  <div key={u.id} className="existing-user-row" onClick={() => handlePickExisting(u)}>
                    <span>{u.name}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Pilih →</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
