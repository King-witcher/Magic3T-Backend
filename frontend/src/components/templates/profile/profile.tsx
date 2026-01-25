import { GetUserResult } from '@magic3t/api-types'
import { useAuth } from '@/contexts/auth-context'
import { useRegisterCommand } from '@/hooks/use-register-command'
import { Console } from '@/lib/console'
import { leaguesMap } from '@/utils/ranks'

interface Props {
  user: GetUserResult
}

export function ProfileTemplate({ user }: Props) {
  const { user: authenticatedUser } = useAuth()
  const leagueInfo = leaguesMap[user.rating.league]

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

  return <></>
}
