<script setup lang="ts">
import { computed } from 'vue'
import { Dialog } from '../Dialog'
import type { DialogButtonProps } from '../Dialog/types'
import type { ConfirmationDialogProps } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<ConfirmationDialogProps>(), {
  cancelButtonContent: 'Cancel',
  confirmButtonContent: 'OK',
  confirmButtonType: 'normal',
  cancelButtonLoading: false,
  confirmButtonLoading: false,
  width: 'medium',
  height: 'auto',
})
defineSlots<{ default?: () => import('vue').VNodeChild }>()
const buttonToFocus = computed(
  () => props.overrideButtonFocus ?? (props.confirmButtonType === 'danger' ? 'cancel' : 'confirm'),
)
const footerButtons = computed<DialogButtonProps[]>(() => [
  {
    content: props.cancelButtonContent,
    onClick: () => props.onClose('cancel'),
    autoFocus: buttonToFocus.value === 'cancel',
    loading: props.cancelButtonLoading,
  },
  {
    content: props.confirmButtonContent,
    buttonType: props.confirmButtonType,
    onClick: () => props.onClose('confirm'),
    autoFocus: buttonToFocus.value === 'confirm',
    loading: props.confirmButtonLoading,
  },
])
</script>

<template>
  <Dialog
    :title="props.title"
    :on-close="props.onClose"
    :footer-buttons="footerButtons"
    :width="props.width"
    :height="props.height"
    :class-name="props.className"
    :class="$attrs.class"
    role="alertdialog"
    data-component="ConfirmationDialog"
    ><slot
  /></Dialog>
</template>
