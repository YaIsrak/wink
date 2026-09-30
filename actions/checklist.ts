'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  getChecklistProgress,
  dismissChecklist,
} from '@/lib/services/checklist.service'
import type { ChecklistProgress } from '@/types/checklist'

export interface GetChecklistProgressActionResult {
  success?: boolean
  error?: string
  progress?: ChecklistProgress
}

export interface DismissChecklistActionResult {
  success?: boolean
  error?: string
}

export async function getChecklistProgressAction(): Promise<GetChecklistProgressActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    const progress = await getChecklistProgress(user.id)
    return {
      success: true,
      progress,
    }
  } catch (err: unknown) {
    console.error('Failed to get checklist progress:', err)
    const message =
      err instanceof Error ? err.message : 'Unable to load checklist progress'
    return { error: message }
  }
}

export async function dismissChecklistAction(): Promise<DismissChecklistActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Unauthorized. Please sign in.' }
    }

    await dismissChecklist(user.id)
    revalidatePath('/feed')

    return {
      success: true,
    }
  } catch (err: unknown) {
    console.error('Failed to dismiss checklist:', err)
    const message =
      err instanceof Error ? err.message : 'Unable to dismiss checklist'
    return { error: message }
  }
}
