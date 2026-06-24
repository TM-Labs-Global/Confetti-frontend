'use client'
import { useEffect, useState } from 'react'
import { BadgeCheck, Globe, AtSign, Link2, Music2, Phone, MapPin, X } from 'lucide-react'
import { VendorProfile, parseSpecialties } from '../types/vendor.types'

interface Props {
  userId: string
  onClose: () => void
}

// Read-only vendor profile, opened from an organiser's bid list so they can see
// who is bidding (business, what they do, socials/portfolio, verification).
export function VendorProfileModal({ userId, onClose }: Props) {
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/vendors/${userId}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (data?.profile) setProfile(data.profile); else setError(true) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [userId])

  const specialties = parseSpecialties(profile?.specialties)
  const socials = profile ? [
    profile.website && { Icon: Globe, label: profile.website, href: profile.website.startsWith('http') ? profile.website : `https://${profile.website}` },
    profile.instagram && { Icon: AtSign, label: profile.instagram.replace(/^@/, ''), href: `https://instagram.com/${profile.instagram.replace(/^@/, '')}` },
    profile.facebook && { Icon: Link2, label: profile.facebook, href: profile.facebook.startsWith('http') ? profile.facebook : `https://facebook.com/${profile.facebook}` },
    profile.tiktok && { Icon: Music2, label: profile.tiktok.replace(/^@/, ''), href: `https://tiktok.com/@${profile.tiktok.replace(/^@/, '')}` },
    profile.phone && { Icon: Phone, label: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` },
  ].filter(Boolean) as Array<{ Icon: any; label: string; href: string }> : []

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error || !profile ? (
          <div className="p-8 text-center">
            <p className="text-[14px] text-ink-2">This vendor hasn't set up a profile yet.</p>
            <button onClick={onClose} className="mt-4 text-[13px] font-medium text-primary hover:underline">Close</button>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-[18px] font-bold text-ink">{profile.businessName}</h3>
                  {profile.status === 'verified' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-[#166534]">
                      <BadgeCheck size={12} /> Verified
                    </span>
                  )}
                </div>
                {profile.user?.name && <p className="text-[13px] text-ink-3">{profile.user.name}</p>}
              </div>
              <button onClick={onClose} className="text-ink-3 hover:text-ink"><X size={18} /></button>
            </div>

            {(profile.city || profile.state) && (
              <p className="mb-3 flex items-center gap-1.5 text-[13px] text-ink-2">
                <MapPin size={14} className="text-ink-3" /> {[profile.city, profile.state].filter(Boolean).join(', ')}
              </p>
            )}

            {profile.bio && <p className="mb-4 text-[13px] leading-relaxed text-ink-2">{profile.bio}</p>}

            {specialties.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {specialties.map(s => (
                    <span key={s} className="rounded-lg bg-canvas border border-border px-2.5 py-1 text-[12px] text-ink-2">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {socials.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">Portfolio & socials</p>
                <div className="space-y-1.5">
                  {socials.map(({ Icon, label, href }) => (
                    <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[13px] text-primary hover:underline">
                      <Icon size={14} /> {label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorProfileModal
