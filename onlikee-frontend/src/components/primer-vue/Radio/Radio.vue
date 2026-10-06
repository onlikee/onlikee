<template>
  <input
    ref="input"
    v-bind="getInputAttrs()"
    @change="onChange"
  >
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, ssrContextKey, useAttrs } from 'vue'
import type { RadioOptions, RadioEmits } from './types'
import { registerRadio, restoreRadioGroup } from './controlled'
import { useRadioGroupContext } from '../RadioGroup/context'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'Radio', __SLOT__: Symbol('Radio'), inheritAttrs: false })

const props = withDefaults(defineProps<RadioOptions>(), {
  name: undefined,
  id: undefined,
  className: undefined,
  disabled: false,
  required: false,
  checked: undefined,
  defaultChecked: undefined,
  ariaHidden: false
})
const emit = defineEmits<RadioEmits>()
const input = ref<HTMLInputElement | null>(null)
const group = useRadioGroupContext()
const attrs = useAttrs()
const serverRendering = inject(ssrContextKey, null) !== null

const inputName = computed(() => props.name || group?.name.value)

const initialChecked = computed(() => (props.checked != null ? props.checked : props.defaultChecked) ?? false)
const selectionAttrs = computed(() =>
  serverRendering
    ? { checked: initialChecked.value }
    : props.checked === undefined
    ? { defaultChecked: initialChecked.value }
    : { defaultChecked: initialChecked.value, checked: props.checked }
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
    class: [attrs.class, props.className, 'radio-input', 'radio'],
    'data-component': 'Radio'
  }
}

function warnMissingName() {
  if (!inputName.value && !props.ariaHidden) {
    console.warn(
      'A radio input must have a `name` attribute. Pass `name` as a prop directly to each Radio, or nest them in a `RadioGroup` component with a `name` prop'
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
  blur: () => input.value?.blur()
})
</script>

<style scoped>
.radio-input {
  position: relative;
  display: grid;
  width: var(--base-size-16, 16px);
  height: var(--base-size-16, 16px);
  margin: 0;

  /* 2px to center align with label (20px line-height) */
  margin-top: var(--base-size-2, 2px);
  cursor: pointer;
  background-color: var(--bgColor-default, #ffffff);
  border-color: var(--control-borderColor-emphasis, #818b98);
  border-style: solid;
  border-width: var(--borderWidth-thin, 1px);
  appearance: none;
  place-content: center;

  &:disabled {
    background-color: var(--control-bgColor-disabled, #eff2f5);
    border-color: var(--control-borderColor-disabled, #818b981a);
  }
}

.radio {
  border-radius: var(--borderRadius-full, 100vh);
  transition:
    background-color,
    border-color 80ms cubic-bezier(0.33, 1, 0.68, 1); /* checked -> unchecked - add 120ms delay to fully see animation-out */

  &:where(:checked) {
    /* stylelint-disable-next-line primer/colors */
    background-color: var(--control-checked-fgColor-rest, #ffffff);

    /* using bgColor here to avoid a border change in dark high contrast */
    /* stylelint-disable-next-line primer/colors */
    border-color: var(--control-checked-bgColor-rest, #0969da);
    border-width: var(--borderWidth-thicker, 4px);

    &:disabled {
      cursor: not-allowed;
      /* stylelint-disable-next-line primer/colors */
      background-color: var(--control-checked-fgColor-disabled, #ffffff);
      /* stylelint-disable-next-line primer/colors */
      border-color: var(--control-checked-bgColor-disabled, #818b98);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--focus-outline-color, var(--focus-outlineColor, #0969da));
    outline-offset: 2px;
    box-shadow: none;
  }

  @media (forced-colors: active) {
    background-color: canvastext;
    border-color: canvastext;
  }
}
</style>
