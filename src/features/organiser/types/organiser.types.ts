// Account-level moderation status for an organiser. Organisers have no
// verify/reject workflow (unlike vendors) - only active or suspended.
export type OrganiserStatus = 'active' | 'suspended'

// Row shape from GET /api/organisers (admin list).
export interface OrganiserRow {
  id: string
  name: string
  email: string
  status: OrganiserStatus
  suspensionReason?: string | null
  createdAt: string
  eventCount: number
  /** The platform itself (an admin who runs events). Can't be suspended. */
  isPlatform?: boolean
}

// Organiser summary from GET /api/organisers/:id (admin detail).
export interface OrganiserDetail {
  id: string
  name: string
  email: string
  status: OrganiserStatus
  suspensionReason?: string | null
  createdAt: string
  /** The platform itself (an admin who runs events). Can't be suspended. */
  isPlatform?: boolean
}
