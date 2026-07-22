import { parseSpecialties } from '@/features/vendor/types/vendor.types'
import { Plan, PlanCategory } from '../types/plan.types'
import { BrowseVendor } from '../types/marketplace.types'

/**
 * Events an organiser can still gather vendors for: open or bidding, and either
 * date-flexible or not yet started. Same rule the invite flow uses so the
 * shortlist and the invite modal stay in lockstep.
 */
export function invitableEvents(plans: Plan[], now: number): Plan[] {
  return plans.filter(p =>
    ['open', 'bidding'].includes(p.status) &&
    (p.dateFlexible || !p.startDate || new Date(p.startDate).getTime() > now),
  )
}

/** Categories on `plan` whose service this vendor actually offers (matched by name). */
export function matchingCategories(plan: Plan | undefined, vendor: BrowseVendor): PlanCategory[] {
  if (!plan) return []
  const services = parseSpecialties(vendor.specialties)
  return (plan.categories ?? []).filter(c => services.includes(c.name))
}
