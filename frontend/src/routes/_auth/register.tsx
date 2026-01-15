import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { RiGoogleFill } from 'react-icons/ri'
import { Button, Input, Spinner } from '@/components/atoms'
import { Label } from '@/components/atoms/label'
import { useAuth } from '@/contexts/auth.context.tsx'

interface FormData {
  email: string
  password: string
  checkPassword: string
}

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
})

const errorMap: Record<string, string> = {
  'auth/email-already-in-use': 'Já existe uma conta com o este email.',
  'auth/invalid-email': 'Email inválido',
  'auth/weak-password': 'Senha muito fraca',
}

function RouteComponent() {
  const { signInGoogle, registerEmail } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [waiting, setWaiting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

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
    [registerEmail]
  )

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleRegister)}>
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
        <Label>Email</Label>
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
        <Label>Password</Label>
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
        <Label>Confirm Password</Label>
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
      <Button type="button" variant="secondary" size="lg" onClick={signInGoogle} className="w-full">
        <RiGoogleFill size={24} />
        <span>Sign in with Google</span>
      </Button>
    </form>
  )
}
