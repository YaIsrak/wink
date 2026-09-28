'use server'

import { createClient } from '@/lib/supabase/server'
import {
  onboardingSchema,
  type OnboardingInput,
} from '@/lib/validation/onboarding'
import {
  completeUserOnboarding,
  skipUserOnboarding,
} from '@/lib/services/user.service'

export interface OnboardingActionResult {
  success?: boolean
  error?: string
  redirectTo?: string
}

export async function completeOnboardingAction(
  data: OnboardingInput
): Promise<OnboardingActionResult> {
  const validation = onboardingSchema.safeParse(data)
  if (!validation.success) {
    const firstError =
      validation.error.issues[0]?.message ?? 'Invalid onboarding details'
    return { error: firstError }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Your session has expired. Please sign in again.' }
    }

    await completeUserOnboarding(user.id, validation.data)

    return {
      success: true,
      redirectTo: '/feed',
    }
  } catch (err: unknown) {
    console.error('Failed to complete onboarding:', err)
    return {
      error:
        'An unexpected error occurred while saving your profile. Please try again.',
    }
  }
}

export async function skipOnboardingAction(): Promise<OnboardingActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Your session has expired. Please sign in again.' }
    }

    await skipUserOnboarding(user.id)

    return {
      success: true,
      redirectTo: '/feed',
    }
  } catch (err: unknown) {
    console.error('Failed to skip onboarding:', err)
    return {
      error:
        'An unexpected error occurred while skipping onboarding. Please try again.',
    }
  }
}
