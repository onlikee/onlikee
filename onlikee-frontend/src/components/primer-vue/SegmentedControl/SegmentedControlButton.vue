<script setup lang="ts">
import { useAttrs, type ButtonHTMLAttributes } from 'vue'
import CounterLabel from '../CounterLabel/CounterLabel.vue'
import RenderVisual from '../internal/components/RenderVisual'
import { normalizeReactStyle } from '../internal/style'
import type { SegmentedControlButtonProps } from './types'

defineOptions({
  name: 'SegmentedControlButton',
  __SLOT__: Symbol('SegmentedControl.Button'),
  inheritAttrs: false,
})
const props = withDefaults(defineProps<SegmentedControlButtonProps>(), {
  selected: undefined,
  defaultSelected: undefined,
  disabled: undefined,
})
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
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
    :class="$style.Item"
    :data-selected="selected ? '' : undefined"
    data-component="SegmentedControl.Button"
  >
    <button
      :aria-pressed="selected"
      :class="[$style.Button, className, $attrs.class]"
      type="button"
      v-bind="buttonAttrs()"
    >
      <span :class="[$style.Content, 'segmentedControl-content']">
        <div v-if="leadingVisual ?? leadingIcon" :class="$style.LeadingIcon">
          <RenderVisual :visual="leadingVisual ?? leadingIcon" />
        </div>
        <div
          :class="[$style.Text, 'segmentedControl-text']"
          :data-text="
            $slots
              .default?.()
              .map((node) => node.children)
              .join('')
          "
        >
          <slot />
        </div>
        <span v-if="count !== undefined" :class="$style.Counter">
          <CounterLabel>{{ count }}</CounterLabel>
        </span>
      </span>
    </button>
  </li>
</template>

<style module src="./SegmentedControl.module.css" />
