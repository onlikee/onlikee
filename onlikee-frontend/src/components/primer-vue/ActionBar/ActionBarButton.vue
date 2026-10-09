<script setup lang="ts">
import { useSlots } from 'vue'
import Button from '../SelectPanel/SelectPanelButton.vue'
import { useActionBarItem } from './context'
import type { ActionBarButtonProps } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<ActionBarButtonProps>(), {
  loading: undefined,
  inactive: undefined,
  labelWrap: undefined,
})
const emit = defineEmits<{ click: [event: MouseEvent | KeyboardEvent] }>()
const slots = useSlots()
function click(event: MouseEvent | KeyboardEvent) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
const { element, setElement, dataOverflowing, size } = useActionBarItem(() => ({
  label: () => slots.default?.(),
  leadingVisual: props.leadingVisual,
  disabled: props.disabled,
  onClick: click,
}))
defineExpose({ element, focus: (options?: FocusOptions) => element.value?.focus(options) })
</script>

<template>
  <Button
    v-bind="{ ...$attrs, ...props }"
    :ref="setElement"
    :disabled="false"
    :aria-disabled="disabled || undefined"
    :size="props.size ?? size"
    variant="invisible"
    :data-overflowing="dataOverflowing"
    @click="click"
  >
    <slot />
  </Button>
</template>
