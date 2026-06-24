export interface AppNotification {
  id: string
  userId: string
  type:
    | 'bid_received'
    | 'bid_accepted'
    | 'bid_updated'
    | 'new_plan'
    | 'vendor_verified'
    | 'vendor_rejected'
    | string
  message: string
  isRead: boolean
  createdAt: string
  /** Optional deep-link target supplied by the backend. Falls back to a type-based route. */
  link?: string
  /** Optional entity ids the backend may attach for precise deep-linking. */
  planId?: string
  bidId?: string
}
