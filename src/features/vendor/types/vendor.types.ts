export type BidStatus = 'pending' | 'accepted' | 'rejected'

export type VendorStatus = 'pending' | 'verified' | 'rejected' | 'suspended'

export interface VendorProfile {
  id: string
  userId: string
  businessName: string
  bio: string
  state: string
  city: string
  /** JSON-encoded array of category names; use parseSpecialties() to read. */
  specialties: string
  website?: string | null
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  phone?: string | null
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
