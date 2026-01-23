import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Panel({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'relative backdrop-blur-lg bg-linear-to-b from-grey-3/85 to-grey-3/75 border-2 border-gold-5/60 p-8 shadow-2xl shadow-black/50',
        className
      )}
      {...props}
    >
      {/* Decorative corner elements */}
      <div className="absolute -top-1 -left-1 w-8 h-8 border-t-3 border-l-3 border-gold-4" />
      <div className="absolute -top-1 -right-1 w-8 h-8 border-t-3 border-r-3 border-gold-4" />
      <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-3 border-l-3 border-gold-4" />
      <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-3 border-r-3 border-gold-4" />
      {children}
    </div>
  )
}
