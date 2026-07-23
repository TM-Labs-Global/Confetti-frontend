'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BadgeCheck, Clock, AlertCircle, Check, Pencil, Phone, MapPin,
  Upload, Trash2, Loader2, Landmark,
} from 'lucide-react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { SearchableSelect, ConfettiBurst } from '@/features/shared-ui'
import { NIGERIAN_STATES, NIGERIAN_BANKS } from '@/shared/constants/nigeria'
import { VendorProfile, PortfolioItem, parseSpecialties, parsePortfolio } from '@/features/vendor/types/vendor.types'

interface FormState {
  businessName: string
  bio: string
  state: string
  city: string
  address: string
  specialties: string[]
  portfolio: PortfolioItem[]
  phone: string
  bankName: string
  bankAccountNumber: string
  bankAccountName: string
}

const EMPTY: FormState = {
  businessName: '', bio: '', state: '', city: '', address: '', specialties: [], portfolio: [],
  phone: '', bankName: '', bankAccountNumber: '', bankAccountName: '',
}

// Keep only digits (and a leading +) in a typed phone number.
const normalizePhone = (p: string) => p.replace(/[^\d+]/g, '')

function validate(f: FormState): Partial<Record<keyof FormState, string>> {
  const e: Partial<Record<keyof FormState, string>> = {}
  if (f.phone && normalizePhone(f.phone).replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number'
  // An account number is optional, but if given it must be a full 10-digit NUBAN.
  if (f.bankAccountNumber && f.bankAccountNumber.length !== 10) e.bankAccountNumber = 'Account number must be 10 digits'
  return e
}

export default function VendorProfilePage() {
  const { user, refresh } = useAuth()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [status, setStatus] = useState<VendorProfile['status'] | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const [categoryNames, setCategoryNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [celebrate, setCelebrate] = useState(0)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/vendors/me').then(r => (r.ok ? r.json() : { profile: null })),
      fetch('/api/categories').then(r => (r.ok ? r.json() : { eventTypes: [] })),
    ]).then(([profileData, catData]) => {
      const p: VendorProfile | null = profileData.profile
      if (p) {
        setForm({
          businessName: p.businessName ?? '',
          bio: p.bio ?? '',
          state: p.state ?? '',
          city: p.city ?? '',
          address: p.address ?? '',
          specialties: parseSpecialties(p.specialties),
          portfolio: parsePortfolio(p.portfolio),
          phone: p.phone ?? '',
          bankName: p.bankName ?? '',
          bankAccountNumber: p.bankAccountNumber ?? '',
          bankAccountName: p.bankAccountName ?? '',
        })
        setStatus(p.status)
        setRejectionReason(p.rejectionReason ?? null)
        setEditing(false)
      } else {
        setEditing(true) // first-time onboarding goes straight to the form
      }
      const names = new Set<string>()
      ;(catData.eventTypes ?? []).forEach((et: any) =>
        (et.categories ?? []).forEach((c: any) => names.add(c.name)),
      )
      setCategoryNames([...names].sort())
    }).finally(() => setLoading(false))
  }, [])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function toggleSpecialty(name: string) {
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(name)
        ? f.specialties.filter(s => s !== name)
        : [...f.specialties, name],
    }))
  }

  const complete = useMemo(
    () => !!form.businessName.trim() && !!form.bio.trim() && !!form.state && !!form.city.trim() &&
      form.specialties.length > 0 && form.portfolio.length > 0,
    [form],
  )

  async function save() {
    if (!complete) return
    // Normalise + validate before sending.
    const cleaned: FormState = {
      ...form,
      address: form.address.trim(),
      phone: normalizePhone(form.phone),
      bankAccountName: form.bankAccountName.trim(),
    }
    const errs = validate(cleaned)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setForm(cleaned)

    setSaving(true)
    try {
      const res = await fetch('/api/vendors/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleaned),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus(data.profile.status)
        setRejectionReason(data.profile.rejectionReason ?? null)
        setEditing(false)
        setCelebrate(c => c + 1)
        // Refresh the auth user so the dashboard / gate reflect the new profile
        // status (e.g. "under review") instead of "set up profile".
        await refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-warning border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-[680px] mx-auto">
      {celebrate > 0 && <ConfettiBurst variant="center" fireKey={celebrate} />}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[28px] text-ink leading-tight">Your business profile</h1>
          <p className="text-ink-3 text-[14px] mt-1">Organisers see this when you bid. Get verified before you can send bids.</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 shrink-0 px-4 py-2.5 border border-border text-ink-2 text-[13px] font-medium rounded-lg hover:bg-canvas transition-colors">
            <Pencil size={14} /> Edit
          </button>
        )}
      </div>

      <StatusBanner status={status} rejectionReason={rejectionReason} />

      {editing ? (
        <EditForm
          form={form} set={set} toggleSpecialty={toggleSpecialty} categoryNames={categoryNames}
          errors={errors} complete={complete} saving={saving} status={status} onSave={save}
        />
      ) : (
        <ProfileView form={form} />
      )}
    </div>
  )
}

/* ----------------------------------------------------------------- banner */
function StatusBanner({ status, rejectionReason }: { status: VendorProfile['status'] | null; rejectionReason: string | null }) {
  if (status === 'verified') return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-5 py-3.5">
      <BadgeCheck size={20} className="text-success shrink-0" />
      <div>
        <p className="font-medium text-ink text-[14px]">You're verified</p>
        <p className="text-ink-3 text-[12px]">You can bid on events. Edits stay live without re-verification.</p>
      </div>
    </div>
  )
  if (status === 'pending') return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-5 py-3.5">
      <Clock size={20} className="text-[#92660A] shrink-0" />
      <div>
        <p className="font-medium text-ink text-[14px]">Under review</p>
        <p className="text-ink-3 text-[12px]">An admin is reviewing your profile. You'll be notified once you're verified.</p>
      </div>
    </div>
  )
  if (status === 'suspended') return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-5 py-3.5">
      <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-red-700 text-[14px]">Account suspended</p>
        <p className="text-red-700 text-[13px] mt-0.5">
          {rejectionReason
            ? <>Reason: {rejectionReason}</>
            : 'Your account has been suspended by an admin.'}
        </p>
        <p className="text-red-600/90 text-[12px] mt-1">You can&apos;t bid on events until it&apos;s reinstated.</p>
      </div>
    </div>
  )
  if (status === 'rejected') return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-5 py-3.5">
      <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-red-700 text-[14px]">Changes needed</p>
        <p className="text-red-700 text-[13px] mt-0.5">{rejectionReason || 'Please review and resubmit your profile.'}</p>
      </div>
    </div>
  )
  return null
}

/* ------------------------------------------------------------- view mode */
function ProfileView({ form }: { form: FormState }) {
  const hasBank = !!(form.bankAccountNumber && form.bankName)

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="font-display font-bold text-[20px] text-ink">{form.businessName}</h2>
      {(form.city || form.state) && (
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-2"><MapPin size={14} className="text-ink-3" /> {[form.city, form.state].filter(Boolean).join(', ')}</p>
      )}
      {form.bio && <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{form.bio}</p>}

      {form.portfolio.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3 mb-2">Your work</p>
          <MediaGrid items={form.portfolio} />
        </div>
      )}

      {form.specialties.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3 mb-2">Services</p>
          <div className="flex flex-wrap gap-1.5">
            {form.specialties.map(s => (
              <span key={s} className="rounded-lg border border-border bg-canvas px-2.5 py-1 text-[12px] text-ink-2">{s}</span>
            ))}
          </div>
        </div>
      )}

      {form.phone && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3 mb-2">Contact</p>
          <p className="flex items-center gap-2 text-[13px] text-ink-2"><Phone size={14} className="text-ink-3" /> {form.phone} <span className="text-[11px] text-ink-3">(shared with an organiser only after they accept your bid)</span></p>
        </div>
      )}

      {(form.address || hasBank) && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3 mb-2">Private details</p>
          <p className="text-[11px] text-ink-3 mb-2">Only shared with an organiser after they accept your bid.</p>
          {form.address && (
            <p className="flex items-start gap-2 text-[13px] text-ink-2"><MapPin size={14} className="text-ink-3 mt-0.5 shrink-0" /> {form.address}</p>
          )}
          {hasBank && (
            <p className="mt-1.5 flex items-center gap-2 text-[13px] text-ink-2">
              <Landmark size={14} className="text-ink-3 shrink-0" />
              {[form.bankAccountName, form.bankName, `****${form.bankAccountNumber.slice(-4)}`].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- media grid */
function MediaGrid({ items, onRemove }: { items: PortfolioItem[]; onRemove?: (i: number) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {items.map((m, i) => (
        <div key={`${m.url}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-canvas">
          {m.type === 'video'
            ? <video src={m.url} className="h-full w-full object-cover" muted playsInline controls={!onRemove} />
            : <img src={m.url} alt="Portfolio work" className="h-full w-full object-cover" loading="lazy" />}
          {onRemove && (
            <button type="button" onClick={() => onRemove(i)}
              className="absolute right-1 top-1 rounded-md bg-ink/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------- portfolio uploader */
function PortfolioUploader({ items, onChange }: { items: PortfolioItem[]; onChange: (items: PortfolioItem[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const MAX = 12

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)
    try {
      // One signature covers this whole batch (same folder + timestamp window).
      const sigRes = await fetch('/api/vendors/me/media-signature', { method: 'POST' })
      const sig = await sigRes.json()
      if (!sigRes.ok) { setError(sig.error ?? 'Uploads are not available right now.'); return }

      const room = MAX - items.length
      const chosen = Array.from(files).slice(0, Math.max(0, room))
      const uploaded: PortfolioItem[] = []
      for (const file of chosen) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('api_key', sig.apiKey)
        fd.append('timestamp', String(sig.timestamp))
        fd.append('folder', sig.folder)
        fd.append('signature', sig.signature)
        const up = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, { method: 'POST', body: fd })
        const data = await up.json()
        if (!up.ok) { setError(data?.error?.message ?? 'One of the files failed to upload.'); continue }
        uploaded.push({
          url: data.secure_url,
          type: data.resource_type === 'video' ? 'video' : 'image',
          publicId: data.public_id,
        })
      }
      if (uploaded.length) onChange([...items, ...uploaded].slice(0, MAX))
    } catch {
      setError('Something went wrong uploading. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      {items.length > 0 && <div className="mb-3"><MediaGrid items={items} onRemove={i => onChange(items.filter((_, idx) => idx !== i))} /></div>}
      <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden"
        onChange={e => handleFiles(e.target.files)} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading || items.length >= MAX}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-canvas py-4 text-[13px] font-medium text-ink-2 transition-colors hover:border-warning/50 hover:text-ink disabled:opacity-50">
        {uploading ? <><Loader2 size={15} className="animate-spin" /> Uploading…</> : <><Upload size={15} /> {items.length ? 'Add more photos or videos' : 'Add photos or videos of your work'}</>}
      </button>
      <p className="mt-1.5 text-[11px] text-ink-3">{items.length}/{MAX} added. Images and short videos, shown to organisers.</p>
      {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

/* ---------------------------------------------------------------- bank fields */
function BankFields({ form, set, error }: {
  form: FormState
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  error?: string
}) {
  return (
    <div className="border-t border-border pt-5">
      <p className="text-[13px] font-medium text-ink-2 mb-1 flex items-center gap-1.5"><Landmark size={14} /> Payout bank account</p>
      <p className="text-[12px] text-ink-3 mb-3">Where you&apos;ll get paid. Optional for now, and shared with an organiser only after they accept your bid.</p>
      <div className="space-y-3">
        <SearchableSelect value={form.bankName} onChange={v => set('bankName', v)} options={NIGERIAN_BANKS}
          placeholder="Select your bank" searchPlaceholder="Search or type your bank…" allowCustom />
        <input type="text" inputMode="numeric" value={form.bankAccountNumber} maxLength={10}
          onChange={e => set('bankAccountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit account number" className={`${inputCls} ${error ? 'border-red-400' : ''}`} />
        {error && <p className="text-[11px] text-red-500 -mt-1">{error}</p>}
        <input type="text" value={form.bankAccountName} onChange={e => set('bankAccountName', e.target.value)}
          placeholder="Account name (as it appears at your bank)" className={inputCls} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- edit mode */
interface EditProps {
  form: FormState
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  toggleSpecialty: (n: string) => void
  categoryNames: string[]
  errors: Partial<Record<keyof FormState, string>>
  complete: boolean
  saving: boolean
  status: VendorProfile['status'] | null
  onSave: () => void
}

function EditForm({ form, set, toggleSpecialty, categoryNames, errors, complete, saving, status, onSave }: EditProps) {
  return (
    <>
      <div className="bg-white border border-border rounded-xl p-6 space-y-5">
        <Field label="Business name" required>
          <input type="text" value={form.businessName} onChange={e => set('businessName', e.target.value)}
            placeholder="e.g. Bello Events & Catering" className={inputCls} />
        </Field>

        <Field label="About your business" required hint="A line or two on what you do and what makes you great.">
          <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
            placeholder="Full-service catering with 8 years across Lagos…" className={`${inputCls} resize-none`} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="State" required>
            <SearchableSelect value={form.state} onChange={v => set('state', v)} options={NIGERIAN_STATES}
              placeholder="Select state" searchPlaceholder="Search states…" />
          </Field>
          <Field label="City" required>
            <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Ikeja" className={inputCls} />
          </Field>
        </div>

        <Field label="Full address" hint="Your business or pickup address. Only shared with an organiser after they accept your bid.">
          <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
            placeholder="e.g. 12 Admiralty Way, Lekki Phase 1" className={inputCls} />
        </Field>

        <Field label="Services you offer" required hint="Pick the categories you can bid on.">
          <div className="flex flex-wrap gap-2">
            {categoryNames.map(name => {
              const on = form.specialties.includes(name)
              return (
                <button key={name} type="button" onClick={() => toggleSpecialty(name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[13px] transition-all ${on ? 'bg-warning/15 border-warning/40 text-ink font-medium' : 'bg-canvas border-border text-ink-2 hover:border-warning/40'}`}>
                  {on && <Check size={13} />}
                  {name}
                </button>
              )
            })}
          </div>
        </Field>

        <div className="border-t border-border pt-5">
          <p className="text-[13px] font-medium text-ink-2 mb-1">Your work <span className="text-red-500">*</span></p>
          <p className="text-[12px] text-ink-3 mb-3">Photos and videos of past events are how organisers judge you, so add at least one. This is your portfolio.</p>
          <PortfolioUploader items={form.portfolio} onChange={items => set('portfolio', items)} />
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-[13px] font-medium text-ink-2 mb-1">Contact</p>
          <p className="text-[12px] text-ink-3 mb-3">A phone or WhatsApp number, shared with an organiser only after they accept your bid.</p>
          <input type="tel" inputMode="numeric" value={form.phone}
            onChange={e => set('phone', e.target.value.replace(/[^\d+]/g, ''))}
            placeholder="WhatsApp / phone" className={`${inputCls} ${errors.phone ? 'border-red-400' : ''}`} />
          {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <BankFields form={form} set={set} error={errors.bankAccountNumber} />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-[12px] text-ink-3">
          {complete ? 'Looks good. Save to send for verification.' : 'Fill every required field to submit for verification.'}
        </p>
        <button onClick={onSave} disabled={!complete || saving}
          className="px-7 py-3 bg-warning text-dark text-[14px] font-semibold rounded-xl hover:bg-warning/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? 'Saving…' : status === 'verified' ? 'Save changes' : 'Save & submit'}
        </button>
      </div>
    </>
  )
}

const inputCls =
  'w-full px-4 py-3 border border-border rounded-lg text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-warning focus:ring-2 focus:ring-warning/10 transition-colors'

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink-2 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-[12px] text-ink-3 -mt-1 mb-2">{hint}</p>}
      {children}
    </div>
  )
}
