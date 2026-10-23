import type { HTMLAttributes } from 'vue'

export type StateLabelStatus =
  | 'issueOpened'
  | 'pullOpened'
  | 'issueClosed'
  | 'issueClosedNotPlanned'
  | 'pullClosed'
  | 'pullMerged'
  | 'draft'
  | 'issueDraft'
  | 'pullQueued'
  | 'unavailable'
  | 'alertOpened'
  | 'alertFixed'
  | 'alertDismissed'
  | 'alertClosed'
  | 'open'
  | 'closed'
  | 'archived'

export interface StateLabelProps extends /* @vue-ignore */ HTMLAttributes {
  status: StateLabelStatus
  size?: 'small' | 'medium'
  /** @deprecated Use size instead. */
  variant?: 'normal' | 'small'
  className?: string
}
