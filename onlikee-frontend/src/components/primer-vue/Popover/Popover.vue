<script setup lang="ts">
import { computed, provide, shallowRef, useAttrs } from 'vue'
import { normalizeReactStyle } from '../internal/style'
import { popoverContextKey } from './context'
import type { PopoverComponentProps } from './types'
import classes from './Popover.module.css'

defineOptions({ name: 'Popover', inheritAttrs: false })
const props = withDefaults(defineProps<PopoverComponentProps>(), { caret: 'top' })
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const element = shallowRef<HTMLDivElement | null>(null)
provide(
  popoverContextKey,
  computed(() => props.open ?? false),
)
defineExpose({ element })
function rootAttrs() {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
}
</script>

<template>
  <div
    v-bind="rootAttrs()"
    ref="element"
    :as="as"
    data-component="Popover"
    :data-open="open ? '' : undefined"
    :data-relative="relative ? '' : undefined"
    :data-caret="caret"
    :class="[className, classes.Popover, attrs.class]"
    :style="normalizeReactStyle(attrs.style)"
  >
    <slot />
  </div>
</template>
