'use client'
import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EventTile, MoneyInput, DateTimeRangePicker, SearchableSelect } from '@/features/shared-ui'
import { X, ArrowRight, Sparkles } from 'lucide-react'
import { EVENT_META } from '../../data/mockCategories'
import { fmtNaira, fmtDateRange, fmtGuests } from '@/shared/utils/format'
import { budgetColor } from '@/shared/utils/palette'

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
  startDate: string
  endDate: string
  dateFlexible: boolean
  state: string
  city: string
  guestCount: string
  totalBudget: string
  selectedCategories: string[]
  customCategories: Array<{ id: string; name: string; defaultPct?: number }>
  allocations: Record<string, string | number>
  // Optional per-category brief (keyed by category id) telling vendors what's wanted.
  briefs: Record<string, string>
  allocationMode: string
}

const EMPTY_FORM: FormState = {
  eventType: null, eventTypeName: '', name: '', startDate: '', endDate: '', dateFlexible: false,
  state: '', city: '', guestCount: '', totalBudget: '',
  selectedCategories: [], customCategories: [],
  allocations: {}, briefs: {}, allocationMode: 'smart',
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
  onBack: () => void
  saving: string | null
  isEdit: boolean
}

// localStorage key for an in-progress (unsaved) plan draft.
const DRAFT_KEY = 'confetti_plan_draft'

// Step-aware CTA copy in Confette's voice: a friend helping you throw a party,
// not a form asking for the next field.
const CONTINUE_LABELS: Record<number, string> = {
  1: 'Now, the fun part',
  2: "Let's talk money",
  3: 'See it all come together',
}

const NIGERIAN_STATES = [
  'Abia','Abuja (FCT)','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue',
  'Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
]

// ISO timestamp → "YYYY-MM-DDTHH:mm" in local time, for prefilling the picker.
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

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
      <h2 className="font-display font-bold text-[22px] sm:text-[30px] text-ink leading-tight mb-1">What's the occasion?</h2>
      <p className="text-ink-3 text-[15px] mb-8">Tell us about your event. Just the basics.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {eventTypes.map(type => {
          const meta = (type.id && type.id in EVENT_META)
            ? EVENT_META[type.id as keyof typeof EVENT_META]
            : { emoji: '🎉', icon: 'PartyPopper', color: '#A3A3A3', bg: '#F5F5F5', tagline: '' }
          const isSelected = form.eventType === type.id
          return (
            <button key={type.id} onClick={() => onChange('eventType', type.id)}
              className={`group p-4 rounded-xl border text-left transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]' : 'border-border bg-white hover:border-primary/40 hover:shadow-sm'}`}
            >
              <EventTile type={type.id} bg={meta.bg} color={meta.color} size="md"
                className="mb-3 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6" />
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium text-ink-2">When is it?</label>
              <label className="flex items-center gap-2 text-[12px] text-ink-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.dateFlexible}
                  onChange={e => {
                    onChange('dateFlexible', e.target.checked)
                    if (e.target.checked) { onChange('startDate', ''); onChange('endDate', '') }
                  }}
                  className="w-3.5 h-3.5 rounded accent-primary" />
                Set date later
              </label>
            </div>
            {form.dateFlexible ? (
              <div className="rounded-lg border border-dashed border-border bg-canvas px-4 py-3 text-[13px] text-ink-3">
                You can set the exact date and time later, before publishing.
              </div>
            ) : (
              <DateTimeRangePicker
                startValue={form.startDate}
                endValue={form.endDate}
                onChange={({ start, end }) => { onChange('startDate', start); onChange('endDate', end) }}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-ink-2 mb-1.5">State</label>
              <SearchableSelect
                value={form.state}
                onChange={v => onChange('state', v)}
                options={NIGERIAN_STATES}
                placeholder="Select state"
                searchPlaceholder="Search states…"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-2 mb-1.5">City</label>
              <input type="text" value={form.city} onChange={e => onChange('city', e.target.value)} placeholder="e.g. Ikeja"
                className="w-full px-4 py-3 border border-border rounded-lg text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-2 mb-1.5">How many guests?</label>
            <input
              type="text" inputMode="numeric" value={form.guestCount}
              onChange={e => onChange('guestCount', e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, ''))}
              placeholder="e.g. 150"
              className="w-full px-4 py-3 border border-border rounded-lg text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
            />
            <p className="text-[12px] text-ink-3 mt-1.5">
              {Number(form.guestCount) > 0
                ? `Planning for ${fmtGuests(Number(form.guestCount))}. You can refine this later.`
                : 'Vendors price catering, drinks, and rentals by headcount. A rough number is fine.'}
            </p>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-2 mb-1.5">Total budget</label>
            <MoneyInput value={form.totalBudget} onChange={v => onChange('totalBudget', v)} alignRight={false} />
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
      <h2 className="font-display font-bold text-[22px] sm:text-[30px] text-ink leading-tight mb-1">What do you need?</h2>
      <p className="text-ink-3 text-[15px] mb-8">
        We've suggested services typical for a {selectedType?.name}. Remove anything you don't need with the X, and add what's missing.
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
                {cat.name}
                {isOn
                  ? <X size={13} className="opacity-70" />
                  : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>}
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
                  <button onClick={() => removeCustom(cat.id)} className="text-ink-3 hover:text-ink ml-0.5 leading-none"><X size={13} /></button>
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
          <button onClick={addCustom} className="px-4 py-2.5 bg-primary text-dark text-[13px] font-medium rounded-lg hover:bg-primary/90 transition-colors">Add</button>
        </div>

        <p className="text-[12px] text-ink-3 mt-3">{form.selectedCategories.length} service{form.selectedCategories.length !== 1 ? 's' : ''} selected</p>
      </div>
    </div>
  )
}

function Step3({ form, onChange, getCatsForType }: Step3Props) {
  const [openBrief, setOpenBrief] = useState<Record<string, boolean>>({})
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
  function setBrief(id: string, val: string) { onChange('briefs', { ...form.briefs, [id]: val }) }

  return (
    <div>
      <h2 className="font-display font-bold text-[22px] sm:text-[30px] text-ink leading-tight mb-1">Let's talk budget</h2>
      <p className="text-ink-3 text-[15px] mb-8">Spread your {fmtNaira(totalBudget)} across your selected services. Smart Split is a starting point. Tweak any figure you like, and add a quick brief so vendors know exactly what you want.</p>

      <div className="flex gap-1 p-1 bg-canvas border border-border rounded-lg mb-6 w-fit">
        {[{ id: 'smart', label: 'Smart Split' }, { id: 'even', label: 'Even Split' }].map(m => (
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
          const briefOpen = openBrief[cat.id] || !!form.briefs[cat.id]
          return (
            <div key={cat.id} className={`px-5 py-4 ${i > 0 ? 'border-t border-border' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-ink">{cat.name}</p>
                  <p className="text-[11px] text-ink-3 mt-0.5">{pct}%</p>
                </div>
                <div className="w-44">
                  <MoneyInput value={form.allocations[cat.id] ?? ''} onChange={v => setAmt(cat.id, v)} />
                </div>
              </div>
              {briefOpen ? (
                <textarea
                  value={form.briefs[cat.id] ?? ''}
                  onChange={e => setBrief(cat.id, e.target.value)}
                  autoFocus={!!openBrief[cat.id] && !form.briefs[cat.id]}
                  placeholder={`What do you want for ${cat.name.toLowerCase()}? Menu, style, hours, deliverables…`}
                  rows={2}
                  className="mt-3 w-full px-3 py-2 border border-border rounded-lg text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors resize-none"
                />
              ) : (
                <button
                  onClick={() => setOpenBrief(s => ({ ...s, [cat.id]: true }))}
                  className="mt-2 inline-flex items-center gap-1 text-[12px] text-ink-3 hover:text-primary transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  Add a brief for vendors
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Step4({ form, getCatsForType, onPublish, onSave, onBack, saving, isEdit }: Step4Props) {
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
  const guestLabel  = fmtGuests(Number(form.guestCount))
  const dateLabel   = fmtDateRange(form.startDate || null, form.endDate || null, form.dateFlexible)
  const sorted      = [...allCats].sort((a, b) => (Number(form.allocations[b.id]) || 0) - (Number(form.allocations[a.id]) || 0))

  return (
    <div>
      <h2 className="font-display font-bold text-[22px] sm:text-[30px] text-ink leading-tight mb-1">Here's your event</h2>
      <p className="text-ink-3 text-[15px] mb-8">Everything in one place. Ready to find vendors?</p>

      <div className="bg-white border border-border rounded-xl p-6 mb-4">
        <div className="flex items-start gap-4">
          <EventTile type={form.eventType || ''} bg={meta.bg} color={meta.color} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3 mb-0.5">{form.eventTypeName}</p>
            <h3 className="font-display font-bold text-[20px] text-ink leading-tight">{form.name || 'Unnamed Event'}</h3>
            <p className="text-ink-3 text-[13px] mt-1">{dateLabel} · {location || 'Location not set'}{guestLabel ? ` · ${guestLabel}` : ''}</p>
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
          {sorted.map((cat, i) => {
            const amt = Number(form.allocations[cat.id]) || 0
            const pct = totalBudget > 0 ? (amt / totalBudget) * 100 : 0
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between text-[13px] mb-1">
                  <span className="text-ink-2">{cat.name}</span>
                  <span className="font-medium text-ink tabular-nums">{fmtNaira(amt)}</span>
                </div>
                <div className="h-1.5 bg-canvas rounded-full border border-border overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: budgetColor(i) }} />
                </div>
                {form.briefs[cat.id]?.trim() && (
                  <p className="text-[12px] text-ink-3 mt-1.5 leading-relaxed">{form.briefs[cat.id]}</p>
                )}
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

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button onClick={onBack} disabled={!!saving}
          className="py-3.5 px-5 border border-border text-ink-2 text-[14px] font-medium rounded-xl hover:bg-canvas transition-colors disabled:opacity-50">
          ← Back
        </button>
        <button onClick={onSave} disabled={!!saving}
          className="sm:flex-1 py-3.5 border border-border text-ink-2 text-[14px] font-medium rounded-xl hover:bg-canvas transition-colors disabled:opacity-50">
          {saving === 'draft' ? 'Saving…' : 'Save as draft'}
        </button>
        <button onClick={onPublish} disabled={!!saving}
          className="group sm:flex-[2] inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-dark text-[14px] font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
          <Sparkles size={17} className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
          {saving === 'open' ? 'Publishing…' : isEdit ? 'Save & Publish' : 'Let the Bids Roll In'}
        </button>
      </div>
    </div>
  )
}

export default function CreatePlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const isEdit = !!editId

  const [eventTypes, setEventTypes] = useState<EventTypeInfo[]>([])
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState<'open' | 'draft' | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Synchronous guard against a same-tick double-click submitting twice (which
  // would create the plan / fire vendor notifications twice).
  const submittingRef = useRef(false)
  const [loadingPlan, setLoadingPlan] = useState(isEdit)
  const [hydrated, setHydrated] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  // Restore an in-progress draft on refresh (new plans only; edit loads from the server).
  useEffect(() => {
    if (isEdit) { setHydrated(true); return }
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const d = JSON.parse(saved)
        // Merge over EMPTY_FORM so drafts saved before guestCount/briefs existed
        // still hydrate cleanly.
        if (d.form) setForm({ ...EMPTY_FORM, ...d.form, briefs: d.form.briefs ?? {} })
        if (d.step) setStep(d.step)
      }
    } catch { /* ignore corrupt draft */ }
    setHydrated(true)
  }, [isEdit])

  // Persist progress as the organiser works (after hydration, so we don't clobber the draft).
  useEffect(() => {
    if (isEdit || !hydrated) return
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step })) } catch { /* quota */ }
  }, [form, step, hydrated, isEdit])

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.ok ? r.json() : { eventTypes: [] })
      .then(data => setEventTypes(data.eventTypes ?? []))
  }, [])

  // Edit mode: load the existing plan once event types are available, so we can
  // tell preset categories apart from custom ones.
  useEffect(() => {
    if (!isEdit || eventTypes.length === 0) return
    fetch(`/api/plans/${editId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const plan = data?.plan
        if (!plan) { setLoadingPlan(false); return }
        const presetIds = new Set((eventTypes.find(e => e.id === plan.eventTypeId)?.categories ?? []).map((c: EventCategory) => c.id))
        const custom = (plan.categories ?? [])
          .filter((c: any) => !presetIds.has(c.categoryId))
          .map((c: any) => ({ id: c.categoryId, name: c.name, defaultPct: 0 }))
        const allocations: Record<string, number> = {}
        const briefs: Record<string, string> = {}
        ;(plan.categories ?? []).forEach((c: any) => {
          allocations[c.categoryId] = c.allocation
          if (c.brief) briefs[c.categoryId] = c.brief
        })
        setForm({
          eventType: plan.eventTypeId,
          eventTypeName: plan.eventType?.name ?? '',
          name: plan.name ?? '',
          startDate: toLocalInput(plan.startDate),
          endDate: toLocalInput(plan.endDate),
          dateFlexible: !!plan.dateFlexible,
          state: plan.state ?? '',
          city: plan.city ?? '',
          guestCount: plan.guestCount != null ? String(plan.guestCount) : '',
          totalBudget: String(plan.totalBudget ?? ''),
          selectedCategories: (plan.categories ?? []).map((c: any) => c.categoryId),
          customCategories: custom,
          allocations,
          briefs,
          allocationMode: 'manual',
        })
        setLoadingPlan(false)
      })
      .catch(() => setLoadingPlan(false))
  }, [isEdit, editId, eventTypes])

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
        customCategories: [], allocations: {}, briefs: {}, allocationMode: 'smart',
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
    if (step === 1) {
      const dateOk = form.dateFlexible || (!!form.startDate && !!form.endDate)
      return !!form.eventType && !!form.name.trim() && dateOk && !!form.state && !!form.totalBudget
    }
    if (step === 2) return form.selectedCategories.length > 0
    if (step === 3) {
      const alloc = form.selectedCategories.reduce((s, id) => s + (Number(form.allocations[id]) || 0), 0)
      return alloc <= Number(form.totalBudget)
    }
    return true
  }

  function goNext() {
    if (step === 2 && !isEdit) {
      const newAllocs = applySmartSplit(form)
      setForm(f => ({ ...f, allocations: newAllocs, allocationMode: 'smart' }))
    }
    setStep(s => s + 1)
  }

  async function submit(status: 'open' | 'draft') {
    if (submittingRef.current) return
    submittingRef.current = true
    setSaving(status)
    setError(null)
    const presetCats = getCatsForType(form.eventType)
    const allCats: Array<{ id: string; name: string; defaultPct?: number }> = [
      ...presetCats.filter(c => form.selectedCategories.includes(c.id)),
      ...form.customCategories.filter(c => form.selectedCategories.includes(c.id)),
    ]
    const payload = {
      name: form.name,
      eventTypeId: form.eventType,
      startDate: form.dateFlexible ? null : form.startDate,
      endDate: form.dateFlexible ? null : form.endDate,
      dateFlexible: form.dateFlexible,
      state: form.state,
      city: form.city,
      guestCount: form.guestCount ? Number(form.guestCount) : null,
      totalBudget: form.totalBudget,
      status,
      categories: allCats.map(c => ({
        id: c.id,
        name: c.name,
        allocation: Number(form.allocations[c.id]) || 0,
        brief: form.briefs[c.id]?.trim() || undefined,
      })),
    }
    try {
      const res = await fetch(isEdit ? `/api/plans/${editId}` : '/api/plans', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? 'Could not save the event. Please check the details and try again.')
        submittingRef.current = false
        setSaving(null)
        return
      }
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
      if (isEdit) {
        router.push(`/organiser/plans/${editId}${status === 'open' ? '?published=true' : ''}`)
      } else {
        router.push(status === 'open' ? '/organiser/plans?published=true' : '/organiser/plans')
      }
    } catch {
      submittingRef.current = false
      setSaving(null)
    }
  }

  if (loadingPlan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-[680px] mx-auto">
      <WizardProgress step={step} total={4} onBack={() => setStep(s => s - 1)} />

      {isEdit && (
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/[0.04] px-4 py-2.5 text-[13px] text-ink-2">
          You're editing an existing plan. Vendors who already bid will be notified of your changes.
        </div>
      )}

      {step === 1 && <Step1 form={form} onChange={update} eventTypes={eventTypes} />}
      {step === 2 && <Step2 form={form} onChange={update} getCatsForType={getCatsForType} />}
      {step === 3 && <Step3 form={form} onChange={update} getCatsForType={getCatsForType} />}
      {step === 4 && (
        <Step4
          form={form}
          getCatsForType={getCatsForType}
          onPublish={() => submit('open')}
          onSave={() => submit('draft')}
          onBack={() => setStep(s => s - 1)}
          saving={saving}
          isEdit={isEdit}
        />
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</p>
      )}

      {step < 4 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-dark text-[14px] font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {CONTINUE_LABELS[step] ?? 'Continue'}
            <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  )
}
