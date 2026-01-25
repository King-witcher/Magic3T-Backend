import { GetUserResult, ListMatchesResult } from '@magic3t/api-types'
import { UseQueryResult } from '@tanstack/react-query'
import { Panel, PanelDivider } from '@/components/ui/panel'
import { useRegisterCommand } from '@/hooks/use-register-command'
import { Console } from '@/lib/console'
import { MatchHistory } from './match-history'
import { ProfileHeader } from './profile-header'
import { ProfileSearch } from './profile-search'
import { ProfileStats } from './profile-stats'

interface Props {
  user: GetUserResult
  matchesQuery: UseQueryResult<ListMatchesResult, Error>
}

export function ProfileTemplate({ user, matchesQuery }: Props) {
  // Registers a console command to log the user ID
  useRegisterCommand(
    {
      name: 'userid',
      description: 'Logs the user ID',
      handler: async () => {
        Console.log(user.id)
        return 0
      },
    },
    [user.id]
  )

  return (
    <div className="min-h-full p-4 sm:p-8 flex justify-center items-start">
      <div className="w-full max-w-4xl space-y-6">
        {/* Main Profile Card */}
        <Panel className="flex flex-col">
          {/* Search Other Players */}
          <ProfileSearch />

          <PanelDivider />

          {/* Profile Header - Icon, Name, Rank */}
          <ProfileHeader user={user} />

          <PanelDivider />

          {/* Stats Section */}
          <ProfileStats user={user} />

          <PanelDivider />
        </Panel>

        {/* Match History Card */}
        <Panel>
          <MatchHistory matchesQuery={matchesQuery} currentUserId={user.id} />
        </Panel>
      </div>
    </div>
  )
}
