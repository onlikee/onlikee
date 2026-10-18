import DialogRoot from './Dialog.vue'
import DialogBody from './DialogBody.vue'
import DialogFooter from './DialogFooter.vue'
import DialogHeader from './DialogHeader.vue'
import DialogTitle from './DialogTitle.vue'
import DialogSubtitle from './DialogSubtitle.vue'
import DialogButtons from './DialogButtons.vue'
import DialogCloseButton from './DialogCloseButton.vue'
import type { WithSlotMarker } from '../composables/useSlots'

export const Dialog = Object.assign(DialogRoot, {
  Header: DialogHeader as WithSlotMarker<typeof DialogHeader>,
  Title: DialogTitle,
  Subtitle: DialogSubtitle,
  Body: DialogBody as WithSlotMarker<typeof DialogBody>,
  Footer: DialogFooter as WithSlotMarker<typeof DialogFooter>,
  Buttons: DialogButtons,
  CloseButton: DialogCloseButton,
})

export { DialogBody, DialogFooter }
export type { FocusTarget as DialogFocusTarget } from '../internal/focusTarget'
export type {
  DialogButtonProps,
  DialogSectionProps,
  DialogHeadingProps,
  DialogSectionInstance,
} from './types'
export type {
  DialogProps,
  DialogHeaderProps,
  DialogInstance,
  DialogCloseGesture,
  DialogWidth,
  DialogHeight,
} from './types'
