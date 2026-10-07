<script setup lang="ts">
import { ref, type StyleValue } from 'vue'
import { normalizeReactStyle } from '../style'

defineOptions({ inheritAttrs: false })
defineProps<{
  block?: boolean
  contrast?: boolean
  disabled?: boolean
  monospace?: boolean
  validationStatus?: 'error' | 'success'
  size?: 'small' | 'medium' | 'large'
  variant?: 'small' | 'medium' | 'large'
  width?: number | string
  minWidth?: number | string
  maxWidth?: number | string
  className?: string
  style?: StyleValue
  hasLeadingVisual?: boolean
  hasTrailingVisual?: boolean
  hasTrailingAction?: boolean
  isInputFocused?: boolean
  baseOnly?: boolean
}>()
const element = ref<HTMLSpanElement>()
const length = (value?: string | number) => typeof value === 'number' ? `${value}px` : value
defineExpose({ element })
</script>

<template>
  <span
    ref="element"
    v-bind="$attrs"
    :class="[$style['TextInput-base-wrapper'], className, { [$style['TextInput-wrapper']]: !baseOnly }]"
    :data-block="block || undefined"
    :data-contrast="contrast || undefined"
    :data-disabled="disabled || undefined"
    :data-focused="isInputFocused || undefined"
    :data-monospace="monospace || undefined"
    :data-size="size || undefined"
    :data-variant="variant || undefined"
    :data-validation="validationStatus || undefined"
    :data-trailing-action="hasTrailingAction || undefined"
    :data-no-trailing-action="hasTrailingAction ? undefined : true"
    :data-leading-visual="baseOnly ? undefined : hasLeadingVisual || undefined"
    :data-no-leading-visual="baseOnly ? undefined : hasLeadingVisual ? undefined : true"
    :data-trailing-visual="baseOnly ? undefined : hasTrailingVisual || undefined"
    :data-no-trailing-visual="baseOnly ? undefined : hasTrailingVisual ? undefined : true"
    :data-component="'data-component' in $attrs ? $attrs['data-component'] : 'TextInput'"
    :style="normalizeReactStyle([{ width: width ? length(width) : undefined, minWidth: minWidth ? length(minWidth) : undefined, maxWidth: maxWidth ? length(maxWidth) : undefined }, style])"
  ><slot /></span>
</template>

<style module src="./TextInputWrapper.module.css"></style>
