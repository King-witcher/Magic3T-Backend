import { Link, Navigate } from '@tanstack/react-router'
import { AuthErrorCodes, sendPasswordResetEmail } from 'firebase/auth'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { RiGoogleFill } from 'react-icons/ri'
import { Button, Input, Spinner } from '@/components/atoms'
import { AuthState, useAuth } from '@/contexts/auth.context.tsx'
import { auth } from '@/services/firebase'
import { isValidEmail } from '@/utils/isValidEmail'
import { LoadingSessionTemplate } from '../loading-session'

interface Props {
  referrer?: string
}

/** Handles the process of loading the auth state and requiring login, if the user is not signed in. */
export function SignInTemplate({ referrer = '/' }: Props) {
  const { authState, signInGoogle, signInEmail } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [hideResetPassword, setHideResetPassword] = useState(false)
  const [waiting, setWaiting] = useState(false)

  const {
    register,
    handleSubmit,
    setError: setFormError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const email = watch('email')

  const handleSignIn = useCallback(
    async (data: { email: string; password: string }) => {
      setWaiting(true)
      const error = await signInEmail(data.email, data.password)
      if (error === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS) {
        setError('Invalid credentials')
      }
      setWaiting(false)
    },
    [signInEmail]
  )

  const handleRecover = useCallback(async () => {
    if (!isValidEmail(email)) {
      setFormError('email', {})
      setError('Invalid email')
      return
    }

    setError(null)
    clearErrors()
    setHideResetPassword(true)
    setTimeout(() => setHideResetPassword(false), 5000)
    await sendPasswordResetEmail(auth, email)
  }, [email, setFormError, clearErrors])

  if (authState === AuthState.Loading || authState === AuthState.SignedIn) {
    return (
      <>
        {authState === AuthState.SignedIn && <Navigate to={referrer} />}
        <LoadingSessionTemplate />
      </>
    )
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-hextech-black">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-4 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Animated hex pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTMwIDFMMSAzMGwyOSAyOSAyOS0yOUwzMCAxeiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjQzhBQTZFIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')]" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          <h1 className="font-serif font-bold text-6xl text-gold-1 uppercase tracking-wider mb-2 drop-shadow-[0_0_20px_rgba(200,170,110,0.5)]">
            Magic3T
          </h1>
          <div className="h-0.5 w-32 mx-auto bg-linear-to-r from-transparent via-gold-3 to-transparent" />
        </div>

        {/* Main Form Container */}
        <form
          onSubmit={handleSubmit(handleSignIn)}
          className="relative backdrop-blur-xl bg-linear-to-b from-grey-3/90 to-grey-2/80 border-2 border-gold-5/30 rounded-lg p-8 shadow-2xl shadow-black/50"
        >
          {/* Decorative corner elements */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-gold-3" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-gold-3" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-gold-3" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-gold-3" />

          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="font-serif font-bold text-3xl text-gold-2 uppercase tracking-wide">
                Sign In
              </h2>
              <p className="text-grey-1 text-sm mt-2">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="text-gold-3 hover:text-gold-1 font-semibold transition-colors duration-200"
                  search={(prev) => ({ referrer: prev.referrer })}
                >
                  Create one
                </Link>
              </p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-gold-1 text-sm font-semibold uppercase tracking-wider"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                disabled={waiting}
                error={!!errors.email}
                {...register('email', { required: true })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">Email is required</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-gold-1 text-sm font-semibold uppercase tracking-wider"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                disabled={waiting}
                error={!!errors.password}
                {...register('password', { required: true })}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">Password is required</p>}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded px-4 py-2">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Forgot Password */}
            <div className="text-right">
              {hideResetPassword ? (
                <p className="text-blue-2 text-sm">Recovery email sent</p>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRecover}
                  className="normal-case! tracking-normal! p-0! h-auto"
                >
                  Forgot password?
                </Button>
              )}
            </div>

            {/* Sign In Button */}
            <Button type="submit" disabled={waiting} size="lg" className="w-full">
              {waiting ? (
                <>
                  <Spinner className="size-5" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-grey-1/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-grey-3/90 text-grey-1 uppercase tracking-wider">or</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={signInGoogle}
              className="w-full"
            >
              <RiGoogleFill size={24} />
              <span>Sign in with Google</span>
            </Button>
          </div>
        </form>

        {/* Footer decoration */}
        <div className="mt-8 text-center">
          <div className="h-px w-48 mx-auto bg-linear-to-r from-transparent via-gold-5/30 to-transparent" />
        </div>
      </div>
    </div>
  )
}
