/** Plan status values */
export type PlanStatus = 'draft' | 'open' | 'bidding' | 'closed'

export interface PlanCategory {
  id: string
  planId: string
  categoryId: string
  name: string
  allocation: number
}

export interface Plan {
  id: string
  name: string
  eventTypeId: string
  eventType?: { id: string; name: string }
  status: PlanStatus
  date: string | null
  dateFlexible: boolean
  state: string
  city: string
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
  date?: string
  dateFlexible?: boolean
  state: string
  city?: string
  totalBudget: number
  categories: Array<{ id: string; name: string; allocation: number }>
  status?: PlanStatus
}
