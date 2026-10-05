<script setup lang="ts">
// Primer React 8c0b708: _VisuallyHidden.tsx 直译（内部版，Tooltip/KeybindingHint 使用；
// ButtonBase 公告与 CounterLabel 读屏标签在 React 中用的是公开版 VisuallyHidden/，见
// src/components/primer-vue/VisuallyHidden/）。
// React: <Component className={clsx(className, {[InternalVisuallyHidden]: !isVisible})} {...rest}>
withDefaults(defineProps<{ isVisible?: boolean; as?: string }>(), { isVisible: false, as: 'span' })
</script>
<template>
  <!-- 源 `as || 'span'`：任意 falsy（''/null）都兜底 span，非仅 undefined。 -->
  <component
    :is="as || 'span'"
    :class="{ 'internal-visually-hidden': !isVisible }"
  >
    <slot />
  </component>
</template>
<style>
/* Primer React 8c0b708: _VisuallyHidden.module.css 直译 */
.internal-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
