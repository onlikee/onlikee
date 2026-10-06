<script setup lang="ts">
import { computed } from 'vue'
import Button from '../SelectPanel/SelectPanelButton.vue'
import { useActionBarItem } from './context'
import type { ActionBarIconButtonProps } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<ActionBarIconButtonProps>(), { loading: undefined, inactive: undefined, labelWrap: undefined })
const normalizedProps = props as typeof props & { ariaLabel: string }
const buttonProps = computed(() => {
  const { ariaLabel, ...rest } = normalizedProps
  return { ...rest, 'aria-label': ariaLabel }
})
const emit = defineEmits<{ click: [event: MouseEvent | KeyboardEvent] }>()
function click(event: MouseEvent | KeyboardEvent) {
  if (props.disabled || props.loading) { event.preventDefault(); return }
  emit('click', event)
}
const { element, setElement, dataOverflowing, size } = useActionBarItem(() => ({
  label: normalizedProps.ariaLabel, leadingVisual: props.icon, disabled: props.disabled, onClick: click
}))
defineExpose({ element, focus: (options?: FocusOptions) => element.value?.focus(options) })
</script>

<template>
  <Button
    v-bind="{ ...$attrs, ...buttonProps }"
    :ref="setElement"
    :disabled="false"
    :aria-disabled="disabled || undefined"
    :size="props.size ?? size"
    variant="invisible"
    :data-overflowing="dataOverflowing"
    @click="click"
  />
</template>
