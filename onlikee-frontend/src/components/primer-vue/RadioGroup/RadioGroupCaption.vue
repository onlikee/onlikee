<template>
  <Text
    :id="context?.captionId.value"
    :class="[className, attrs.class, classes['radio-group__caption']]"
    :data-component="context?.parentName.value ? `${context.parentName.value}.Caption` : undefined"
  >
    <slot />
  </Text>
</template>

<script setup lang="ts">
import classes from './RadioGroup.module.css'
import { useAttrs } from 'vue'
import Text from '../Text/Text.vue'
import type { RadioGroupCaptionProps } from './types'
import { useChoiceGroupContext } from '../internal/components/CheckboxOrRadioGroup/context'

defineOptions({
  name: 'RadioGroupCaption',
  __SLOT__: Symbol('RadioGroupCaption'),
  inheritAttrs: false,
})
defineProps<RadioGroupCaptionProps>()
const context = useChoiceGroupContext()
const attrs = useAttrs()
</script>
