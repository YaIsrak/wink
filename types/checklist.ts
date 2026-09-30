export type ChecklistStepId = 'profile' | 'follow' | 'post' | 'message'

export interface ChecklistStep {
  id: ChecklistStepId
  title: string
  description: string
  isCompleted: boolean
  actionText: string
}

export interface ChecklistProgress {
  isDismissed: boolean
  completedCount: number
  totalCount: number
  allCompleted: boolean
  steps: ChecklistStep[]
}
