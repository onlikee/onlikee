<script setup lang="ts">
import { inject, onBeforeMount, onBeforeUnmount, shallowRef, useAttrs } from 'vue'
import { registerEscapeHandler, registerOutsideClickHandler } from '../internal/documentRegistries'
import { normalizeReactStyle } from '../internal/style'
import { popoverContextKey } from './context'
import type { PopoverContentComponentProps } from './types'
import classes from './Popover.module.css'

defineOptions({ name: 'PopoverContent', inheritAttrs: false })
const props = withDefaults(defineProps<PopoverContentComponentProps>(), {
  width: 'small',
  height: 'fit-content',
})
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const element = shallowRef<HTMLDivElement | null>(null)
const open = inject(popoverContextKey, undefined)
function contentAttrs() {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
}

let unregisterOutside: (() => void) | undefined
let unregisterEscape: (() => void) | undefined
// beforeMount registers parent layers before their descendants.
onBeforeMount(() => {
  unregisterOutside = registerOutsideClickHandler((event) => {
    if (event.button > 0 || element.value?.contains(event.target as Node)) return true
    if (props.ignoreClickRefs?.some((ref) => ref.value?.contains(event.target as Node))) return true
    props.onClickOutside?.(event)
    return undefined
  })
  unregisterEscape = registerEscapeHandler((event) => {
    if (open?.value && props.onEscape) {
      props.onEscape(event)
      event.preventDefault()
    }
  })
})
onBeforeUnmount(() => {
  unregisterOutside?.()
  unregisterEscape?.()
})
</script>

<template>
  <div
    ref="element"
    :as="as"
    data-component="Popover.Content"
    :data-width="width"
    :data-height="height"
    :overflow="overflow"
    v-bind="contentAttrs()"
    :class="[className, classes.PopoverContent, attrs.class]"
    :style="normalizeReactStyle(attrs.style)"
  >
    <slot />
  </div>
</template>
