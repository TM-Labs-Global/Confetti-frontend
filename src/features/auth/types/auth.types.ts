export type VendorStatus = 'pending' | 'verified' | 'rejected' | 'suspended'

/** The authenticated user shape returned by the API */
export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'organiser' | 'vendor' | 'admin'
  emailVerified: boolean
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
