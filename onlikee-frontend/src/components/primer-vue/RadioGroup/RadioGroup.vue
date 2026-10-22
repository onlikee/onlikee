<script setup lang="ts">
import { h, shallowRef, toRef, useAttrs, useSlots } from 'vue'
import { provideRadioGroupContext } from './context'
import CheckboxOrRadioGroup from '../internal/components/CheckboxOrRadioGroup/CheckboxOrRadioGroup.vue'
import type { RadioGroupOptions, RadioGroupEmits } from './types'

defineOptions({ name: 'RadioGroup', inheritAttrs: false })
const props = withDefaults(defineProps<RadioGroupOptions>(), {
  disabled: false,
  required: false,
  dataComponent: 'RadioGroup',
})
const emit = defineEmits<RadioGroupEmits>()
const slots = useSlots()
const attrs = useAttrs()
const selected = shallowRef<string | null>(null)

provideRadioGroupContext({
  name: toRef(props, 'name'),
  disabled: toRef(props, 'disabled'),
  required: toRef(props, 'required'),
  captionId: shallowRef(),
  validationMessageId: shallowRef(),
  onChange(event) {
    const input = event.currentTarget as HTMLInputElement
    if (input.checked) selected.value = input.value
    emit('change', selected.value, event)
  },
})

const Render = () =>
  h(
    CheckboxOrRadioGroup,
    {
      id: props.id,
      disabled: props.disabled,
      required: props.required,
      className: props.className,
      ariaLabelledby: props.ariaLabelledby,
      dataComponent: props.dataComponent,
      class: attrs.class,
    },
    slots,
  )
</script>

<template><Render /></template>
