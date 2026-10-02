<template>
  <span
    :class="[className, 'radio-group__validation']"
    :data-validation-status="variant"
    data-component="RadioGroup.Validation"
  >
    <span
      aria-hidden="true"
      class="radio-group__validation-icon"
      style="--inputValidation-iconSize: 16px"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path
          v-if="variant === 'error'"
          d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575ZM8 5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8 5Zm1 6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"
        />
        <path
          v-else
          d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0Z"
        />
      </svg>
    </span>
    <span
      :id="context?.validationMessageId.value ?? ''"
      class="radio-group__validation-text"
      style="--inputValidation-lineHeight: 1.3333333333333333"
    ><slot /></span>
  </span>
</template>

<script setup lang="ts">
import { useRadioGroupContext } from './context'
import type { RadioGroupValidationProps } from './types'
import './RadioGroup.css'
defineOptions({ name: 'RadioGroupValidation', __SLOT__: Symbol('RadioGroupValidation') })
defineProps<RadioGroupValidationProps & { className?: string }>()
const context = useRadioGroupContext()
</script>
