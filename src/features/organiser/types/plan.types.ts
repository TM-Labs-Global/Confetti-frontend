/** Plan status values */
export type PlanStatus = 'draft' | 'open' | 'bidding' | 'in-progress' | 'completed' | 'disputed'

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
  startDate: string | null
  endDate: string | null
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
  startDate?: string | null
  endDate?: string | null
  dateFlexible?: boolean
  state: string
  city?: string
  totalBudget: number
  categories: Array<{ id: string; name: string; allocation: number }>
  status?: PlanStatus
}
