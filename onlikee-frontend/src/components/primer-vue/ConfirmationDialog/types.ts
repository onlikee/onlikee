import type { VNodeChild } from 'vue'
import type { DialogHeight, DialogWidth } from '../Dialog/types'

export type ConfirmationDialogCloseGesture = 'confirm' | 'close-button' | 'cancel' | 'escape'

export interface ConfirmationDialogProps {
  onClose: (gesture: ConfirmationDialogCloseGesture) => void
  title: VNodeChild
  cancelButtonContent?: VNodeChild
  confirmButtonContent?: VNodeChild
  confirmButtonType?: 'normal' | 'primary' | 'danger'
  cancelButtonLoading?: boolean
  confirmButtonLoading?: boolean
  overrideButtonFocus?: 'cancel' | 'confirm'
  className?: string
  width?: DialogWidth
  height?: DialogHeight
}

export type ConfirmOptions = Omit<ConfirmationDialogProps, 'onClose'> & { content: VNodeChild }
