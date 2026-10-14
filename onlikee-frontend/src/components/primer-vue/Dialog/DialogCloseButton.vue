<script setup lang="ts">
import { XIcon } from '@onlikee/octicons-vue'
import { IconButton } from '../Button'

defineOptions({ name: 'DialogCloseButton', displayName: 'Dialog.CloseButton', inheritAttrs: false })
defineProps<{ onClose: () => void; onKeydown?: (event: KeyboardEvent) => void }>()
</script>

<template>
  <IconButton
    :icon="XIcon"
    aria-label="Close"
    variant="invisible"
    data-component="Dialog.CloseButton"
    @click="onClose"
    @keydown="onKeydown"
  />
</template>
