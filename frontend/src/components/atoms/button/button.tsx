import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const buttonVariants = {
  primary: `
    relative overflow-hidden group
    bg-linear-to-r from-gold-6 via-gold-5 to-gold-6
    hover:from-gold-5 hover:via-gold-4 hover:to-gold-5
    border-2 border-gold-4
    text-gold-1 font-bold
    shadow-lg shadow-gold-5/30
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-300
  `,
  secondary: `
    relative overflow-hidden group
    bg-hextech-black/60 hover:bg-hextech-black/80
    border-2 border-grey-1/30 hover:border-grey-1/50
    text-grey-1 hover:text-gold-1
    font-semibold
    shadow-lg
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-300
  `,
  destructive: `
    relative overflow-hidden group
    bg-linear-to-r from-red-900/80 via-red-800/80 to-red-900/80
    hover:from-red-800/90 hover:via-red-700/90 hover:to-red-800/90
    border-2 border-red-600/50 hover:border-red-500/70
    text-red-100 font-bold
    shadow-lg shadow-red-900/30
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-300
  `,
  ghost: `
    text-gold-3 hover:text-gold-1 hover:bg-gold-6/10
    font-semibold
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `,
  outline: `
    border-2 border-gold-5/50 hover:border-gold-4
    bg-transparent hover:bg-gold-6/10
    text-gold-2 hover:text-gold-1
    font-semibold
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200
  `,
}

const buttonSizes = {
  sm: 'px-4 py-2 text-sm rounded',
  md: 'px-6 py-3 text-base rounded',
  lg: 'px-8 py-4 text-lg rounded-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const hasShineEffect = variant === 'primary' || variant === 'destructive'

    return (
      <button
        ref={ref}
        className={cn(
          'uppercase tracking-wider',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
        {hasShineEffect && (
          <div
            className={cn(
              'absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700',
              variant === 'primary' &&
                'bg-linear-to-r from-transparent via-gold-3/20 to-transparent',
              variant === 'destructive' &&
                'bg-linear-to-r from-transparent via-red-400/20 to-transparent'
            )}
          />
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
