<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, useAttrs } from 'vue'
import type { DetailsProps } from './types'
import classes from './Details.module.css'
import { normalizeReactStyle } from '../internal/style'
import { captureToggle, forwardToggle, registerToggleHandler } from './toggleEvents'

// eslint-disable-next-line vue/no-reserved-component-names -- Keep the public component name.
defineOptions({ name: 'Details', inheritAttrs: false })
const props = defineProps<DetailsProps>()
const emit = defineEmits<{ toggle: [event: ToggleEvent] }>()
const normalizedProps = props as typeof props & { dataComponent?: string }
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const element = shallowRef<HTMLDetailsElement | null>(null)
let unregisterToggle: (() => void) | undefined
function bindings() {
  const { class: classValue, style, 'data-component': dataComponent, ...rest } = attrs
  return {
    class: [props.className, classValue, classes.Details],
    ...rest,
    style: normalizeReactStyle(style),
    'data-component': normalizedProps.dataComponent ?? dataComponent ?? 'Details',
  }
}
onMounted(() => {
  if (element.value)
    unregisterToggle = registerToggleHandler(element.value, (event) =>
      emit('toggle', event as ToggleEvent),
    )
  if (
    import.meta.env.DEV &&
    element.value &&
    !element.value.querySelector('summary:not([data-default-summary])')
  )
    console.warn(
      'Warning:',
      'The <Details> component must have a <summary> child component. You can either use <Details.Summary> or a native <summary> element.',
    )
})
onBeforeUnmount(() => unregisterToggle?.())
defineExpose({ element })
</script>

<template>
  <details
    ref="element"
    v-bind="bindings()"
    @toggle="forwardToggle"
    @toggle.capture="captureToggle"
  >
    <slot />
  </details>
</template>
