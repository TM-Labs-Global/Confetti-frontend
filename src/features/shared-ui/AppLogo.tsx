import Image from 'next/image'
import confetteLogo from '@/assets/confette-logo.png'

interface AppLogoProps {
  /** Height of the logo image in px (width auto-scales). Default: 32 */
  size?: number
  /** When true renders the word-mark "Confetti" beside the icon. Default: true */
  showName?: boolean
  /** Tailwind/custom classes applied to the text label */
  nameClassName?: string
}

/**
 * Shared logo component. Uses the real Confette brand mark (PNG).
 * Works on both dark sidebar backgrounds and light auth pages.
 */
export function AppLogo({
  size = 32,
  showName = true,
  nameClassName = 'font-display font-bold text-[18px] tracking-[-0.01em] text-white',
}: AppLogoProps) {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={confetteLogo}
        alt="Confetti logo"
        height={size}
        width={size}
        className="shrink-0 block"
        priority
      />
      {showName && (
        <span className={nameClassName} style={{ paddingBottom: '3px' }}>
          Confetti
        </span>
      )}
    </div>
  )
}

export default AppLogo

