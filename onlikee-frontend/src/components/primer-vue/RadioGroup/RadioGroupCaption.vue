<template>
  <span
    :id="context?.captionId.value"
    :class="[className, 'radio-group__caption']"
    data-component="RadioGroup.Caption"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { useRadioGroupContext } from './context'
import './RadioGroup.css'
defineOptions({ name: 'RadioGroupCaption', __SLOT__: Symbol('RadioGroupCaption') })
defineProps<{ className?: string }>()
const context = useRadioGroupContext()
</script>
