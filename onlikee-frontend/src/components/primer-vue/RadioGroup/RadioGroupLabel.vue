<template>
  <span
    :class="[
      className,
      'radio-group__label',
      { 'radio-group__visually-hidden': visuallyHidden }
    ]"
    :title="context?.required.value ? 'required field' : undefined"
    :data-label-disabled="context?.disabled.value ? '' : undefined"
    data-component="RadioGroup.Label"
  >
    <Stack
      v-if="context?.required.value"
      direction="horizontal"
      gap="none"
    >
      <div class="radio-group__label-children"><slot /></div>
      <span>*</span>
    </Stack>
    <slot v-else />
  </span>
</template>

<script setup lang="ts">
import { Stack } from '../Stack'
import { useRadioGroupContext } from './context'
import type { RadioGroupLabelProps } from './types'
import './RadioGroup.css'
defineOptions({ name: 'RadioGroupLabel', __SLOT__: Symbol('RadioGroupLabel') })
withDefaults(defineProps<RadioGroupLabelProps>(), { className: undefined, visuallyHidden: false })
const context = useRadioGroupContext()
</script>
