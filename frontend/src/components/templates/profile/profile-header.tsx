import { GetUserResult } from '@magic3t/api-types'
import { UserRole } from '@magic3t/database-types'
import { GiCrown, GiRobotGrab } from 'react-icons/gi'
import { Tooltip } from '@/components/ui/tooltip'
import { AvatarDivision, AvatarImage, AvatarRoot, AvatarWing } from './profile-avatar'

interface ProfileHeaderProps {
  user: GetUserResult
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-6">
        {/* Profile Avatar */}
        <AvatarRoot className="mt-16">
          <AvatarImage icon={user.summonerIcon} />
          <AvatarWing league={user.rating.league} />
          {user.rating.division && <AvatarDivision division={user.rating.division} />}
        </AvatarRoot>

        {/* User Info */}
        <div className="text-center mt-4 space-y-2">
          {/* Nickname with Role Badge */}
          <div className="flex items-center justify-center gap-2">
            {user.role === UserRole.Bot && (
              <Tooltip text="Bot account">
                <GiRobotGrab className="text-gold-4 size-7" />
              </Tooltip>
            )}
            {user.role === UserRole.Creator && (
              <Tooltip text="Game Creator">
                <GiCrown className="text-gold-4 size-7" />
              </Tooltip>
            )}
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-gold-1 tracking-wide">
              {user.nickname}
            </h1>
          </div>
        </div>
      </div>
      {/* Rank Emblem */}
      <div className="flex">
        <div className="flex flex-col items-center">
          <img
            src={`${import.meta.env.VITE_CDN_URL}/leagues/emblems/challenger.png`}
            alt=""
            className="w-56 object-contain"
          />
          <p className="text-gold-1 tracking-wider font-serif font-medium text-2xl">Challenger</p>
          <p className="text-gold-4 tracking-wider font-serif font-bold text-lg">1200 LP</p>
        </div>
      </div>
    </div>
  )
}
