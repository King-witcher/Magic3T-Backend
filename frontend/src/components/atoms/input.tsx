import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 bg-hextech-black/80 border-2 text-gold-1 placeholder-grey-1/50 rounded',
          'focus:outline-none focus:border-gold-4 focus:ring-2 focus:ring-gold-4/20',
          'transition-all duration-200 disabled:opacity-50',
          error ? 'border-red-500' : 'border-gold-6/50',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
