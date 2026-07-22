/**
 * Budget-category bar colours. Leads with the brand cyan, then draws on the
 * full confetti accent spectrum so every category in a breakdown reads as a
 * distinct, celebratory colour instead of one flat cyan.
 */
export const BUDGET_BAR_COLORS = [
  '#00C4CC', // primary - brand cyan
  '#8B5CF6', // violet
  '#39E75F', // success - brand green
  '#FFB020', // gold
  '#FF6B6B', // coral
  '#22D3EE', // sky
  '#FF5CA8', // pink
  '#19D8B4', // teal (cyan × green blend)
  '#9BE84F', // lime
  '#F5923E', // amber
  '#6C7CC7', // periwinkle
  '#2AB56E', // deep green
]

/** Deterministic colour for a category by its position in the list. */
export function budgetColor(index: number): string {
  return BUDGET_BAR_COLORS[index % BUDGET_BAR_COLORS.length]
}
