'use client'
import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Clock, AlertCircle, Check, Pencil, Globe, AtSign, Link2, Music2, Phone, MapPin } from 'lucide-react'
import { useAuth } from '@/features/auth/context/AuthContext'
import { SearchableSelect, ConfettiBurst } from '@/features/shared-ui'
import { NIGERIAN_STATES } from '@/shared/constants/nigeria'
import { VendorProfile, parseSpecialties } from '@/features/vendor/types/vendor.types'

interface FormState {
  businessName: string
  bio: string
  state: string
  city: string
  specialties: string[]
  website: string
  instagram: string
  facebook: string
  tiktok: string
  phone: string
}

const EMPTY: FormState = {
  businessName: '', bio: '', state: '', city: '', specialties: [],
  website: '', instagram: '', facebook: '', tiktok: '', phone: '',
}

// Normalisers so stored values are well-formed regardless of how they were typed.
const normalizeUrl = (u: string) => (!u.trim() ? '' : /^https?:\/\//i.test(u.trim()) ? u.trim() : `https://${u.trim()}`)
const normalizeHandle = (h: string) => (!h.trim() ? '' : h.trim().startsWith('http') ? h.trim() : `@${h.trim().replace(/^@+/, '')}`)
const normalizePhone = (p: string) => p.replace(/[^\d+]/g, '')

function validate(f: FormState): Partial<Record<keyof FormState, string>> {
  const e: Partial<Record<keyof FormState, string>> = {}
  if (f.website && !/\.[a-z]{2,}/i.test(f.website)) e.website = 'Enter a valid website, e.g. yourbiz.com'
  if (f.phone && normalizePhone(f.phone).replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number'
  return e
}

export default function VendorProfilePage() {
  const { user } = useAuth()
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
          specialties: parseSpecialties(p.specialties),
          website: p.website ?? '',
          instagram: p.instagram ?? '',
          facebook: p.facebook ?? '',
          tiktok: p.tiktok ?? '',
          phone: p.phone ?? '',
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

  const hasSocial = !!(form.website || form.instagram || form.facebook || form.tiktok || form.phone)
  const complete = useMemo(
    () => !!form.businessName.trim() && !!form.bio.trim() && !!form.state && !!form.city.trim() &&
      form.specialties.length > 0 && hasSocial,
    [form, hasSocial],
  )

  async function save() {
    if (!complete) return
    // Normalise + validate before sending.
    const cleaned: FormState = {
      ...form,
      website: normalizeUrl(form.website),
      instagram: normalizeHandle(form.instagram),
      facebook: form.facebook.trim(),
      tiktok: normalizeHandle(form.tiktok),
      phone: normalizePhone(form.phone),
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
  const socials = [
    form.website && { Icon: Globe, label: form.website, href: form.website },
    form.instagram && { Icon: AtSign, label: form.instagram.replace(/^@/, ''), href: `https://instagram.com/${form.instagram.replace(/^@/, '')}` },
    form.facebook && { Icon: Link2, label: form.facebook, href: form.facebook.startsWith('http') ? form.facebook : `https://facebook.com/${form.facebook}` },
    form.tiktok && { Icon: Music2, label: form.tiktok.replace(/^@/, ''), href: `https://tiktok.com/@${form.tiktok.replace(/^@/, '')}` },
  ].filter(Boolean) as Array<{ Icon: any; label: string; href: string }>

  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <h2 className="font-display font-bold text-[20px] text-ink">{form.businessName}</h2>
      {(form.city || form.state) && (
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-2"><MapPin size={14} className="text-ink-3" /> {[form.city, form.state].filter(Boolean).join(', ')}</p>
      )}
      {form.bio && <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{form.bio}</p>}

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

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3 mb-2">Portfolio & socials</p>
        <div className="space-y-1.5">
          {socials.map(({ Icon, label, href }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] text-primary hover:underline">
              <Icon size={14} /> {label}
            </a>
          ))}
          {form.phone && (
            <p className="flex items-center gap-2 text-[13px] text-ink-2"><Phone size={14} className="text-ink-3" /> {form.phone} <span className="text-[11px] text-ink-3">(shared with an organiser only after they accept your bid)</span></p>
          )}
        </div>
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

        <div className="grid grid-cols-2 gap-3">
          <Field label="State" required>
            <SearchableSelect value={form.state} onChange={v => set('state', v)} options={NIGERIAN_STATES}
              placeholder="Select state" searchPlaceholder="Search states…" />
          </Field>
          <Field label="City" required>
            <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Ikeja" className={inputCls} />
          </Field>
        </div>

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
          <p className="text-[13px] font-medium text-ink-2 mb-1">Portfolio & socials <span className="text-red-500">*</span></p>
          <p className="text-[12px] text-ink-3 mb-3">At least one so organisers can see your work. These are your portfolio.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input type="text" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="Instagram (@handle)" className={inputCls} />
            </div>
            <div>
              <input type="text" value={form.website} onChange={e => set('website', e.target.value)} placeholder="Website (yourbiz.com)" className={`${inputCls} ${errors.website ? 'border-red-400' : ''}`} />
              {errors.website && <p className="text-[11px] text-red-500 mt-1">{errors.website}</p>}
            </div>
            <div>
              <input type="text" value={form.facebook} onChange={e => set('facebook', e.target.value)} placeholder="Facebook" className={inputCls} />
            </div>
            <div>
              <input type="text" value={form.tiktok} onChange={e => set('tiktok', e.target.value)} placeholder="TikTok (@handle)" className={inputCls} />
            </div>
            <div>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="WhatsApp / phone" className={`${inputCls} ${errors.phone ? 'border-red-400' : ''}`} />
              {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>
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
