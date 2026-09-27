'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PasswordInput } from '@/components/auth/password-input'
import { loginAction } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function WinkBrand() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs tracking-tighter shadow-sm">
        W
      </div>
      <span className="text-base font-bold tracking-tight text-foreground">
        Wink
      </span>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password) {
      toast.error('Please enter both email and password')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await loginAction({
        email: email.trim(),
        password,
      })

      if (result.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      toast.success('Signed in successfully!')
      router.push(result.redirectTo || '/feed')
      router.refresh()
    } catch {
      toast.error('Unable to sign in. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full p-6 sm:p-8 space-y-6">
      <WinkBrand />

      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="text-xs text-muted-foreground">
          Welcome back! Please enter your details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium text-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-medium text-foreground"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => toast.info('Password reset is coming soon')}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot?
            </button>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="w-full"
        >
          Sign in
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/sign-up"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </Card>
  )
}
