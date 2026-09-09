<template>
  <div
    class="form-control"
    :data-validation-variant="validationVariant"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { createFormControlContext, provideFormControlContext } from './context'

defineOptions({
  name: 'FormControl'
})

const props = withDefaults(defineProps<{
  required?: boolean
}>(), {
  required: false
})

const context = createFormControlContext(toRef(props, 'required'))

provideFormControlContext(context)

const validationVariant = context.validationVariant
</script>

<style scoped>
.form-control {
  display: grid;
  gap: 4px;
}

.form-control[data-validation-variant='error'] :deep(.input),
.form-control[data-validation-variant='error'] :deep(.input-wrapper),
.form-control[data-validation-variant='error'] :deep(.textarea) {
  border-color: var(--borderColor-danger-emphasis, #cf222e);
}

.form-control[data-validation-variant='error'] :deep(.input:focus),
.form-control[data-validation-variant='error'] :deep(.input-wrapper:focus-within),
.form-control[data-validation-variant='error'] :deep(.textarea:focus) {
  outline: 2px solid var(--borderColor-danger-emphasis, #cf222e);
  outline-offset: -1px;
}

.form-control[data-validation-variant='error'] :deep(.input-wrapper .input:focus) {
  outline: none;
}

.form-control[data-validation-variant='success'] :deep(.input),
.form-control[data-validation-variant='success'] :deep(.input-wrapper),
.form-control[data-validation-variant='success'] :deep(.textarea) {
  border-color: var(--borderColor-success-emphasis, #1a7f37);
}
</style>
