'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  signUpSchema,
  loginSchema,
  type SignUpInput,
  type LoginInput,
} from '@/lib/validation/auth'
import {
  isUsernameAvailable,
  isEmailAvailable,
  createUserProfile,
  getUserProfileById,
} from '@/lib/services/auth.service'

export interface AuthActionResult {
  success?: boolean
  error?: string
  redirectTo?: string
}

export async function signUpAction(data: SignUpInput): Promise<AuthActionResult> {
  const validation = signUpSchema.safeParse(data)
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message ?? 'Invalid registration data'
    return { error: firstError }
  }

  const { email, password, username, displayName } = validation.data

  try {
    const usernameAvailable = await isUsernameAvailable(username)
    if (!usernameAvailable) {
      return { error: 'This username is already taken. Please choose another one.' }
    }

    const emailAvailable = await isEmailAvailable(email)
    if (!emailAvailable) {
      return { error: 'An account with this email address already exists.' }
    }

    const admin = createAdminClient()
    let userId: string

    // 1. Create confirmed user directly via Admin API so session is immediately active
    const { data: createdData, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        displayName,
      },
    })

    if (createError) {
      // If user was created in auth previously without confirmation, update them
      if (createError.message.toLowerCase().includes('already been registered')) {
        const { data: listData } = await admin.auth.admin.listUsers()
        const existing = listData?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
        if (existing) {
          await admin.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
            user_metadata: { username, displayName },
          })
          userId = existing.id
        } else {
          return { error: createError.message }
        }
      } else {
        return { error: createError.message }
      }
    } else if (createdData?.user) {
      userId = createdData.user.id
    } else {
      return { error: 'Unable to create user account. Please try again.' }
    }

    // 2. Ensure Prisma database profile exists
    const existingProfile = await getUserProfileById(userId)
    if (!existingProfile) {
      await createUserProfile({
        id: userId,
        email,
        username,
        displayName,
      })
    }

    // 3. Immediately establish active session cookies using client
    const supabase = await createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Post sign up sign in error:', signInError)
    }

    return {
      success: true,
      redirectTo: '/onboarding',
    }
  } catch (err: unknown) {
    console.error('Registration failed:', err)
    return {
      error: 'An unexpected error occurred during account creation. Please try again.',
    }
  }
}

export async function loginAction(data: LoginInput): Promise<AuthActionResult> {
  const validation = loginSchema.safeParse(data)
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message ?? 'Invalid login data'
    return { error: firstError }
  }

  const { email, password } = validation.data

  try {
    const supabase = await createClient()
    let { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // If login failed due to unconfirmed email, auto confirm and retry
    if (authError && (authError.message.toLowerCase().includes('confirm') || authError.status === 400)) {
      try {
        const admin = createAdminClient()
        const { data: listData } = await admin.auth.admin.listUsers()
        const matched = listData?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
        if (matched && !matched.email_confirmed_at) {
          await admin.auth.admin.updateUserById(matched.id, { email_confirm: true })
          const retry = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          authError = retry.error
        }
      } catch (adminErr) {
        console.error('Admin auto confirm retry error:', adminErr)
      }
    }

    if (authError) {
      return { error: authError.message || 'Invalid email or password' }
    }

    return {
      success: true,
      redirectTo: '/feed',
    }
  } catch (err: unknown) {
    console.error('Sign in failed:', err)
    return {
      error: 'An unexpected error occurred while signing in. Please try again.',
    }
  }
}

export async function logoutAction(): Promise<AuthActionResult> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return {
      success: true,
      redirectTo: '/login',
    }
  } catch (err: unknown) {
    console.error('Sign out failed:', err)
    return {
      error: 'Unable to sign out. Please try again.',
    }
  }
}
