import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loading, NotFoundTemplate, ProfileTemplate } from '@/components/templates'
import { apiClient } from '@/services/clients/api-client'

export const Route = createFileRoute('/users/id/$userId')({
  component: Page,
  pendingComponent: () => <Loading />,
  notFoundComponent: () => <NotFoundTemplate />,
  shouldReload: false,
})

function Page() {
  const { userId } = Route.useParams()

  const matchesQuery = useQuery({
    queryKey: ['matches', userId],
    async queryFn() {
      return apiClient.match.getMatchesByUser(userId, 20)
    },
  })

  const userQuery = useSuspenseQuery({
    queryKey: ['user', userId],
    staleTime: Number.POSITIVE_INFINITY,
    queryFn() {
      return apiClient.user.getById(userId)
    },
  })

  if (!userQuery.data) {
    return <NotFoundTemplate />
  }

  return <ProfileTemplate key={userId} user={userQuery.data} matchesQuery={matchesQuery} />
}
