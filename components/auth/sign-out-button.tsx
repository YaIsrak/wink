'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button, type ButtonProps } from '@/components/ui/button'
import { logoutAction } from '@/actions/auth'

export interface SignOutButtonProps extends Omit<ButtonProps, 'onClick'> {
  showIcon?: boolean
}

export function SignOutButton({
  variant = 'outline',
  size = 'default',
  showIcon = true,
  children,
  ...props
}: SignOutButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const handleSignOut = async () => {
    setIsPending(true)
    try {
      const result = await logoutAction()
      if (result.error) {
        toast.error(result.error)
        setIsPending(false)
        return
      }

      toast.success('Signed out successfully')
      router.push(result.redirectTo || '/login')
      router.refresh()
    } catch {
      toast.error('Failed to sign out. Please try again.')
      setIsPending(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      isLoading={isPending}
      {...props}
    >
      {showIcon && !isPending && <LogOut className="size-4" />}
      {children || 'Sign out'}
    </Button>
  )
}
