'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  updateUserProfile,
  getFullUserProfileByUsername,
} from '@/lib/services/user.service'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validation/profile'
import type { UserProfileData } from '@/types/profile'

export interface UpdateProfileActionResult {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  user?: Partial<UserProfileData>
}

export interface GetProfileDataActionResult {
  success?: boolean
  error?: string
  profile?: UserProfileData | null
}

export async function updateProfileDetailsAction(
  data: UpdateProfileInput
): Promise<UpdateProfileActionResult> {
  const parsed = updateProfileSchema.safeParse(data)

  if (!parsed.success) {
    return {
      error: 'Please correct the validation errors in your profile details.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
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

    const updated = await updateUserProfile(user.id, parsed.data)

    revalidatePath('/profile/[username]', 'page')
    revalidatePath(`/profile/${updated.username}`, 'page')
    revalidatePath('/feed', 'page')

    return {
      success: true,
      user: {
        id: updated.id,
        displayName: updated.displayName,
        bio: updated.bio,
        location: updated.location,
        website: updated.website,
        avatarUrl: updated.avatarUrl,
      },
    }
  } catch (err: unknown) {
    console.error('Failed to update profile:', err)
    const message =
      err instanceof Error ? err.message : 'Unable to update profile details'
    return { error: message }
  }
}

export async function getProfileDataAction(
  username: string
): Promise<GetProfileDataActionResult> {
  if (!username || typeof username !== 'string') {
    return { error: 'Invalid username' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const profile = await getFullUserProfileByUsername(username, user?.id)

    if (!profile) {
      return { error: 'Profile not found' }
    }

    return {
      success: true,
      profile,
    }
  } catch (err: unknown) {
    console.error('Failed to fetch profile data:', err)
    const message =
      err instanceof Error ? err.message : 'Unable to load profile data'
    return { error: message }
  }
}
