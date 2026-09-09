<template>
  <label class="form-control__label">
    <slot />
    <span
      v-if="required"
      class="required-mark"
    >*</span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormControlContext } from './context'

defineOptions({
  name: 'FormControlLabel'
})

const context = useFormControlContext()

const required = computed(() => context?.required.value ?? false)
</script>

<style scoped>
.form-control__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 600;
  color: var(--fgColor-default, #1f2328);
}

.required-mark {
  color: var(--fgColor-default, #1f2328);
}
</style>
