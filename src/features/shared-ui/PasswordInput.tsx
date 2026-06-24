'use client'
import { useState, useId } from 'react'
import { Eye, EyeOff, Check } from 'lucide-react'
import { PASSWORD_RULES, getPasswordStrength } from '@/shared/utils/password'

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  /** Show the strength meter + requirements checklist (use on signup/reset). */
  showStrength?: boolean
  autoComplete?: string
  required?: boolean
  name?: string
}

const TONE_BAR: Record<string, string> = {
  danger: 'bg-red-500',
  warning: 'bg-warning',
  success: 'bg-success',
}
const TONE_TEXT: Record<string, string> = {
  danger: 'text-red-500',
  warning: 'text-[#B58900]',
  success: 'text-[#1F9D3D]',
}

export function PasswordInput({
  value,
  onChange,
  label = 'Password',
  placeholder = '••••••••',
  showStrength = false,
  autoComplete,
  required,
  name = 'password',
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const id = useId()
  const strength = getPasswordStrength(value)

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-border px-4 py-3 pr-11 text-[14px] text-ink placeholder:text-ink-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-canvas hover:text-ink-2"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`h-full flex-1 rounded-full transition-colors ${
                    i < strength.score ? TONE_BAR[strength.tone] : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <span className={`text-[12px] font-medium ${TONE_TEXT[strength.tone]}`}>{strength.label}</span>
          </div>

          <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {PASSWORD_RULES.map(rule => {
              const ok = rule.test(value)
              return (
                <li
                  key={rule.label}
                  className={`flex items-center gap-1.5 text-[12px] ${ok ? 'text-[#1F9D3D]' : 'text-ink-3'}`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                      ok ? 'bg-success text-dark' : 'border border-border'
                    }`}
                  >
                    {ok && <Check size={9} strokeWidth={3} />}
                  </span>
                  {rule.label}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default PasswordInput
