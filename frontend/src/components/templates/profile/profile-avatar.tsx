import { Division, League } from '@magic3t/common-types'
import { ComponentProps } from 'react'
import { divisionMap, leaguesMap } from '@/utils/ranks'
import { cn, getIconUrl } from '@/utils/utils'

// Wings are in a 287/372 ratio
// Avatar space is 96/287 ~ 1/3 of the image width
// Avatar space starts at 467/992 from the top
// The division text is centered at 230/497 from the top of the image
// The division text is at -3/97 avatar diameters from the top of the avatar space

export function AvatarRoot({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('relative size-32', className)} {...props} />
}

type AvatarImageProps = ComponentProps<'img'> & { icon: number }
export function AvatarImage({ icon, className, ...props }: AvatarImageProps) {
  return (
    <img
      src={getIconUrl(icon)}
      alt={`icon ${icon}`}
      className={cn('rounded-full shadow-lg shadow-gold-5/40', className)}
      {...props}
    />
  )
}

type AvatarWingProps = { league: League }
export function AvatarWing({ league }: AvatarWingProps) {
  const leagueInfo = leaguesMap[league]

  return (
    <div className="absolute inset-0">
      <div className="absolute w-287/96 h-auto left-1/2 -translate-x-1/2 -translate-y-467/992">
        <img className="w-full h-auto" src={leagueInfo.wing} alt={leagueInfo.name} />
      </div>
    </div>
  )
}

type AvatarDivisionProps = ComponentProps<'span'> & { division: Division }
export function AvatarDivision({ division, className, ...props }: AvatarDivisionProps) {
  const divisionString = division ? divisionMap[division] : ''
  return (
    <span
      className={cn(
        'absolute left-1/2 -top-3/97 -translate-x-1/2 -translate-y-1/2',
        ' font-serif font-bold text-2xl text-gold-1 tracking-tight',
        className
      )}
      {...props}
    >
      {divisionString}
    </span>
  )
}
