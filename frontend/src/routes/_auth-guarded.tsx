import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ChooseNicknameTemplate, LoadingSessionTemplate } from '@/components/templates'
import { AuthState, useAuth } from '@/contexts/auth.context'

export const Route = createFileRoute('/_auth-guarded')({
  component: () => {
    const { user, state: authState } = useAuth()

    const navigate = useNavigate()

    useEffect(() => {
      const path = window.location.pathname
      if (authState === AuthState.NotSignedIn)
        navigate({
          to: '/sign-in',
          search:
            path === '/'
              ? undefined
              : {
                  referrer: path,
                },
        })
    }, [authState, navigate])

    if (
      authState === AuthState.LoadingSession ||
      authState === AuthState.NotSignedIn ||
      authState === AuthState.LoadingUserData
    ) {
      return <LoadingSessionTemplate />
    }

    return user ? <Outlet /> : <ChooseNicknameTemplate />
  },
})
