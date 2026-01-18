import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loading, NotFoundTemplate, ProfileTemplate } from '@/components/templates'
import { apiClient } from '@/services/clients/api-client'
import { NotFoundError } from '@/services/clients/client-error'

export const Route = createFileRoute('/users/$nickname')({
  component: RouteComponent,
  shouldReload: false,
})

function RouteComponent() {
  const { nickname } = Route.useParams()

  const slug = nickname.toLowerCase().replaceAll(' ', '')

  const userQuery = useQuery({
    queryKey: ['user-by-nickname', slug],
    async queryFn() {
      return apiClient.user.getByNickname(nickname)
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
