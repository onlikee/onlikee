<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, useSlots, type Component } from 'vue'
import Button from '../Button/Button.vue'
import SelectPanelButton from '../SelectPanel/SelectPanelButton.vue'
import Tooltip from '../TooltipV2/Tooltip.vue'
import type { TextInputActionOptions } from './types'

/**
 * Primer React 8c0b708: internal/components/TextInputInnerAction.tsx 移植（审计 M25）。
 * icon-only 且带 aria-label → IconButton（Vue 侧由 SelectPanelButton 的 icon 形态承担，
 * 自带完整 TooltipV2 label 型气泡）；否则 → Button，带 aria-label 时包一层
 * ConditionalTooltip（TooltipV2 description 型，popover 全套语义）。
 * 旧版自创 fixed 定位 tooltip 已移除。
 */
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<TextInputActionOptions>(), {
  variant: 'invisible',
  tooltipDirection: undefined,
  icon: undefined,
  className: undefined,
})
const attrs = useAttrs()
const slots = useSlots()
const buttonRef = ref<{ element?: HTMLElement | null } | null>(null)

const ariaLabel = computed(() => attrs['aria-label'] as string | undefined)
const hasChildren = computed(() => Boolean(slots.default))
const iconComponent = computed(() => props.icon as Component | undefined)
/** React :79 `icon && !children && ariaLabel` → IconButton 分支 */
const useIconButton = computed(() => Boolean(iconComponent.value && !hasChildren.value && ariaLabel.value))

// React :69-75：aria-label / aria-labelledby 从 rest 中摘出后按优先级重新注入（兜底空 aria-label）
const restAttrs = computed(() => {
  const { 'aria-label': _label, 'aria-labelledby': _labelledBy, ...rest } = attrs
  return rest
})
const accessibleLabel = computed<Record<string, unknown>>(() => {
  if (ariaLabel.value) return { 'aria-label': ariaLabel.value }
  if (attrs['aria-labelledby']) return { 'aria-labelledby': attrs['aria-labelledby'] }
  return { 'aria-label': '' }
})
const buttonBindings = computed(() => ({ ...restAttrs.value, ...accessibleLabel.value }))
// React :62 `clsx(variant === 'invisible' && styles.Invisible, className)`
const buttonClassName = computed(() =>
  [props.variant === 'invisible' ? 'text-input-action-invisible' : undefined, props.className].filter(Boolean).join(' ') || undefined)

onMounted(() => {
  // React :64-67 在每次渲染时警告；Vue 适配为挂载期 DEV 警告
  if (import.meta.env.DEV && ((props.icon && !ariaLabel.value) || (!hasChildren.value && !ariaLabel.value))) {
    console.warn('Use the `aria-label` prop to provide an accessible label for assistive technology')
  }
})

const element = computed<HTMLElement | null>(() => {
  const instance = buttonRef.value as { element?: HTMLElement | null; $el?: HTMLElement } | null
  return instance?.element ?? instance?.$el ?? null
})
defineExpose({
  element,
  focus: (options?: FocusOptions) => element.value?.focus(options),
  blur: () => element.value?.blur(),
})
</script>

<template>
  <span
    class="TextInput-action text-input-action"
    data-component="TextInput.Action"
  >
    <!-- 源 IconButton 分支：accessibleLabel/tooltipDirection/variant/type/icon/size/styleProps 在前、
         {...rest} 在后 → rest 可覆盖 type 等（restAttrs 置后镜像该顺序）。 -->
    <SelectPanelButton
      v-if="useIconButton"
      ref="buttonRef"
      :icon="iconComponent"
      :variant="variant"
      :tooltip-direction="tooltipDirection ?? 's'"
      size="small"
      type="button"
      :class-name="buttonClassName"
      v-bind="buttonBindings"
    />
    <template v-else>
      <!-- 源 Button 分支：accessibleLabel 只注入 IconButton 分支——Button 不带 aria-label/aria-labelledby
           （可及名来自 children，tooltip 为 description 型）；type="button" 在 {...rest} 之前，可被覆盖。 -->
      <Tooltip
        v-if="ariaLabel"
        :text="ariaLabel"
        :direction="tooltipDirection"
        class-name="text-input-action-conditional-tooltip"
      >
        <Button
          ref="buttonRef"
          :variant="variant"
          type="button"
          :class="buttonClassName"
          v-bind="restAttrs"
        >
          <slot />
        </Button>
      </Tooltip>
      <Button
        v-else
        ref="buttonRef"
        :variant="variant"
        type="button"
        :class="buttonClassName"
        v-bind="restAttrs"
      >
        <slot />
      </Button>
    </template>
  </span>
</template>

<style scoped>
/* TextInputInnerAction.module.css .TextInputAction 移植（审计 M25） */
.text-input-action {
  margin-right: var(--base-size-4, 4px);
  margin-left: var(--base-size-4, 4px);
  /* stylelint-disable-next-line primer/typography */
  line-height: 0;
}
</style>

<style>
/* .Invisible / .ConditionalTooltip 移植 —— 类落在子组件（可能多根）内部节点上，
   scoped 无法命中，使用全局块 + BEM 命名防冲突。兜底值对齐 primitives 11.5.1（审计 L32）。 */
.text-input-action-invisible {
  position: relative;
  padding-top: var(--base-size-2, 2px);
  padding-right: var(--base-size-4, 4px);
  padding-bottom: var(--base-size-2, 2px);
  padding-left: var(--base-size-4, 4px);
  color: var(--fgColor-muted, #59636e);
  background-color: transparent;
}
.text-input-action-invisible:hover,
.text-input-action-invisible:focus {
  color: var(--fgColor-default, #1f2328);
}
.text-input-action-invisible[data-component='IconButton'] {
  width: var(--inner-action-size, 24px);
  height: var(--inner-action-size, 24px);
}
@media (pointer: coarse) {
  /* 源 .Invisible 内嵌 @media 中的 `::after`（未带 &）按 CSS 嵌套规范编译为后代选择器
     `.Invisible ::after`（postcss-nesting@13 实测）——作用于全部后代元素的伪元素，
     对 svg 等替换元素不生效（源怪癖/近似死规则）。严格对齐镜像后代语义，不写成自身 ::after。 */
  .text-input-action-invisible ::after {
    position: absolute;
    top: 50%;
    right: 0;
    left: 0;
    min-height: 44px;
    content: '';
    transform: translateY(-50%);
  }
}
.text-input-action-conditional-tooltip {
  display: inline-block;
}
</style>
