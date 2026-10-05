<template>
  <component
    :is="as"
    :id="id ?? context?.labelId.value"
    :for="as === 'label' && context?.isReferenced.value !== false ? htmlFor || context?.id.value : undefined"
    :class="[className, 'form-control__label']"
    :style="normalizeReactStyle(style)"
    :data-control-disabled="resolvedDisabled ? '' : undefined"
    :data-visually-hidden="visuallyHidden ? '' : undefined"
    data-component="FormControl.Label"
  >
    <span
      v-if="resolvedRequired || requiredText"
      class="form-control__required-text"
    >
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
const props = withDefaults(
  defineProps<FormControlLabelOptions>(),
  {
    as: 'label',
    htmlFor: undefined,
    id: undefined,
    className: undefined,
    visuallyHidden: false,
    disabled: undefined,
    required: undefined,
    requiredText: undefined,
    requiredIndicator: true
  }
)
const context = useFormControlContext()
const resolvedRequired = computed(() => props.required ?? context?.required.value)
const resolvedDisabled = computed(() => props.disabled ?? context?.disabled.value)
</script>

<style scoped>
.form-control__label {
  display: block;
  font-size: var(--text-body-size-medium, 14px);
  font-weight: var(--base-text-weight-semibold, 600);
  color: var(--fgColor-default, #1f2328);
  cursor: pointer;
  align-self: flex-start;

  &:where([data-control-disabled]) {
    color: var(--control-fgColor-disabled, #818b98);
    cursor: not-allowed;
  }

  &:where([data-visually-hidden]) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    /* stylelint-disable-next-line primer/spacing */
    margin: -1px;
    overflow: hidden;
    /* stylelint-disable-next-line property-no-deprecated */
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
    clip-path: inset(50%);
  }
}

.form-control__required-text {
  display: flex;
  column-gap: var(--base-size-4, 4px);
}
</style>
