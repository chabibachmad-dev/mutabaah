import { useEffect, useState } from 'react'
import { createHabitType, deleteHabitType, listHabitTypes, updateHabitType } from '../lib/api'
import { friendlyError } from '../lib/errors'

function ManageRow({ habit, onSaved, onDeleted }) {
  const [name, setName] = useState(habit.name)
  const [unit, setUnit] = useState(habit.unit)
  const [targetAmount, setTargetAmount] = useState(habit.target_amount)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function saveField(patch) {
    setBusy(true)
    try {
      await updateHabitType(habit.id, patch)
      onSaved()
    } catch (err) {
      alert('Gagal menyimpan: ' + friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteHabitType(habit.id)
      onDeleted()
    } catch (err) {
      alert('Gagal menghapus: ' + friendlyError(err))
      setBusy(false)
    }
  }

  return (
    <div className="habit-manage-row">
      <div className="habit-manage-top">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name !== habit.name && saveField({ name: name.trim() })}
          style={{ border: 'none', fontWeight: 600, fontSize: 14, flex: 1, background: 'transparent' }}
          disabled={busy}
        />
        {habit.is_default && <span className="badge">default</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label>Target</label>
          <input
            type="number"
            min="0.1"
            step="any"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            onBlur={() => {
              const num = Number(targetAmount)
              if (num > 0 && num !== habit.target_amount) saveField({ target_amount: num })
            }}
            disabled={busy}
          />
        </div>
        <div className="field">
          <label>Satuan</label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            onBlur={() => unit.trim() && unit !== habit.unit && saveField({ unit: unit.trim() })}
            disabled={busy}
          />
        </div>
      </div>

      {!confirmDelete ? (
        <button className="btn-danger-text" onClick={() => setConfirmDelete(true)} disabled={busy}>
          Hapus target ini
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13 }}>Yakin hapus? Riwayat capaian target ini ikut hilang.</span>
          <button className="btn-danger-text" onClick={handleDelete} disabled={busy}>
            Ya, hapus
          </button>
          <button className="btn-danger-text" style={{ color: 'var(--color-text-muted)' }} onClick={() => setConfirmDelete(false)}>
            Batal
          </button>
        </div>
      )}
    </div>
  )
}

export default function TargetsPage({ user }) {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newName, setNewName] = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await listHabitTypes(user.id)
      setHabits(data)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    setAddError('')
    const name = newName.trim()
    const unit = newUnit.trim() || 'kali'
    const target = Number(newTarget)

    if (!name) {
      setAddError('Nama target wajib diisi.')
      return
    }
    if (!target || target <= 0) {
      setAddError('Besaran target harus lebih dari 0.')
      return
    }

    setAdding(true)
    try {
      await createHabitType(user.id, { name, unit, targetAmount: target })
      setNewName('')
      setNewUnit('')
      setNewTarget('')
      await load()
    } catch (err) {
      setAddError(friendlyError(err))
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <div className="card">
        <div className="section-title" style={{ margin: '0 0 10px' }}>
          Tambah target baru
        </div>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="field">
            <label>Nama target</label>
            <input
              placeholder="mis. Hafalan Qur'an"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={60}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Besaran target</label>
              <input
                type="number"
                inputMode="decimal"
                min="0.1"
                step="any"
                placeholder="mis. 5"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Satuan</label>
              <input
                placeholder="mis. halaman"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                maxLength={20}
              />
            </div>
          </div>
          {addError && <div className="error-text">{addError}</div>}
          <button className="btn btn-primary btn-full" type="submit" disabled={adding}>
            {adding ? 'Menambah...' : '+ Tambah target'}
          </button>
        </form>
      </div>

      <div className="section-title">Target aktif</div>

      {loading && <div className="spinner-wrap">Memuat...</div>}
      {error && (
        <div className="card">
          <div className="error-text">{error}</div>
        </div>
      )}

      {!loading &&
        habits.map((habit) => (
          <ManageRow key={habit.id} habit={habit} onSaved={load} onDeleted={load} />
        ))}

      {!loading && habits.length === 0 && <div className="card empty-state">Belum ada target.</div>}
    </>
  )
}
