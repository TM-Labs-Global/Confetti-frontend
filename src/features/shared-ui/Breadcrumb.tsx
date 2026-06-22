import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  dark?: boolean
}

export function Breadcrumb({ items, dark = false }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-[13px]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && (
            <span className={dark ? 'text-dark-border' : 'text-ink-3'}>/</span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className={`transition-colors ${
                dark ? 'text-dark-muted hover:text-white' : 'text-ink-3 hover:text-ink'
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span className={dark ? 'text-white' : 'text-ink truncate'}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
