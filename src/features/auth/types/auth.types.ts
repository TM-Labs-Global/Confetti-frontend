export type VendorStatus = 'pending' | 'verified' | 'rejected' | 'suspended'

/** A user can hold more than one role (e.g. organiser + vendor). Admin is
 * standalone and never combined with the other two. */
export type Role = 'organiser' | 'vendor' | 'admin'

/** The two portals a user can opt into and switch between. */
export type Portal = 'organiser' | 'vendor'

/** Account-level moderation status. Suspended users can sign in and view, but
 * can't make changes (used for organisers; admin/vendor default to active). */
export type AccountStatus = 'active' | 'suspended'

/** The authenticated user shape returned by the API */
export interface AuthUser {
  id: string
  name: string
  email: string
  /** All roles the account holds. Authorization tests membership, not equality. */
  roles: Role[]
  emailVerified: boolean
  status: AccountStatus
  createdAt: string
  /** Present for vendors once they have started a profile; null otherwise. */
  vendorProfile?: { status: VendorStatus; businessName: string } | null
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: 'organiser' | 'vendor'
}
