<template>
  <input ref="input" v-bind="getInputAttrs()" @change="onChange" />
</template>

<script setup lang="ts">
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  ssrContextKey,
  useAttrs,
  useCssModule,
} from 'vue'
import type { RadioOptions, RadioEmits } from './types'
import { registerRadio, restoreRadioGroup } from './controlled'
import { useRadioGroupContext } from '../RadioGroup/context'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'Radio', __SLOT__: Symbol('Radio'), inheritAttrs: false })
const styles = useCssModule()

const props = withDefaults(defineProps<RadioOptions>(), {
  name: undefined,
  id: undefined,
  className: undefined,
  disabled: false,
  required: false,
  checked: undefined,
  defaultChecked: undefined,
  ariaHidden: false,
})
const emit = defineEmits<RadioEmits>()
const input = ref<HTMLInputElement | null>(null)
const group = useRadioGroupContext()
const attrs = useAttrs()
const serverRendering = inject(ssrContextKey, null) !== null

const inputName = computed(() => props.name || group?.name.value)

const initialChecked = computed(
  () => (props.checked != null ? props.checked : props.defaultChecked) ?? false,
)
const selectionAttrs = computed(() =>
  serverRendering
    ? { checked: initialChecked.value }
    : props.checked === undefined
      ? { defaultChecked: initialChecked.value }
      : { defaultChecked: initialChecked.value, checked: props.checked },
)

function getInputAttrs() {
  return {
    type: 'radio',
    value: props.value,
    name: inputName.value,
    id: props.id,
    disabled: props.disabled,
    required: props.required,
    'aria-checked': props.checked ? ('true' as const) : ('false' as const),
    ...selectionAttrs.value,
    ...attrs,
    style: normalizeReactStyle(attrs.style),
    class: [attrs.class, props.className, styles['radio-input'], styles['radio']],
    'data-component': 'Radio',
  }
}

function warnMissingName() {
  if (!inputName.value && !props.ariaHidden) {
    console.warn(
      'A radio input must have a `name` attribute. Pass `name` as a prop directly to each Radio, or nest them in a `RadioGroup` component with a `name` prop',
    )
  }
}

warnMissingName()
onUpdated(warnMissingName)

let unregister: (() => void) | undefined

onMounted(() => {
  if (input.value) unregister = registerRadio(input.value, () => props.checked)
})
onBeforeUnmount(() => unregister?.())

function onChange(event: Event) {
  group?.onChange(event)
  emit('change', event)
  emit('update:checked', (event.currentTarget as HTMLInputElement).checked)
  void nextTick(() => {
    if (input.value) restoreRadioGroup(input.value)
  })
}

defineExpose({
  input,
  element: input,
  focus: (options?: FocusOptions) => input.value?.focus(options),
  blur: () => input.value?.blur(),
})
</script>
<style module src="./Radio.module.css" />
