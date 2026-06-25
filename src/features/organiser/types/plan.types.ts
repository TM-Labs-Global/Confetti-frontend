/** Plan status values */
export type PlanStatus = 'draft' | 'open' | 'bidding' | 'in-progress' | 'completed' | 'disputed'

export interface PlanCategory {
  id: string
  planId: string
  categoryId: string
  name: string
  allocation: number
  /** Optional free-text brief telling vendors what the organiser wants for this service. */
  brief?: string | null
}

export interface Plan {
  id: string
  name: string
  eventTypeId: string
  eventType?: { id: string; name: string }
  status: PlanStatus
  startDate: string | null
  endDate: string | null
  dateFlexible: boolean
  state: string
  city: string
  /** Expected headcount. Anchors how vendors price most services. */
  guestCount: number | null
  totalBudget: number
  shareCode: string
  organiserId: string
  categories: PlanCategory[]
  bidCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreatePlanPayload {
  name: string
  eventTypeId: string
  startDate?: string | null
  endDate?: string | null
  dateFlexible?: boolean
  state: string
  city?: string
  guestCount?: number | null
  totalBudget: number
  categories: Array<{ id: string; name: string; allocation: number; brief?: string }>
  status?: PlanStatus
}
