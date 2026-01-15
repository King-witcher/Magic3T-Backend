import { Link, Navigate } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { RiGoogleFill } from 'react-icons/ri'
import { Button, Input, Spinner } from '@/components/atoms'
import { AuthState, useAuth } from '@/contexts/auth.context.tsx'
import { LoadingSessionTemplate } from '../loading-session'

interface FormData {
  email: string
  password: string
  checkPassword: string
}

interface Props {
  referrer?: string
}

export function RegisterTemplate({ referrer = '/' }: Props) {
  const { authState, signInGoogle, registerEmail } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [waiting, setWaiting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const errorMap: Record<string, string> = {
    'auth/email-already-in-use': 'Já existe uma conta com o este email.',
    'auth/invalid-email': 'Email inválido',
    'auth/weak-password': 'Senha muito fraca',
  }

  const handleRegister = useCallback(
    async ({ email, password, checkPassword }: FormData) => {
      if (password !== checkPassword) {
        setError('Password does not match')
        return
      }

      setWaiting(true)
      setError(null)
      const error = await registerEmail(email, password)
      if (error) {
        setError(errorMap[error] || 'Unknown error')
      }
      setWaiting(false)
    },
    [registerEmail, errorMap]
  )

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
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-4 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
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
          onSubmit={handleSubmit(handleRegister)}
          className="relative backdrop-blur-xl bg-linear-to-b from-grey-3/90 to-grey-2/80 border-2 border-gold-5/30 p-8 shadow-2xl shadow-black/50"
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
                Register
              </h2>
              <p className="text-grey-1 text-sm mt-2">
                Already have an account?{' '}
                <Link
                  to="/sign-in"
                  className="text-gold-3 hover:text-gold-1 font-semibold transition-colors duration-200"
                  search={(prev) => ({ referrer: prev.referrer })}
                >
                  Sign in
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

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="checkPassword"
                className="block text-gold-1 text-sm font-semibold uppercase tracking-wider"
              >
                Confirm Password
              </label>
              <Input
                id="checkPassword"
                type="password"
                placeholder="Confirm your password"
                disabled={waiting}
                error={!!errors.checkPassword}
                {...register('checkPassword', { required: true })}
              />
              {errors.checkPassword && (
                <p className="text-red-400 text-xs mt-1">Please confirm your password</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded px-4 py-2">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Register Button */}
            <Button type="submit" disabled={waiting} size="lg" className="w-full">
              {waiting ? (
                <>
                  <Spinner className="size-5" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
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
