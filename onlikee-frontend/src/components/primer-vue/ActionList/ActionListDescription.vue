<script setup lang="ts">
import classes from './ActionList.module.css'
import { computed, onMounted, onUpdated, ref, useAttrs } from 'vue'
import { useItemContext } from './context'
import { normalizeReactStyle } from '../internal/style'
import type { ActionListDescriptionProps } from './types'
defineOptions({
  name: 'ActionListDescription',
  __SLOT__: Symbol('ActionList.Description'),
  inheritAttrs: false,
})
const props = withDefaults(defineProps<ActionListDescriptionProps>(), {
  variant: 'inline',
  truncate: undefined,
  className: undefined,
  style: undefined,
})
const context = useItemContext(),
  attrs = useAttrs()
const element = ref<HTMLElement | null>(null)
const truncated = computed(() => props.variant !== 'block' && props.truncate)
const title = ref('')
function measure() {
  if (!truncated.value || !element.value) return
  const text = element.value.textContent || ''
  title.value = text
  context?.setTruncatedText?.(
    element.value.scrollWidth > element.value.clientWidth ? text : undefined,
  )
}
onMounted(measure)
onUpdated(measure)
</script>
<template>
  <component
    :is="truncated ? 'div' : 'span'"
    :id="
      variant === 'block' ? context?.blockDescriptionId.value : context?.inlineDescriptionId.value
    "
    ref="element"
    :class="[
      classes['action-list-description'],
      className,
      attrs.class,
      truncated && [classes['action-list-truncate']],
    ]"
    data-component="ActionList.Description"
    :data-inline="truncated || undefined"
    :title="truncated ? (context?.setTruncatedText ? '' : title) : undefined"
    :style="
      normalizeReactStyle(
        truncated
          ? { ...style, ...(attrs.style as object), '--truncate-max-width': '100%' }
          : (style ?? attrs.style),
      )
    "
  >
    <slot />
  </component>
</template>
