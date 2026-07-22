/** Plan status values */
export type PlanStatus = 'draft' | 'open' | 'bidding' | 'in-progress' | 'completed' | 'disputed'

/** A single costed line inside a category's budget (e.g. "Small chops" x200 at ₦1,500). */
export interface PlanLineItem {
  id: string
  planCategoryId: string
  name: string
  quantity: number
  /** Cost per unit in whole naira. Line total = quantity * unitCost. */
  unitCost: number
}

export interface PlanCategory {
  id: string
  planId: string
  categoryId: string
  name: string
  /** Total for this category. When line items exist, it is the sum of their totals. */
  allocation: number
  /** Optional free-text brief telling vendors what the organiser wants for this service. */
  brief?: string | null
  /** Costed breakdown of the allocation. Empty for legacy lump-sum categories. */
  lineItems?: PlanLineItem[]
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
  /** Whether the event is broadcast to the open vendor marketplace. False = invite-only. */
  openToBids: boolean
  shareCode: string
  organiserId: string
  /** Event owner. Reads "Confette Events" for platform-run (admin-owned) events. */
  organiser?: { id: string; name: string }
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
  categories: Array<{
    id: string
    name: string
    allocation: number
    brief?: string
    lineItems?: Array<{ name: string; quantity: number; unitCost: number }>
  }>
  openToBids?: boolean
  status?: PlanStatus
}
