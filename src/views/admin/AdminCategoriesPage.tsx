'use client'
import { useState, useMemo, useEffect } from 'react'
import { EVENT_META } from '../../data/mockCategories'
import { EventTile } from '@/features/shared-ui'

interface AdminCategory {
  id: string
  name: string
  defaultPct?: number
  description?: string
}

interface AdminEventTypeWithCats {
  id: string
  name: string
  description?: string
  categories: AdminCategory[]
}

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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

export default function AdminCategoriesPage() {
  const [eventTypes, setEventTypes]     = useState<AdminEventTypeWithCats[]>([])
  const [loading, setLoading]           = useState(true)
  const [activeType, setActiveType]     = useState<string | null>(null)
  const [editingCat, setEditingCat]     = useState<string | null>(null)
  const [newCatName, setNewCatName]     = useState('')
  const [newCatPct, setNewCatPct]       = useState('')
  const [addingCat, setAddingCat]       = useState(false)
  const [addingType, setAddingType]     = useState(false)
  const [newTypeName, setNewTypeName]   = useState('')
  const [toast, setToast]               = useState<string | null>(null)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentType = useMemo(() => eventTypes.find(t => t.id === activeType), [eventTypes, activeType])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  async function updateCategory(catId: string, patch: Partial<AdminCategory>) {
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'category', id: catId, ...patch }),
    })
    if (res.ok) { await reload(); showToast('Changes saved') }
  }

  async function deleteCategory(catId: string) {
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
    } else if (res.status === 401 || res.status === 403) {
      showToast('Not authorised. Sign out and back in as an admin, then try again.')
    } else {
      const data = await res.json().catch(() => null)
      showToast(data?.error ? `Could not add: ${data.error}` : `Could not add category (server error ${res.status})`)
    }
  }

  const totalPct = currentType?.categories?.reduce((s, c) => s + (c.defaultPct || 0), 0) ?? 0
  const pctOk    = Math.round(totalPct) === 100

  // Distinct category names across every event type, so admins can reuse an
  // existing service name instead of retyping it.
  const allCategoryNames = useMemo(
    () => [...new Set(eventTypes.flatMap(t => (t.categories ?? []).map(c => c.name)))].sort(),
    [eventTypes],
  )

  async function addEventType() {
    const name = newTypeName.trim()
    if (!name) return
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'event_type', id, name }),
      })
      if (res.ok) {
        setNewTypeName('')
        setAddingType(false)
        await reload()
        setActiveType(id)
        showToast(`"${name}" event type added`)
        return
      }
      // Surface the real reason instead of a blanket "may already exist".
      if (res.status === 401 || res.status === 403) {
        showToast('Not authorised. Sign out and back in as an admin, then try again.')
      } else if (res.status === 409) {
        showToast(`"${name}" already exists.`)
      } else {
        const data = await res.json().catch(() => null)
        showToast(data?.error ? `Could not add: ${data.error}` : `Could not add event type (server error ${res.status})`)
      }
    } catch {
      showToast('Network error reaching the server. Please try again.')
    }
  }

  // Proportionally scale the active type's category percentages to sum to 100,
  // so an admin can fill the gap without adding a new category.
  async function balanceTo100() {
    const cats = currentType?.categories ?? []
    if (!cats.length || totalPct === 0 || pctOk) return
    const factor = 100 / totalPct
    const scaled = cats.map(c => ({ id: c.id, pct: Math.max(0, Math.round((c.defaultPct || 0) * factor)) }))
    const diff = 100 - scaled.reduce((s, x) => s + x.pct, 0)
    if (scaled.length) scaled[0].pct += diff // absorb rounding on the largest (first, sorted desc)
    await Promise.all(scaled.map(x =>
      fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', id: x.id, defaultPct: x.pct }),
      }),
    ))
    await reload()
    showToast('Balanced to 100%')
  }

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
        <h1 className="font-display font-bold text-[22px] sm:text-[28px] text-white">Event Types &amp; Categories</h1>
        <p className="text-dark-muted text-[14px] mt-1">
          Add event types and the service categories organisers pick from when creating events. Changes apply to new events only.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden h-fit">
          <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-dark-muted px-4 py-3 border-b border-dark-border">Event Types</p>
          {eventTypes.map(t => {
            const meta     = (t.id && t.id in EVENT_META)
              ? EVENT_META[t.id as keyof typeof EVENT_META]
              : { emoji: '🎉', bg: '#1e293b', color: '#00C4CC' }
            const isActive = t.id === activeType
            return (
              <button key={t.id}
                onClick={() => { setActiveType(t.id); setEditingCat(null); setAddingCat(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-dark-border last:border-0 ${isActive ? 'bg-primary/10' : 'hover:bg-white/[0.03]'}`}
              >
                <EventTile type={t.id || ''} bg={meta.bg} color={meta.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-medium truncate ${isActive ? 'text-primary' : 'text-white'}`}>{t.name}</p>
                  <p className="text-[10px] text-dark-muted">{(t.categories ?? []).length} categories</p>
                </div>
              </button>
            )
          })}

          {addingType ? (
            <div className="p-3 border-t border-dark-border">
              <input autoFocus type="text" value={newTypeName} onChange={e => setNewTypeName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addEventType(); if (e.key === 'Escape') setAddingType(false) }}
                placeholder="e.g. Housewarming"
                className="w-full px-3 py-2 bg-dark border border-dark-border rounded-lg text-[13px] text-white placeholder:text-dark-muted focus:outline-none focus:border-primary/50 transition-colors"
              />
              <div className="flex gap-2 mt-2">
                <button onClick={addEventType} className="flex-1 py-1.5 bg-primary text-dark text-[12px] font-semibold rounded-lg hover:bg-primary/90 transition-colors">Add</button>
                <button onClick={() => { setAddingType(false); setNewTypeName('') }} className="px-3 py-1.5 border border-dark-border text-dark-muted text-[12px] rounded-lg hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingType(true)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left text-[12px] font-medium text-primary border-t border-dark-border hover:bg-primary/10 transition-colors">
              <PlusIcon /> Add event type
            </button>
          )}
        </div>

        {currentType && (
          <div>
            <div className="bg-dark-surface border border-dark-border rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const currentMeta = (currentType.id && currentType.id in EVENT_META)
                      ? EVENT_META[currentType.id as keyof typeof EVENT_META]
                      : { emoji: '🎉', bg: '#1e293b', color: '#00C4CC' }
                    return (
                      <EventTile type={currentType.id || ''} bg={currentMeta.bg} color={currentMeta.color} size="sm" />
                    )
                  })()}
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
                      {totalPct > 100 ? 'Over 100%, reduce some' : 'Add more to reach 100%'}
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
                          onSave={async (patch: Partial<AdminCategory>) => {
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
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-[12px] text-dark-muted mb-1.5">Category name</label>
                        <input autoFocus type="text" list="admin-category-names" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') setAddingCat(false) }}
                          placeholder="Pick an existing service or type a new one"
                          className="w-full px-3.5 py-2.5 bg-dark border border-dark-border rounded-lg text-[13px] text-white placeholder:text-dark-muted focus:outline-none focus:border-primary/50 transition-colors"
                        />
                        <datalist id="admin-category-names">
                          {allCategoryNames.map(n => <option key={n} value={n} />)}
                        </datalist>
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
              <div className="flex items-center justify-between mt-2 gap-3">
                <p className="text-[11px] text-dark-muted">
                  These percentages are used as Smart Split defaults when organisers create plans.
                </p>
                {!pctOk && totalPct > 0 && (
                  <button onClick={balanceTo100}
                    className="shrink-0 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-[12px] font-medium rounded-lg hover:bg-primary/15 transition-colors">
                    Balance to 100%
                  </button>
                )}
              </div>
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

interface EditCategoryRowProps {
  cat: AdminCategory
  onSave: (patch: { name: string; defaultPct: number; description: string }) => void
  onCancel: () => void
}

function EditCategoryRow({ cat, onSave, onCancel }: EditCategoryRowProps) {
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
