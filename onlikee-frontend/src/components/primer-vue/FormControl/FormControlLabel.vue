<template>
  <component
    :is="as"
    :id="id ?? context?.labelId.value"
    :for="
      as === 'label' && context?.isReferenced.value !== false
        ? htmlFor || context?.id.value
        : undefined
    "
    :class="[className, $style['form-control__label']]"
    :style="normalizeReactStyle(style)"
    :data-control-disabled="resolvedDisabled ? '' : undefined"
    :data-visually-hidden="visuallyHidden ? '' : undefined"
    data-component="FormControl.Label"
  >
    <span v-if="resolvedRequired || requiredText" :class="$style['form-control__required-text']">
      <span><slot /></span>
      <span :aria-hidden="requiredIndicator ? undefined : true">{{ requiredText ?? '*' }}</span>
    </span>
    <slot v-else />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormControlContext } from './context'
import type { FormControlLabelOptions } from './types'
import { normalizeReactStyle } from '../internal/style'
defineOptions({ name: 'FormControlLabel', __SLOT__: Symbol('FormControlLabel') })
const props = withDefaults(defineProps<FormControlLabelOptions>(), {
  as: 'label',
  htmlFor: undefined,
  id: undefined,
  className: undefined,
  visuallyHidden: false,
  disabled: undefined,
  required: undefined,
  requiredText: undefined,
  requiredIndicator: true,
})
const context = useFormControlContext()
const resolvedRequired = computed(() => props.required ?? context?.required.value)
const resolvedDisabled = computed(() => props.disabled ?? context?.disabled.value)
</script>
<style module src="./FormControlLabel.module.css" />
