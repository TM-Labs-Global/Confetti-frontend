'use client'
import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EventTile } from '@/features/shared-ui'
import * as Icons from 'lucide-react'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira } from '@/shared/utils/format'

interface EventCategory {
  id: string
  name: string
  defaultPct?: number
  description?: string
}

interface EventTypeInfo {
  id: string
  name: string
  categories: EventCategory[]
}

interface FormState {
  eventType: string | null
  eventTypeName: string
  name: string
  date: string
  dateFlexible: boolean
  state: string
  city: string
  totalBudget: string
  selectedCategories: string[]
  customCategories: Array<{ id: string; name: string; defaultPct?: number }>
  allocations: Record<string, string | number>
  allocationMode: string
}

interface WizardProgressProps {
  step: number
  total: number
  onBack: () => void
}

interface Step1Props {
  form: FormState
  onChange: (key: keyof FormState, value: any) => void
  eventTypes: EventTypeInfo[]
}

interface Step2Props {
  form: FormState
  onChange: (key: keyof FormState, value: any) => void
  getCatsForType: (typeId: string | null) => EventCategory[]
}

interface Step3Props {
  form: FormState
  onChange: (key: keyof FormState, value: any) => void
  getCatsForType: (typeId: string | null) => EventCategory[]
}

interface Step4Props {
  form: FormState
  getCatsForType: (typeId: string | null) => EventCategory[]
  onPublish: () => void
  onSave: () => void
  saving: string | null
}

const NIGERIAN_STATES = [
  'Abia','Abuja (FCT)','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue',
  'Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
]

function WizardProgress({ step, total, onBack }: WizardProgressProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          disabled={step === 1}
          className="flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink transition-colors disabled:opacity-0 disabled:pointer-events-none"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${(step / total) * 100}%` }} />
        </div>
        <span className="font-mono text-[12px] text-ink-3 shrink-0 tabular-nums">{step} of {total}</span>
      </div>
    </div>
  )
}

function Step1({ form, onChange, eventTypes }: Step1Props) {
  const selectedType = eventTypes.find(e => e.id === form.eventType)

  return (
    <div>
      <h2 className="font-display font-bold text-[30px] text-ink leading-tight mb-1">What's the occasion?</h2>
      <p className="text-ink-3 text-[15px] mb-8">Tell us about your event — just the basics.</p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {eventTypes.map(type => {
          const meta = (type.id && type.id in EVENT_META)
            ? EVENT_META[type.id as keyof typeof EVENT_META]
            : { emoji: '🎉', icon: 'PartyPopper', color: '#6C7CC7', bg: '#F5F5F5', tagline: '' }
          const isSelected = form.eventType === type.id
          const IconComponent = (meta.icon in Icons ? Icons[meta.icon as keyof typeof Icons] : Icons.PartyPopper) as React.ComponentType<any>
          return (
            <button key={type.id} onClick={() => onChange('eventType', type.id)}
              className={`p-4 rounded-xl border text-left transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]' : 'border-border bg-white hover:border-primary/40 hover:shadow-sm'}`}
            >
              <IconComponent size={28} className="block mb-2" style={{ color: meta.color }} />
              <p className="font-display font-semibold text-ink text-[14px] leading-tight">{type.name}</p>
              <p className="text-ink-3 text-[11px] mt-0.5">{meta.tagline}</p>
            </button>
          )
        })}
      </div>

      {form.eventType && (
        <div className="bg-white border border-border rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-ink-2 mb-1.5">Give this {selectedType?.name} a name</label>
            <input type="text" value={form.name} onChange={e => onChange('name', e.target.value)}
              placeholder={`e.g. "Tunde & Amaka's Wedding"`}
              className="w-full px-4 py-3 border border-border rounded-lg text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-ink-2">Date</label>
              <label className="flex items-center gap-2 text-[12px] text-ink-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.dateFlexible} onChange={e => onChange('dateFlexible', e.target.checked)} className="w-3.5 h-3.5 rounded accent-primary" />
                Set date later
              </label>
            </div>
            <input type="date" value={form.date} disabled={form.dateFlexible} onChange={e => onChange('date', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg text-[14px] text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors disabled:opacity-40 disabled:bg-canvas"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-ink-2 mb-1.5">State</label>
              <select value={form.state} onChange={e => onChange('state', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg text-[14px] text-ink bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors">
                <option value="">Select state</option>
                {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-2 mb-1.5">City</label>
              <input type="text" value={form.city} onChange={e => onChange('city', e.target.value)} placeholder="e.g. Ikeja"
                className="w-full px-4 py-3 border border-border rounded-lg text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-2 mb-1.5">Total budget</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3 text-[14px] font-medium select-none">₦</span>
              <input type="number" value={form.totalBudget} onChange={e => onChange('totalBudget', e.target.value)}
                placeholder="0" min="0"
                className="w-full pl-9 pr-4 py-3 border border-border rounded-lg text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
              />
            </div>
            {Number(form.totalBudget) > 0 && (
              <p className="text-[12px] text-ink-3 mt-1.5">{fmtNaira(Number(form.totalBudget))} total event budget</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Step2({ form, onChange, getCatsForType }: Step2Props) {
  const [customInput, setCustomInput] = useState('')
  const presetCats   = getCatsForType(form.eventType)
  const selectedType = { name: form.eventTypeName }

  function toggle(catId: string) {
    const current = form.selectedCategories
    if (current.includes(catId)) {
      if (current.length === 1) return
      onChange('selectedCategories', current.filter(id => id !== catId))
    } else {
      onChange('selectedCategories', [...current, catId])
    }
  }

  function addCustom() {
    const name = customInput.trim()
    if (!name) return
    const id = `custom_${Date.now()}`
    onChange('customCategories', [...form.customCategories, { id, name, defaultPct: 0 }])
    onChange('selectedCategories', [...form.selectedCategories, id])
    setCustomInput('')
  }

  function removeCustom(id: string) {
    onChange('customCategories', form.customCategories.filter(c => c.id !== id))
    onChange('selectedCategories', form.selectedCategories.filter(i => i !== id))
  }

  return (
    <div>
      <h2 className="font-display font-bold text-[30px] text-ink leading-tight mb-1">What do you need?</h2>
      <p className="text-ink-3 text-[15px] mb-8">
        We've suggested services typical for a {selectedType?.name}. Toggle off anything you don't need, and add what's missing.
      </p>

      <div className="bg-white border border-border rounded-xl p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3 mb-4">Suggested for {selectedType?.name}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {presetCats.map(cat => {
            const isOn = form.selectedCategories.includes(cat.id)
            return (
              <button key={cat.id} onClick={() => toggle(cat.id)} title={cat.description}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[13px] transition-all ${isOn ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'bg-canvas border-border text-ink-2 hover:border-primary/30'}`}
              >
                {isOn && <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>}
                {cat.name}
              </button>
            )
          })}
        </div>

        {form.customCategories.length > 0 && (
          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3 mb-3">Custom</p>
            <div className="flex flex-wrap gap-2">
              {form.customCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-warning/10 border-warning/30 text-ink text-[13px]">
                  {cat.name}
                  <button onClick={() => removeCustom(cat.id)} className="text-ink-3 hover:text-ink ml-0.5 leading-none">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-border">
          <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="Add a custom service (e.g. Fireworks, Tent Hire)"
            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
          />
          <button onClick={addCustom} className="px-4 py-2.5 bg-ink text-white text-[13px] font-medium rounded-lg hover:bg-ink/80 transition-colors">Add</button>
        </div>

        <p className="text-[12px] text-ink-3 mt-3">{form.selectedCategories.length} service{form.selectedCategories.length !== 1 ? 's' : ''} selected</p>
      </div>
    </div>
  )
}

function Step3({ form, onChange, getCatsForType }: Step3Props) {
  const presetCats = getCatsForType(form.eventType)
  const allCats    = useMemo(() => [
    ...presetCats.filter(c => form.selectedCategories.includes(c.id)),
    ...form.customCategories.filter(c => form.selectedCategories.includes(c.id)),
  ], [presetCats, form.selectedCategories, form.customCategories])

  const totalBudget    = Number(form.totalBudget) || 0
  const totalAllocated = useMemo(
    () => form.selectedCategories.reduce((s, id) => s + (Number(form.allocations[id]) || 0), 0),
    [form.allocations, form.selectedCategories]
  )
  const remaining = totalBudget - totalAllocated
  const isOver    = remaining < 0
  const pctFilled = totalBudget > 0 ? Math.min(100, (totalAllocated / totalBudget) * 100) : 0

  function applyMode(mode: string) {
    onChange('allocationMode', mode)
    if (mode === 'even') {
      const per = Math.floor(totalBudget / allCats.length)
      const a: Record<string, number> = {}; allCats.forEach(c => { a[c.id] = per }); onChange('allocations', a)
    } else if (mode === 'smart') {
      const a: Record<string, number> = {}
      allCats.forEach(c => { a[c.id] = Math.floor(totalBudget * ((c.defaultPct ?? (100 / allCats.length)) / 100)) })
      onChange('allocations', a)
    }
  }

  function setAmt(id: string, val: string) { onChange('allocations', { ...form.allocations, [id]: val }) }

  return (
    <div>
      <h2 className="font-display font-bold text-[30px] text-ink leading-tight mb-1">Let's talk budget</h2>
      <p className="text-ink-3 text-[15px] mb-8">Spread your {fmtNaira(totalBudget)} across your selected services.</p>

      <div className="flex gap-1 p-1 bg-canvas border border-border rounded-lg mb-6 w-fit">
        {[{ id: 'smart', label: 'Smart Split' }, { id: 'even', label: 'Even Split' }, { id: 'manual', label: 'Manual' }].map(m => (
          <button key={m.id} onClick={() => applyMode(m.id)}
            className={`px-4 py-2 rounded-md text-[13px] font-medium transition-all ${form.allocationMode === m.id ? 'bg-white border border-border text-ink shadow-sm' : 'text-ink-3 hover:text-ink'}`}
          >{m.label}</button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-ink-2 font-medium">Allocated</span>
          <span className={`text-[13px] font-semibold tabular-nums ${isOver ? 'text-red-500' : 'text-ink'}`}>{fmtNaira(totalAllocated)} / {fmtNaira(totalBudget)}</span>
        </div>
        <div className="h-2 bg-canvas border border-border rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${isOver ? 'bg-red-400' : 'bg-primary'}`} style={{ width: `${pctFilled}%` }} />
        </div>
        {isOver ? (
          <p className="text-red-500 text-[12px] mt-1.5">You're {fmtNaira(Math.abs(remaining))} over budget.</p>
        ) : remaining > 0 ? (
          <p className="text-ink-3 text-[12px] mt-1.5">{fmtNaira(remaining)} remaining</p>
        ) : (
          <p className="text-primary text-[12px] mt-1.5">Budget fully allocated.</p>
        )}
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {allCats.map((cat, i) => {
          const amt = Number(form.allocations[cat.id]) || 0
          const pct = totalBudget > 0 ? ((amt / totalBudget) * 100).toFixed(1) : '0.0'
          return (
            <div key={cat.id} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-border' : ''}`}>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-ink">{cat.name}</p>
                <p className="text-[11px] text-ink-3 mt-0.5">{pct}%</p>
              </div>
              <div className="relative w-44">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 text-[13px] select-none">₦</span>
                <input type="number" value={form.allocations[cat.id] ?? ''} onChange={e => setAmt(cat.id, e.target.value)}
                  placeholder="0" min="0"
                  className="w-full pl-7 pr-3 py-2.5 border border-border rounded-lg text-[13px] text-ink text-right focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Step4({ form, getCatsForType, onPublish, onSave, saving }: Step4Props) {
  const presetCats   = getCatsForType(form.eventType)
  const allCats      = [
    ...presetCats.filter(c => form.selectedCategories.includes(c.id)),
    ...form.customCategories.filter(c => form.selectedCategories.includes(c.id)),
  ]
  const meta        = (form.eventType && form.eventType in EVENT_META)
    ? EVENT_META[form.eventType as keyof typeof EVENT_META]
    : { emoji: '🎉', bg: '#F5F5F5', color: '#A3A3A3' }
  const totalBudget = Number(form.totalBudget) || 0
  const totalAlloc  = allCats.reduce((s, c) => s + (Number(form.allocations[c.id]) || 0), 0)
  const location    = [form.city, form.state].filter(Boolean).join(', ')
  const dateLabel   = form.dateFlexible ? 'Date not fixed yet' : (form.date || 'No date set')
  const sorted      = [...allCats].sort((a, b) => (Number(form.allocations[b.id]) || 0) - (Number(form.allocations[a.id]) || 0))

  return (
    <div>
      <h2 className="font-display font-bold text-[30px] text-ink leading-tight mb-1">Here's your plan</h2>
      <p className="text-ink-3 text-[15px] mb-8">Everything in one place. Ready to find vendors?</p>

      <div className="bg-white border border-border rounded-xl p-6 mb-4">
        <div className="flex items-start gap-4">
          <EventTile type={form.eventType || ''} bg={meta.bg} color={meta.color} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-0.5">{form.eventTypeName}</p>
            <h3 className="font-display font-bold text-[20px] text-ink leading-tight">{form.name || 'Unnamed Event'}</h3>
            <p className="text-ink-3 text-[13px] mt-1">{dateLabel} · {location || 'Location not set'}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] text-ink-3 mb-0.5">Total budget</p>
            <p className="font-display font-bold text-[22px] text-ink">{fmtNaira(totalBudget)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-4">Budget breakdown</p>
        <div className="space-y-3.5">
          {sorted.map(cat => {
            const amt = Number(form.allocations[cat.id]) || 0
            const pct = totalBudget > 0 ? (amt / totalBudget) * 100 : 0
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between text-[13px] mb-1">
                  <span className="text-ink-2">{cat.name}</span>
                  <span className="font-medium text-ink tabular-nums">{fmtNaira(amt)}</span>
                </div>
                <div className="h-1.5 bg-canvas rounded-full border border-border overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          {totalAlloc < totalBudget && (
            <div className="flex justify-between text-[13px] pt-3 border-t border-border">
              <span className="text-ink-3">Unallocated</span>
              <span className="text-ink-3 tabular-nums">{fmtNaira(totalBudget - totalAlloc)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onSave} disabled={!!saving}
          className="flex-1 py-3.5 border border-border text-ink-2 text-[14px] font-medium rounded-xl hover:bg-canvas transition-colors disabled:opacity-50">
          {saving === 'draft' ? 'Saving…' : 'Save for Later'}
        </button>
        <button onClick={onPublish} disabled={!!saving}
          className="flex-[2] px-8 py-3.5 bg-primary text-dark text-[14px] font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
          {saving === 'open' ? 'Publishing…' : 'Find Me Vendors →'}
        </button>
      </div>
    </div>
  )
}

export default function CreatePlanPage() {
  const router = useRouter()
  const [eventTypes, setEventTypes] = useState<EventTypeInfo[]>([])
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState<'open' | 'draft' | null>(null)
  const [form, setForm] = useState<FormState>({
    eventType: null, eventTypeName: '', name: '', date: '', dateFlexible: false,
    state: '', city: '', totalBudget: '',
    selectedCategories: [], customCategories: [],
    allocations: {}, allocationMode: 'smart',
  })

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.ok ? r.json() : { eventTypes: [] })
      .then(data => setEventTypes(data.eventTypes ?? []))
  }, [])

  function getCatsForType(typeId: string | null): EventCategory[] {
    return eventTypes.find(e => e.id === typeId)?.categories ?? []
  }

  function update(key: keyof FormState, value: any) {
    if (key === 'eventType') {
      const et = eventTypes.find(e => e.id === value)
      const cats = et?.categories ?? []
      setForm(f => ({
        ...f, eventType: value, eventTypeName: et?.name ?? '',
        selectedCategories: cats.map(c => c.id),
        customCategories: [], allocations: {}, allocationMode: 'smart',
      }))
      return
    }
    setForm(f => ({ ...f, [key]: value }))
  }

  function applySmartSplit(f: FormState) {
    const presetCats = getCatsForType(f.eventType)
    const allCats: Array<{ id: string; name: string; defaultPct?: number }> = [
      ...presetCats.filter(c => f.selectedCategories.includes(c.id)),
      ...f.customCategories.filter(c => f.selectedCategories.includes(c.id)),
    ]
    const total = Number(f.totalBudget) || 0
    const a: Record<string, number> = {}
    allCats.forEach(c => { a[c.id] = Math.floor(total * ((c.defaultPct ?? (100 / allCats.length)) / 100)) })
    return a
  }

  function canProceed() {
    if (step === 1) return !!form.eventType && !!form.name.trim() && (!!form.date || form.dateFlexible) && !!form.state && !!form.totalBudget
    if (step === 2) return form.selectedCategories.length > 0
    if (step === 3) {
      const alloc = form.selectedCategories.reduce((s, id) => s + (Number(form.allocations[id]) || 0), 0)
      return alloc <= Number(form.totalBudget)
    }
    return true
  }

  function goNext() {
    if (step === 2) {
      const newAllocs = applySmartSplit(form)
      setForm(f => ({ ...f, allocations: newAllocs, allocationMode: 'smart' }))
    }
    setStep(s => s + 1)
  }

  async function submit(status: 'open' | 'draft') {
    setSaving(status)
    const presetCats = getCatsForType(form.eventType)
    const allCats: Array<{ id: string; name: string; defaultPct?: number }> = [
      ...presetCats.filter(c => form.selectedCategories.includes(c.id)),
      ...form.customCategories.filter(c => form.selectedCategories.includes(c.id)),
    ]
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          eventTypeId: form.eventType,
          date: form.dateFlexible ? null : form.date,
          dateFlexible: form.dateFlexible,
          state: form.state,
          city: form.city,
          totalBudget: form.totalBudget,
          status,
          categories: allCats.map(c => ({
            id: c.id,
            name: c.name,
            allocation: Number(form.allocations[c.id]) || 0,
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed to create plan')
      router.push(status === 'open' ? '/organiser/plans?published=true' : '/organiser/plans')
    } catch {
      setSaving(null)
    }
  }

  return (
    <div className="max-w-[680px] mx-auto">
      <WizardProgress step={step} total={4} onBack={() => setStep(s => s - 1)} />

      {step === 1 && <Step1 form={form} onChange={update} eventTypes={eventTypes} />}
      {step === 2 && <Step2 form={form} onChange={update} getCatsForType={getCatsForType} />}
      {step === 3 && <Step3 form={form} onChange={update} getCatsForType={getCatsForType} />}
      {step === 4 && (
        <Step4
          form={form}
          getCatsForType={getCatsForType}
          onPublish={() => submit('open')}
          onSave={() => submit('draft')}
          saving={saving}
        />
      )}

      {step < 4 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className="px-8 py-3.5 bg-primary text-dark text-[14px] font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  )
}
