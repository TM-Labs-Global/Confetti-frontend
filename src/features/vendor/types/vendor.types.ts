export type BidStatus = 'pending' | 'accepted' | 'rejected'

export type VendorStatus = 'pending' | 'verified' | 'rejected' | 'suspended'

/** A single portfolio media item (photo or video of the vendor's work). */
export interface PortfolioItem {
  url: string
  type: 'image' | 'video'
  publicId?: string
}

export interface VendorProfile {
  id: string
  userId: string
  businessName: string
  bio: string
  state: string
  city: string
  /** JSON-encoded array of category names; use parseSpecialties() to read. */
  specialties: string
  /** JSON-encoded array of PortfolioItem; use parsePortfolio() to read. */
  portfolio?: string
  website?: string | null
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  phone?: string | null
  /** Street address. Only present on the vendor's own profile, or to an
   * organiser once they've accepted this vendor's bid; null otherwise. */
  address?: string | null
  // Payout bank details the vendor enters (not verified in Phase 1). Only present
  // on the vendor's own profile, or to an organiser after they accept this
  // vendor's bid; null/absent otherwise.
  bankName?: string | null
  bankAccountNumber?: string | null
  bankAccountName?: string | null
  status: VendorStatus
  rejectionReason?: string | null
  createdAt: string
  updatedAt: string
  user?: { name: string; createdAt: string }
}

/** Safely parse the JSON-encoded specialties string into a list of names. */
export function parseSpecialties(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

/** Safely parse the JSON-encoded portfolio string into a list of media items. */
export function parsePortfolio(raw: string | null | undefined): PortfolioItem[] {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    if (!Array.isArray(v)) return []
    return v.filter((it): it is PortfolioItem => !!it && typeof it.url === 'string')
  } catch {
    return []
  }
}

export interface VendorBid {
  id: string
  planId: string
  planCategoryId: string
  vendorId: string
  amount: number
  pitch: string
  status: BidStatus
  isCounterBid: boolean
  counterReason?: string | null
  canUpdate: boolean
  createdAt: string
  updatedAt: string
  planCategory?: { id: string; name: string }
  plan?: {
    id: string
    name: string
    state: string
    city: string
    status?: string
    startDate?: string | null
    endDate?: string | null
    dateFlexible?: boolean
    eventTypeId?: string
    eventType?: { id: string; name: string }
  }
}

export interface SubmitBidPayload {
  planId: string
  planCategoryId: string
  amount: number
  pitch?: string
  isCounterBid?: boolean
  counterReason?: string
}
