'use client'
import { useState, useMemo, useEffect } from 'react'
import { EVENT_META } from '../../data/mockCategories'

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}
function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

export default function AdminCategoriesPage() {
  const [eventTypes, setEventTypes]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [activeType, setActiveType]     = useState(null)
  const [editingCat, setEditingCat]     = useState(null)
  const [newCatName, setNewCatName]     = useState('')
  const [newCatPct, setNewCatPct]       = useState('')
  const [addingCat, setAddingCat]       = useState(false)
  const [toast, setToast]               = useState(null)

  function reload() {
    return fetch('/api/categories')
      .then(r => r.ok ? r.json() : { eventTypes: [] })
      .then(data => {
        const ets = data.eventTypes ?? []
        setEventTypes(ets)
        if (!activeType && ets.length > 0) setActiveType(ets[0].id)
      })
  }

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [])

  const currentType = useMemo(() => eventTypes.find(t => t.id === activeType), [eventTypes, activeType])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  async function updateCategory(catId, patch) {
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'category', id: catId, ...patch }),
    })
    if (res.ok) { await reload(); showToast('Changes saved') }
  }

  async function deleteCategory(catId) {
    const res = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'category', id: catId }),
    })
    if (res.ok) { await reload(); showToast('Category removed') }
  }

  async function addCategory() {
    const name = newCatName.trim()
    const pct  = Number(newCatPct)
    if (!name || !activeType) return
    const id = `${activeType}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now().toString(36)}`
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'category', id, eventTypeId: activeType, name, defaultPct: pct || 0 }),
    })
    if (res.ok) {
      setNewCatName('')
      setNewCatPct('')
      setAddingCat(false)
      await reload()
      showToast(`"${name}" added`)
    }
  }

  const totalPct = currentType?.categories?.reduce((s, c) => s + (c.defaultPct || 0), 0) ?? 0
  const pctOk    = Math.round(totalPct) === 100

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-7">
        <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-dark-muted mb-1">Admin</p>
        <h1 className="font-display font-bold text-[28px] text-white">Manage Categories</h1>
        <p className="text-dark-muted text-[14px] mt-1">
          Pre-populated categories shown to organisers when creating plans. Changes apply to new plans only.
        </p>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-5">
        <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden h-fit">
          <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-dark-muted px-4 py-3 border-b border-dark-border">Event Types</p>
          {eventTypes.map(t => {
            const meta     = EVENT_META[t.id] ?? { emoji: '🎉', bg: '#1e293b' }
            const isActive = t.id === activeType
            return (
              <button key={t.id}
                onClick={() => { setActiveType(t.id); setEditingCat(null); setAddingCat(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-dark-border last:border-0 ${isActive ? 'bg-primary/10' : 'hover:bg-white/[0.03]'}`}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ background: meta.bg }}>
                  {meta.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-medium truncate ${isActive ? 'text-primary' : 'text-white'}`}>{t.name}</p>
                  <p className="text-[10px] text-dark-muted">{(t.categories ?? []).length} categories</p>
                </div>
              </button>
            )
          })}
        </div>

        {currentType && (
          <div>
            <div className="bg-dark-surface border border-dark-border rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: (EVENT_META[currentType.id] ?? { bg: '#1e293b' }).bg }}>
                    {(EVENT_META[currentType.id] ?? { emoji: '🎉' }).emoji}
                  </span>
                  <div>
                    <p className="font-display font-semibold text-[16px] text-white">{currentType.name}</p>
                    <p className="text-dark-muted text-[12px]">{currentType.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-dark-muted mb-0.5">Budget %</p>
                  <p className={`font-display font-bold text-[20px] ${pctOk ? 'text-primary' : totalPct > 100 ? 'text-red-400' : 'text-warning'}`}>
                    {Math.round(totalPct)}%
                  </p>
                  {!pctOk && (
                    <p className="text-[10px] text-warning mt-0.5">
                      {totalPct > 100 ? 'Over 100% — reduce some' : 'Add more to reach 100%'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-dark-border">
                <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-dark-muted">
                  Categories ({(currentType.categories ?? []).length})
                </p>
                <button onClick={() => { setAddingCat(true); setEditingCat(null) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-[12px] font-medium rounded-lg hover:bg-primary/15 transition-colors"
                >
                  <PlusIcon /> Add Category
                </button>
              </div>

              <div className="divide-y divide-dark-border">
                {(currentType.categories ?? []).map(cat => {
                  const isEditing = editingCat === cat.id
                  return (
                    <div key={cat.id} className="px-5 py-3.5">
                      {isEditing ? (
                        <EditCategoryRow
                          cat={cat}
                          onSave={async (patch) => {
                            await updateCategory(cat.id, patch)
                            setEditingCat(null)
                          }}
                          onCancel={() => setEditingCat(null)}
                        />
                      ) : (
                        <div className="flex items-center gap-4 group">
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-white">{cat.name}</p>
                            {cat.description && (
                              <p className="text-[11px] text-dark-muted mt-0.5 truncate">{cat.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <p className="text-[11px] text-dark-muted mb-0.5">Default %</p>
                              <p className="text-[13px] font-semibold text-white tabular-nums">{cat.defaultPct ?? 0}%</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingCat(cat.id); setAddingCat(false) }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-muted hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                                <EditIcon />
                              </button>
                              <button onClick={() => deleteCategory(cat.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-muted hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                                <TrashIcon />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {addingCat && (
                  <div className="px-5 py-3.5 bg-primary/5 border-t border-dark-border">
                    <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-primary mb-3">New Category</p>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-[12px] text-dark-muted mb-1.5">Category name</label>
                        <input autoFocus type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') setAddingCat(false) }}
                          placeholder="e.g. Event Security"
                          className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-lg text-[13px] text-white placeholder:text-dark-muted focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-[12px] text-dark-muted mb-1.5">Default %</label>
                        <div className="relative">
                          <input type="number" min="0" max="100" value={newCatPct} onChange={e => setNewCatPct(e.target.value)} placeholder="0"
                            className="w-full pr-6 pl-3 py-2.5 bg-dark border border-dark-border rounded-lg text-[13px] text-white placeholder:text-dark-muted focus:outline-none focus:border-primary/50 transition-colors"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-muted text-[12px]">%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pb-px">
                        <button onClick={addCategory} className="px-4 py-2.5 bg-primary text-dark text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors">Add</button>
                        <button onClick={() => setAddingCat(false)} className="px-4 py-2.5 border border-dark-border text-dark-muted text-[13px] rounded-lg hover:text-white transition-colors">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-dark-surface border border-dark-border rounded-xl p-5">
              <div className="flex items-center justify-between text-[12px] mb-2">
                <span className="text-dark-muted">Budget allocation across categories</span>
                <span className={pctOk ? 'text-primary' : totalPct > 100 ? 'text-red-400' : 'text-warning'}>{Math.round(totalPct)}% of 100%</span>
              </div>
              <div className="h-2 bg-dark rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(totalPct, 100)}%`, background: pctOk ? '#00C4CC' : totalPct > 100 ? '#f87171' : '#FFDE59' }}
                />
              </div>
              <p className="text-[11px] text-dark-muted mt-2">
                These percentages are used as Smart Split defaults when organisers create plans.
              </p>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-ink text-[13px] font-medium px-5 py-2.5 rounded-full shadow-lg border border-border z-50 pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  )
}

function EditCategoryRow({ cat, onSave, onCancel }) {
  const [name, setName] = useState(cat.name)
  const [pct, setPct]   = useState(String(cat.defaultPct ?? 0))
  const [desc, setDesc] = useState(cat.description ?? '')

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({ name: trimmed, defaultPct: Number(pct) || 0, description: desc.trim() })
  }

  return (
    <div>
      <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-primary mb-3">Editing</p>
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-[12px] text-dark-muted mb-1">Name</label>
          <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
            className="w-full px-3.5 py-2 bg-dark border border-dark-border rounded-lg text-[13px] text-white focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="w-24">
          <label className="block text-[12px] text-dark-muted mb-1">Default %</label>
          <div className="relative">
            <input type="number" min="0" max="100" value={pct} onChange={e => setPct(e.target.value)}
              className="w-full pr-6 pl-3 py-2 bg-dark border border-dark-border rounded-lg text-[13px] text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-muted text-[12px]">%</span>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-[12px] text-dark-muted mb-1">Description (optional)</label>
        <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description for this category"
          className="w-full px-3.5 py-2 bg-dark border border-dark-border rounded-lg text-[13px] text-white placeholder:text-dark-muted focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} className="px-4 py-2 bg-primary text-dark text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors">Save</button>
        <button onClick={onCancel} className="px-4 py-2 border border-dark-border text-dark-muted text-[13px] rounded-lg hover:text-white transition-colors">Cancel</button>
      </div>
    </div>
  )
}
