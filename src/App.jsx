import { useState } from 'react'
import Onboarding from './pages/Onboarding'
import TodayPage from './pages/TodayPage'
import LeaderboardPage from './pages/LeaderboardPage'
import TargetsPage from './pages/TargetsPage'
import { IconCheck, IconTarget, IconTrophy } from './components/Icons'
import { clearSavedUser, getSavedUser, saveUser } from './lib/storage'

const TABS = [
  { key: 'today', label: 'Hari Ini', Icon: IconCheck },
  { key: 'leaderboard', label: 'Klasemen', Icon: IconTrophy },
  { key: 'targets', label: 'Target', Icon: IconTarget },
]

export default function App() {
  const [user, setUser] = useState(() => getSavedUser())
  const [tab, setTab] = useState('today')
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false)

  function handleOnboarded(newUser) {
    saveUser(newUser)
    setUser(newUser)
    setTab('today')
  }

  function handleSwitchUser() {
    clearSavedUser()
    setUser(null)
    setShowSwitchConfirm(false)
  }

  if (!user) {
    return <Onboarding onDone={handleOnboarded} />
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-row">
          <div>
            <h1>Mutabaah</h1>
            <div className="subtitle">Assalamu'alaikum, {user.name}</div>
          </div>
          <button className="icon-btn" onClick={() => setShowSwitchConfirm(true)} aria-label="Ganti user" title="Ganti user">
            ⇄
          </button>
        </div>
      </header>

      <main className="app-content">
        {tab === 'today' && <TodayPage user={user} onManageTargets={() => setTab('targets')} />}
        {tab === 'leaderboard' && <LeaderboardPage user={user} />}
        {tab === 'targets' && <TargetsPage user={user} />}
      </main>

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`nav-item${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className="nav-icon">
              <t.Icon />
            </span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {showSwitchConfirm && (
        <div className="modal-overlay" onClick={() => setShowSwitchConfirm(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Ganti user?</div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
              Kamu akan keluar dari akun "{user.name}" di perangkat ini. Data tetap tersimpan, kamu bisa masuk
              lagi dengan memilih nama ini di layar awal.
            </p>
            <button className="btn btn-primary btn-full" onClick={handleSwitchUser}>
              Ya, ganti user
            </button>
            <button className="btn btn-outline btn-full" onClick={() => setShowSwitchConfirm(false)}>
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
