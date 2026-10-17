<script setup lang="ts">
import { ConfirmationDialog, type ConfirmationDialogCloseGesture } from '../ConfirmationDialog'
export interface TableErrorDialogProps {
  title?: string
  onRetry?: () => void
  onDismiss?: () => void
}
withDefaults(defineProps<TableErrorDialogProps>(), {
  title: 'Error',
  onRetry: undefined,
  onDismiss: undefined,
})
const emit = defineEmits<{ retry: []; dismiss: [] }>()
function close(gesture: ConfirmationDialogCloseGesture) {
  if (gesture === 'confirm') emit('retry')
  else emit('dismiss')
}
</script>
<template>
  <ConfirmationDialog
    :title="title"
    :on-close="close"
    confirm-button-content="Retry"
    cancel-button-content="Dismiss"
    ><slot
  /></ConfirmationDialog>
</template>
