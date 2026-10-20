<script setup lang="ts">
import { computed, shallowRef, useAttrs } from 'vue'
import type { BaseOverlayOptions } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'BaseOverlay', inheritAttrs: false })
const props = withDefaults(defineProps<BaseOverlayOptions>(), { as: 'div' })
const attrs = useAttrs()
const element = shallowRef<HTMLElement | null>(null)
function setElement(value: unknown) {
  const instance = value as { element?: HTMLElement; $el?: HTMLElement } | null
  element.value =
    value instanceof HTMLElement ? value : (instance?.element ?? instance?.$el ?? null)
}
const px = (value: string | number | undefined) =>
  typeof value === 'number' ? `${value}px` : value
const style = computed(() =>
  normalizeReactStyle([
    {
      '--top': px(props.top),
      '--left': px(props.left),
      '--right': px(props.right),
      '--bottom': px(props.bottom),
      position: props.position,
    },
    props.style,
  ]),
)
defineExpose({ element })
</script>

<template>
  <component
    :is="as"
    :ref="setElement"
    v-bind="attrs"
    :class="[className, $style.Overlay]"
    :style="style"
    :role="role"
    :overflow="overflow"
    :responsive-variant="responsiveVariant"
    :[`data-width-${width}`]="''"
    :[`data-height-${height}`]="''"
    :[`data-visibility-${visibility}`]="''"
    :[`data-max-width-${maxWidth}`]="maxWidth ? '' : undefined"
    :[`data-max-height-${maxHeight}`]="maxHeight ? '' : undefined"
    :[`data-overflow-${overflow}`]="overflow ? '' : undefined"
  >
    <slot />
  </component>
</template>

<style module src="./Overlay.module.css" />
