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
    class="TextInput-base-wrapper"
    :class="[className, { 'TextInput-wrapper': !baseOnly }]"
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

<style scoped>
.TextInput-base-wrapper {
  --inner-action-size: var(--base-size-24, 24px);
  display: inline-flex;
  box-sizing: border-box;
  min-height: var(--base-size-32, 32px);
  overflow: hidden;
  font-size: var(--text-body-size-medium, 14px);
  line-height: var(--base-size-20, 20px);
  font-family: inherit;
  color: var(--fgColor-default, #1f2328);
  vertical-align: middle;
  cursor: text;
  background-color: var(--bgColor-default, #fff);
  border: var(--borderWidth-thin, 1px) solid var(--control-borderColor-rest, #d1d9e0);
  border-radius: var(--borderRadius-medium, 6px);
  outline: none;
  box-shadow: var(--shadow-inset, inset 0 1px 0 #1f23280a);
  align-items: stretch;
}
.TextInput-base-wrapper :deep(input), .TextInput-base-wrapper :deep(textarea) { cursor: text; }
.TextInput-base-wrapper :deep(select) { cursor: pointer; }
.TextInput-base-wrapper :deep(input::placeholder), .TextInput-base-wrapper :deep(textarea::placeholder), .TextInput-base-wrapper :deep(select::placeholder) { color: var(--fgColor-muted, #59636e); }
.TextInput-base-wrapper:where([data-trailing-action][data-focused]), .TextInput-base-wrapper:where([data-no-trailing-action]:focus-within) {
  border-color: var(--borderColor-accent-emphasis, #0969da);
  outline: var(--borderWidth-thick, 2px) solid var(--borderColor-accent-emphasis, #0969da);
  outline-offset: -1px;
}
.TextInput-base-wrapper :deep(> textarea) { padding: var(--base-size-12, 12px); }
.TextInput-base-wrapper:where([data-contrast]) { background-color: var(--control-bgColor-contrast, var(--bgColor-inset, #f6f8fa)); }
.TextInput-base-wrapper:where([data-disabled]) {
  color: var(--fgColor-disabled, #818b98);
  background-color: var(--control-bgColor-disabled, #eff2f5);
  border-color: var(--control-borderColor-disabled, #818b981a);
  box-shadow: none;
}
.TextInput-base-wrapper:where([data-disabled]) :deep(input), .TextInput-base-wrapper:where([data-disabled]) :deep(textarea), .TextInput-base-wrapper:where([data-disabled]) :deep(select) { cursor: not-allowed; }
.TextInput-base-wrapper:where([data-monospace]) { font-family: var(--fontStack-monospace, ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace); }
.TextInput-base-wrapper:where([data-validation='error']) { border-color: var(--borderColor-danger-emphasis, #cf222e); }
.TextInput-base-wrapper:where([data-validation='error']):where([data-trailing-action][data-focused]),
.TextInput-base-wrapper:where([data-validation='error']):where([data-no-trailing-action]):focus-within {
  border-color: var(--control-borderColor-danger, #cf222e);
  outline: 2px solid var(--control-borderColor-danger, #cf222e);
  outline-offset: -1px;
}
.TextInput-base-wrapper:where([data-validation='success']) { border-color: var(--bgColor-success-emphasis, #1f883d); }
.TextInput-base-wrapper:where([data-block]) { display: flex; width: 100%; align-self: stretch; }
@media screen and (min-width: 48rem) { .TextInput-base-wrapper { font-size: var(--text-body-size-medium, 14px); } }
.TextInput-base-wrapper:where([data-size='small']) {
  --inner-action-size: var(--base-size-20, 20px);
  min-height: var(--base-size-28, 28px);
  padding-top: 3px;
  padding-right: var(--base-size-8, 8px);
  padding-bottom: 3px;
  padding-left: var(--base-size-8, 8px);
  font-size: var(--text-body-size-small, 12px);
  line-height: var(--base-size-20, 20px);
}
.TextInput-base-wrapper:where([data-size='large']) {
  --inner-action-size: var(--base-size-28, 28px);
  height: var(--base-size-40, 40px);
  padding-top: 10px;
  padding-right: var(--base-size-8, 8px);
  padding-bottom: 10px;
  padding-left: var(--base-size-8, 8px);
}
.TextInput-base-wrapper:where([data-variant='small']) {
  min-height: 28px;
  padding-top: 3px;
  padding-right: var(--base-size-8, 8px);
  padding-bottom: 3px;
  padding-left: var(--base-size-8, 8px);
  line-height: var(--base-size-20, 20px);
}
.TextInput-base-wrapper:where([data-variant='large']) {
  padding-top: 10px;
  padding-right: var(--base-size-8, 8px);
  padding-bottom: 10px;
  padding-left: var(--base-size-8, 8px);
  font-size: var(--text-title-size-medium, 20px);
}
.TextInput-wrapper { padding-right: 0; padding-left: 0; }
.TextInput-wrapper :deep(> input), .TextInput-wrapper :deep(> select) { padding-right: 0; padding-left: 0; }
.TextInput-wrapper { background-repeat: no-repeat; background-position: right 8px center; }
.TextInput-wrapper :deep(> :not(:last-child)) { margin-right: var(--base-size-8, 8px); }
.TextInput-wrapper :deep(.TextInput-icon), .TextInput-wrapper :deep(.TextInput-action) { align-self: center; color: var(--fgColor-muted, #59636e); flex-shrink: 0; }
.TextInput-wrapper:where([data-leading-visual]) { padding-left: var(--base-size-8, 8px); }
.TextInput-wrapper:where([data-trailing-visual][data-no-trailing-action]) { padding-right: var(--base-size-8, 8px); }
.TextInput-wrapper:where([data-no-leading-visual][data-trailing-visual]) :deep(> input),
.TextInput-wrapper:where([data-no-leading-visual][data-trailing-visual]) :deep(> select),
.TextInput-wrapper:where([data-no-leading-visual][data-trailing-action]) :deep(> input),
.TextInput-wrapper:where([data-no-leading-visual][data-trailing-action]) :deep(> select) { padding-left: var(--base-size-8, 8px); }
.TextInput-wrapper:where([data-no-trailing-visual][data-no-trailing-action]) :deep(> input),
.TextInput-wrapper:where([data-no-trailing-visual][data-no-trailing-action]) :deep(> select) { padding-right: var(--base-size-8, 8px); }
.TextInput-wrapper:where([data-no-leading-visual][data-no-trailing-visual][data-no-trailing-action]) :deep(> input),
.TextInput-wrapper:where([data-no-leading-visual][data-no-trailing-visual][data-no-trailing-action]) :deep(> select) { padding-left: var(--base-size-12, 12px); padding-right: var(--base-size-12, 12px); }
.TextInput-wrapper:where([data-size='large']):where([data-leading-visual]) { padding-left: var(--base-size-12, 12px); }
.TextInput-wrapper:where([data-size='large']):where([data-trailing-visual][data-no-trailing-action]) { padding-right: var(--base-size-12, 12px); }
</style>
