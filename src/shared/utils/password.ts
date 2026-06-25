// Password policy (shared rule): min 8 chars, at least one uppercase,
// one lowercase, and one number. Mirrored on the backend.

export interface PasswordRule {
  label: string
  test: (pw: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: pw => pw.length >= 8 },
  { label: 'One uppercase letter', test: pw => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: pw => /[a-z]/.test(pw) },
  { label: 'One number', test: pw => /[0-9]/.test(pw) },
]

export function isPasswordValid(pw: string): boolean {
  return PASSWORD_RULES.every(r => r.test(pw))
}

export interface PasswordStrength {
  /** 0-4: how many policy rules are satisfied */
  score: number
  /** Whether the password meets the full policy */
  valid: boolean
  label: 'Too weak' | 'Weak' | 'Fair' | 'Good' | 'Strong'
  /** Tailwind colour token for the meter fill */
  tone: 'danger' | 'warning' | 'success'
}

export function getPasswordStrength(pw: string): PasswordStrength {
  if (!pw) return { score: 0, valid: false, label: 'Too weak', tone: 'danger' }

  let score = PASSWORD_RULES.filter(r => r.test(pw)).length
  // Bonus signal for longer passwords, capped at the rule count.
  if (pw.length >= 12 && score === PASSWORD_RULES.length) score = 4

  const valid = isPasswordValid(pw)
  const label = (['Too weak', 'Weak', 'Fair', 'Good', 'Strong'] as const)[score]
  const tone = score <= 1 ? 'danger' : score <= 3 ? 'warning' : 'success'
  return { score, valid, label, tone }
}
