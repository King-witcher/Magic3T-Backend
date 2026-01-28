import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ProfileTemplate } from '@/components/templates'
import { useUser } from '@/contexts/auth-context'
import { apiClient } from '@/services/clients/api-client'

export const Route = createFileRoute('/_auth-guarded/me')({
  component: () => {
    const user = useUser()
    if (!user) throw new Error('User not found')

    const matchesQuery = useQuery({
      queryKey: ['matches', user.id],
      async queryFn() {
        return apiClient.match.getMatchesByUser(user.id, 20)
      },
    })

    return <ProfileTemplate user={user} matchesQuery={matchesQuery} />
  },
})
