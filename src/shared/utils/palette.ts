/**
 * Budget-category bar colours. Leads with the three exact Confette brand
 * accents, then continues with shades blended/derived from them so every
 * category in a breakdown reads as a distinct colour instead of one flat cyan.
 */
export const BUDGET_BAR_COLORS = [
  '#00C4CC', // primary - brand cyan
  '#39E75F', // success - brand green
  '#FFDE59', // warning - brand yellow
  '#19D8B4', // cyan × green blend (teal)
  '#9BE84F', // green × yellow blend (lime)
  '#5AD0E0', // lighter cyan
  '#FFB84D', // warm amber (yellow shade)
  '#2BA6C9', // deep cyan
  '#74E08A', // soft green
  '#E8C84A', // muted gold
  '#3FB8C4', // cyan × teal
  '#C7E84F', // chartreuse
]

/** Deterministic colour for a category by its position in the list. */
export function budgetColor(index: number): string {
  return BUDGET_BAR_COLORS[index % BUDGET_BAR_COLORS.length]
}
