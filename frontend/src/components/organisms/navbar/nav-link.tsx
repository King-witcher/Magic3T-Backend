import { Link } from '@tanstack/react-router'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href?: string
  children: ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export function NavLink({ children, href, className, disabled, onClick }: NavLinkProps) {
  const baseClassName = cn(
    'relative flex items-center gap-2 px-4 h-full',
    'font-serif text-sm uppercase tracking-wider',
    'text-gold-2 hover:text-gold-1',
    'transition-all duration-200',
    'hover:bg-gold-6/20',
    // Bottom border highlight on hover
    'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2',
    'after:w-0 after:h-0.5 after:bg-gold-3',
    'after:transition-all after:duration-300',
    'hover:after:w-full',
    className
  )

  if (disabled) {
    return (
      <span
        className={cn(
          'flex items-center gap-2 px-4 h-full',
          'font-serif text-sm uppercase tracking-wider',
          'text-grey-1/50 cursor-not-allowed',
          className
        )}
      >
        {children}
      </span>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={baseClassName}>
        {children}
      </button>
    )
  }

  if (!href) {
    return null
  }

  return (
    <Link to={href} className={baseClassName}>
      {children}
    </Link>
  )
}
