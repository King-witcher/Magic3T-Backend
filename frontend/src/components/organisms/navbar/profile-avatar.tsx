import { League } from '@magic3t/common-types'
import { cn } from '@/lib/utils'
import { getIconUrl } from '@/utils/utils'

interface ProfileAvatarProps {
  icon?: number
  league?: League
  isLoading?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
}

const borderColors: Record<League, string> = {
  [League.Provisional]: 'border-grey-1',
  [League.Bronze]: 'border-amber-700',
  [League.Silver]: 'border-slate-400',
  [League.Gold]: 'border-yellow-500',
  [League.Diamond]: 'border-blue-400',
  [League.Master]: 'border-purple-500',
  [League.Challenger]: 'border-gold-3',
}

export function ProfileAvatar({
  icon = 29,
  league = League.Provisional,
  isLoading = false,
  size = 'md',
  className,
}: ProfileAvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full overflow-hidden',
        'border-2 transition-all duration-300',
        'bg-hextech-black/40',
        borderColors[league],
        sizeClasses[size],
        className
      )}
    >
      {isLoading ? (
        <div className="w-full h-full animate-pulse bg-grey-1/30" />
      ) : (
        <img src={getIconUrl(icon)} alt="Profile" className="w-full h-full object-cover" />
      )}
    </div>
  )
}
