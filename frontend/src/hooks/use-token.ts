import { useQuery } from '@tanstack/react-query'
import { AuthState, useAuth } from '@/contexts/auth.context'

/// Gets a Firebase ID token.
export function useToken() {
  const auth = useAuth()
  return useQuery({
    enabled: auth.authState === AuthState.SignedIn,
    queryKey: ['get-token'],
    async queryFn() {
      return await auth.getToken()
    },
  })
}
