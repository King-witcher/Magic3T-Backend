import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Panel({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'relative backdrop-blur-xl bg-linear-to-b from-grey-3/90 to-grey-2/80 border-2 border-gold-5/30 p-8 shadow-2xl shadow-black/50',
        className
      )}
      {...props}
    >
      {/* Decorative corner elements */}
      <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-gold-3" />
      <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-gold-3" />
      <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-gold-3" />
      <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-gold-3" />
      {children}
    </div>
  )
}
