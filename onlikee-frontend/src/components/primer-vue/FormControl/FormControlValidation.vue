<template>
  <span
    class="form-control__validation"
    :data-variant="variant"
  >
    <span class="prc-components-ValidationIcon">
      <svg
        v-if="variant === 'error'"
        aria-hidden="true"
        focusable="false"
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="currentColor"
      ><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575ZM8 5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8 5Zm1 6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z" /></svg>
      <svg
        v-else
        aria-hidden="true"
        focusable="false"
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="currentColor"
      ><path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm3.78-9.72a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018L6.75 9.19 5.28 7.72a.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042l2 2a.75.75 0 0 0 1.06 0Z" /></svg>
    </span>
    <span class="prc-components-ValidationText">
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { useFormControlContext, type FormControlValidationVariant } from './context'

defineOptions({
  name: 'FormControlValidation'
})

const props = withDefaults(defineProps<{
  variant?: FormControlValidationVariant
}>(), {
  variant: 'error'
})

const context = useFormControlContext()

if (context) {
  watch(() => props.variant, (variant) => {
    context.validationVariant.value = variant
  }, { immediate: true })

  onBeforeUnmount(() => {
    context.validationVariant.value = null
  })
}
</script>

<style scoped>
.form-control__validation {
  display: flex;
  font-size: 12px;
  line-height: 1.3333333333;
  font-weight: 600;
}

.prc-components-ValidationIcon {
  display: flex;
  min-height: auto;
  margin-inline-end: 4px;
  -webkit-margin-end: 4px;
  margin-top: 2px;
  align-items: center;
}

.prc-components-ValidationText {
  line-height: 1.3333333333;
}

.form-control__validation[data-variant='error'] {
  color: var(--fgColor-danger, #d1242f);
}

.form-control__validation[data-variant='success'] {
  color: var(--fgColor-success, #1a7f37);
}
</style>
