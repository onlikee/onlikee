<template>
  <span
    :id="context?.captionId.value"
    :class="[className, [classes['radio-group__caption']]]"
    :data-component="context?.parentName.value ? `${context.parentName.value}.Caption` : undefined"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import classes from './RadioGroup.module.css'
import { useChoiceGroupContext } from '../internal/components/CheckboxOrRadioGroup/context'

defineOptions({ name: 'RadioGroupCaption', __SLOT__: Symbol('RadioGroupCaption') })
defineProps<{ className?: string }>()
const context = useChoiceGroupContext()
</script>
