<template>
  <input ref="input" v-bind="getInputAttrs()" @change="onChange" />
</template>
<script setup lang="ts">
import {
  inject,
  nextTick,
  onMounted,
  onUpdated,
  shallowRef,
  ssrContextKey,
  useAttrs,
  watch,
} from 'vue'
import { useCheckboxGroupContext } from '../CheckboxGroup/context'
import type { CheckboxEmits, CheckboxOptions } from './types'
import classes from './Checkbox.module.css'
import sharedClasses from './shared.module.css'
import { normalizeReactStyle } from '../internal/style'
defineOptions({ name: 'Checkbox', __SLOT__: Symbol('Checkbox'), inheritAttrs: false })
const props = withDefaults(defineProps<CheckboxOptions>(), {
  checked: undefined,
  defaultChecked: undefined,
  indeterminate: false,
  disabled: undefined,
  required: undefined,
  validationStatus: undefined,
  value: undefined,
  className: undefined,
})
const emit = defineEmits<CheckboxEmits>()
const attrs = useAttrs()
const serverRendering = inject(ssrContextKey, null) !== null
const input = shallowRef<HTMLInputElement | null>(null)
const group = useCheckboxGroupContext()
function getInputAttrs() {
  return {
    type: 'checkbox',
    disabled: props.disabled,
    required: props.required,
    ...(props.indeterminate || props.checked !== undefined
      ? { checked: props.indeterminate ? false : props.checked }
      : {}),
    ...(serverRendering
      ? { checked: props.indeterminate ? false : (props.checked ?? props.defaultChecked ?? false) }
      : {
          defaultChecked: props.indeterminate
            ? false
            : props.checked !== undefined
              ? props.checked
              : (props.defaultChecked ?? false),
        }),
    'aria-required': props.required ? ('true' as const) : ('false' as const),
    'aria-invalid': props.validationStatus === 'error' ? ('true' as const) : ('false' as const),
    value: props.value,
    name: props.value,
    ...attrs,
    style: normalizeReactStyle(attrs.style),
    class: [attrs.class, props.className, sharedClasses.Input, classes.Checkbox],
    'data-component': attrs['data-component'] ?? 'Checkbox',
  }
}
function synchronizeAriaChecked() {
  input.value?.setAttribute(
    'aria-checked',
    props.indeterminate ? 'mixed' : String(input.value.checked),
  )
}
function synchronize() {
  const node = input.value
  if (!node) return
  node.indeterminate = props.indeterminate
  if (props.indeterminate) node.checked = false
  else if (props.checked !== undefined) node.checked = props.checked
  synchronizeAriaChecked()
}
onMounted(synchronize)
onUpdated(synchronize)
if (group?.renderVersion) watch(group.renderVersion, synchronizeAriaChecked, { flush: 'post' })
function onChange(event: Event) {
  const node = event.currentTarget as HTMLInputElement
  const groupOnChange = group?.onChange
  groupOnChange?.(event)
  emit('change', event)
  emit('update:checked', node.checked)
  if (props.indeterminate) {
    node.indeterminate = true
    node.setAttribute('aria-checked', 'mixed')
  }
  // React restores controlled inputs after dispatch; uncontrolled ARIA updates on render.
  if (props.indeterminate || props.checked !== undefined || groupOnChange)
    void nextTick(synchronize)
}
defineExpose({
  input,
  element: input,
  focus: (options?: FocusOptions) => input.value?.focus(options),
  blur: () => input.value?.blur(),
})
</script>
