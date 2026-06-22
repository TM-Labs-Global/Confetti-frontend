export type BidStatus = 'pending' | 'accepted' | 'rejected'

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
