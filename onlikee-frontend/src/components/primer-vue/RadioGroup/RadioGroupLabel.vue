<template>
  <span
    :class="[
      className,
      classes['radio-group__label'],
      { [classes['radio-group__visually-hidden']]: visuallyHidden },
    ]"
    :title="context?.required.value ? 'required field' : undefined"
    :data-label-disabled="context?.disabled.value ? '' : undefined"
    :data-component="context?.parentName.value ? `${context.parentName.value}.Label` : undefined"
  >
    <Stack v-if="context?.required.value" direction="horizontal" gap="none">
      <div :class="[classes['radio-group__label-children']]"><slot /></div>
      <span>*</span>
    </Stack>
    <slot v-else />
  </span>
</template>

<script setup lang="ts">
import classes from './RadioGroup.module.css'
import { Stack } from '../Stack'
import { useChoiceGroupContext } from '../internal/components/CheckboxOrRadioGroup/context'
import type { RadioGroupLabelProps } from './types'

defineOptions({ name: 'RadioGroupLabel', __SLOT__: Symbol('RadioGroupLabel') })
withDefaults(defineProps<RadioGroupLabelProps>(), { className: undefined, visuallyHidden: false })
const context = useChoiceGroupContext()
</script>
