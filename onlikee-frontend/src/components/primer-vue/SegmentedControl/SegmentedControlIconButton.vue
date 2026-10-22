<script setup lang="ts">
import { useAttrs, type ButtonHTMLAttributes } from 'vue'
import Tooltip from '../Tooltip/Tooltip.vue'
import RenderVisual from '../internal/components/RenderVisual'
import { normalizeReactStyle } from '../internal/style'
import type { SegmentedControlIconButtonProps } from './types'

defineOptions({
  name: 'SegmentedControlIconButton',
  __SLOT__: Symbol('SegmentedControl.IconButton'),
  inheritAttrs: false,
})
const props = withDefaults(defineProps<SegmentedControlIconButtonProps>(), {
  selected: undefined,
  defaultSelected: undefined,
  disabled: undefined,
})
const attrs = useAttrs()
const normalizedProps = props as typeof props & { ariaLabel: string }
function buttonAttrs() {
  const { class: _class, 'aria-disabled': ariaDisabled, ...rest } = attrs
  return {
    'aria-disabled':
      props.disabled || (ariaDisabled as ButtonHTMLAttributes['aria-disabled']) || undefined,
    ...rest,
    style: normalizeReactStyle(rest.style),
  }
}
</script>

<template>
  <li
    :class="[$style.Item, className, $attrs.class]"
    :data-selected="selected || undefined"
    data-component="SegmentedControl.IconButton"
  >
    <Tooltip
      :type="description ? undefined : 'label'"
      :text="description || normalizedProps.ariaLabel"
      :direction="tooltipDirection"
    >
      <button
        type="button"
        :aria-pressed="selected"
        :aria-label="description ? normalizedProps.ariaLabel : undefined"
        :class="[$style.Button, $style.IconButton]"
        v-bind="buttonAttrs()"
      >
        <span :class="[$style.Content, 'segmentedControl-content']">
          <RenderVisual :visual="icon" />
        </span>
      </button>
    </Tooltip>
  </li>
</template>

<style module src="./SegmentedControl.module.css" />
