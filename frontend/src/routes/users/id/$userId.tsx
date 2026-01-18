import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loading, NotFoundTemplate, ProfileTemplate } from '@/components/templates'
import { apiClient } from '@/services/clients/api-client'
import { NotFoundError } from '@/services/clients/client-error'

export const Route = createFileRoute('/users/id/$userId')({
  component: Page,
  shouldReload: false,
})

function Page() {
  const { userId } = Route.useParams()

  const userQuery = useQuery({
    queryKey: ['user', userId],
    async queryFn() {
      return apiClient.user.getById(userId)
    },
  })

  const matchesQuery = useQuery({
    enabled: !!userQuery.data,
    queryKey: ['matches', userQuery.data?.id],
    staleTime: Number.POSITIVE_INFINITY,
    async queryFn() {
      return apiClient.match.getMatchesByUser(userQuery.data?.id || '', 20)
    },
  })

  switch (userQuery.status) {
    case 'pending': {
      return <Loading />
    }
    case 'error': {
      if (userQuery.error instanceof NotFoundError) {
        return <NotFoundTemplate />
      }
      return <div>Error: {userQuery.error.message}</div>
    }
    case 'success': {
      if (!userQuery.data) {
        return <NotFoundTemplate />
      }
      return <ProfileTemplate matchesQuery={matchesQuery} user={userQuery.data} />
    }
  }
}
