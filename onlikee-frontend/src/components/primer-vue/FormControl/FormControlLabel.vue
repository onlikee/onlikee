<template>
  <component
    :is="as"
    :id="id ?? context?.labelId.value"
    :for="as === 'label' ? htmlFor || context?.controlId.value : undefined"
    :class="[className, context?.choice.value ? 'form-control__choice-label' : 'form-control__label']"
    :data-control-disabled="context?.disabled.value ? '' : undefined"
    :data-visually-hidden="visuallyHidden ? '' : undefined"
    data-component="FormControl.Label"
  >
    <span
      v-if="required || requiredText"
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
defineOptions({ name: 'FormControlLabel', __SLOT__: Symbol('FormControlLabel') })
withDefaults(
  defineProps<{
    as?: 'label' | 'legend' | 'span'
    htmlFor?: string
    id?: string
    className?: string
    visuallyHidden?: boolean
    requiredText?: string
    requiredIndicator?: boolean
  }>(),
  {
    as: 'label',
    htmlFor: undefined,
    id: undefined,
    className: undefined,
    visuallyHidden: false,
    requiredText: undefined,
    requiredIndicator: true
  }
)
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

.form-control__choice-label {
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
