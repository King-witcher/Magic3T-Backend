import { Spinner } from '@/components/atoms'
import { AuthState, useAuth } from '@/contexts/auth.context'

const STATUS_MAP: Record<AuthState, string> = {
  [AuthState.LoadingSession]: 'Loading session',
  [AuthState.LoadingUserData]: 'Loading user data',
  [AuthState.NotSignedIn]: 'This message should never be seen. Please report a bug.',
  [AuthState.SignedInUnregistered]: 'This message should never be seen. Please report a bug.',
  [AuthState.SignedIn]: 'This message should never be seen. Please report a bug.',
}

export function LoadingSessionTemplate() {
  const { state } = useAuth()

  return (
    <div className="center h-full flex-col">
      <Spinner className="size-[50px]" />
      <span className="text-lg text-gold-1 font-bold mt-3">{STATUS_MAP[state]}</span>
      <p className="text-sm text-grey-1 text-center">
        If nothing shows up shortly, refresh the page.
      </p>
    </div>
  )
}
