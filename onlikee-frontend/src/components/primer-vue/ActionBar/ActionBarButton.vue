<script setup lang="ts">
import { useAttrs, useSlots } from 'vue'
import { Button } from '../Button'
import { useActionBarItem } from './context'
import type { ActionBarButtonProps } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<ActionBarButtonProps>(), {
  type: 'button',
  loading: undefined,
  inactive: undefined,
  labelWrap: undefined,
})
const emit = defineEmits<{ click: [event: MouseEvent | KeyboardEvent] }>()
const slots = useSlots()
const attrs = useAttrs()
const iconButtonOnlyProps = new Set([
  'description',
  'tooltipDirection',
  'tooltip-direction',
  'unsafeDisableTooltip',
  'unsafe-disable-tooltip',
  'keyshortcuts',
  'keybindingHint',
  'keybinding-hint',
])
function buttonAttrs() {
  return Object.fromEntries(
    Object.entries(attrs).filter(([name]) => !iconButtonOnlyProps.has(name)),
  )
}
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
    v-bind="{ ...buttonAttrs(), ...props }"
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
