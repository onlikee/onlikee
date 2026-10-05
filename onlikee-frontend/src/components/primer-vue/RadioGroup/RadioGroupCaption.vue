<template>
  <span
    :id="context?.captionId.value"
    :class="[className, 'radio-group__caption']"
    :data-component="context?.parentName.value ? `${context.parentName.value}.Caption` : undefined"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { useChoiceGroupContext } from '../internal/components/CheckboxOrRadioGroup/context'
import './RadioGroup.css'
defineOptions({ name: 'RadioGroupCaption', __SLOT__: Symbol('RadioGroupCaption') })
defineProps<{ className?: string }>()
const context = useChoiceGroupContext()
</script>
