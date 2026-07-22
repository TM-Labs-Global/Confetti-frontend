// Shapes the organiser marketplace ("Find Vendors") works with. Kept here so the
// page, the shortlist panel, and the invite helpers can share one definition.

/** A verified vendor as returned by GET /api/vendors/browse (non-PII listing). */
export interface BrowseVendor {
  userId: string
  businessName: string
  bio: string
  state: string
  city: string
  /** JSON-encoded array of service names; read with parseSpecialties(). */
  specialties: string
  website: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  status: string
  user?: { name: string | null } | null
}

/** One row from GET /api/vendors/sent-invites (which vendor was invited to which slot). */
export interface SentInvite {
  vendorId: string
  planId: string
  planCategoryId: string
}
