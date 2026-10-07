<template>
  <input
    ref="input"
    v-bind="getInputAttrs()"
    @change="onChange"
  >
</template>
<script setup lang="ts">
import { inject, nextTick, onMounted, onUpdated, ref, ssrContextKey, useAttrs, useCssModule } from 'vue'
import { useCheckboxGroupContext } from '../CheckboxGroup/context'
import type { CheckboxEmits } from './types'
import { normalizeReactStyle } from '../internal/style'
defineOptions({ name: 'Checkbox', __SLOT__: Symbol('Checkbox'), inheritAttrs: false })
const props = withDefaults(defineProps<{
  checked?: boolean
  defaultChecked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  required?: boolean
  validationStatus?: 'error' | 'success'
  value?: string
  className?: string
}>(), { checked: undefined, defaultChecked: undefined, indeterminate: false, disabled: undefined, required: undefined, validationStatus: undefined, value: undefined, className: undefined })
const emit = defineEmits<CheckboxEmits>()
const attrs = useAttrs()
const classes = useCssModule()
const serverRendering = inject(ssrContextKey, null) !== null
const input = ref<HTMLInputElement | null>(null)
const group = useCheckboxGroupContext()
function getInputAttrs() {
  return {
    type: 'checkbox', disabled: props.disabled, required: props.required,
    ...(props.indeterminate || props.checked !== undefined ? { checked: props.indeterminate ? false : props.checked } : {}),
    ...(serverRendering
      ? { checked: props.indeterminate ? false : props.checked ?? props.defaultChecked ?? false }
      : { defaultChecked: props.indeterminate ? false : (props.checked !== undefined ? props.checked : props.defaultChecked ?? false) }),
    'aria-required': props.required ? 'true' as const : 'false' as const,
    'aria-invalid': props.validationStatus === 'error' ? 'true' as const : 'false' as const,
    ...(serverRendering ? {} : { 'aria-checked': props.indeterminate ? 'mixed' as const : props.checked ? 'true' as const : 'false' as const }),
    value: props.value, name: props.value, ...attrs,
    style: normalizeReactStyle(attrs.style),
    class: [attrs.class, props.className, classes['checkbox-input']],
    'data-component': attrs['data-component'] ?? 'Checkbox'
  }
}
function synchronize() {
  const node = input.value
  if (!node) return
  node.indeterminate = props.indeterminate
  if (props.indeterminate) node.checked = false
  else if (props.checked !== undefined) node.checked = props.checked
  node.setAttribute('aria-checked', props.indeterminate ? 'mixed' : String(node.checked))
}
onMounted(synchronize)
onUpdated(synchronize)
function onChange(event: Event) {
  const node = event.currentTarget as HTMLInputElement
  group?.onChange(event)
  emit('change', event)
  emit('update:checked', node.checked)
  if (props.indeterminate) { node.indeterminate = true; node.setAttribute('aria-checked', 'mixed') }
  void nextTick(synchronize)
}
defineExpose({ input, element: input, focus: (options?: FocusOptions) => input.value?.focus(options), blur: () => input.value?.blur() })
</script>
<style module src="./Checkbox.module.css"></style>
