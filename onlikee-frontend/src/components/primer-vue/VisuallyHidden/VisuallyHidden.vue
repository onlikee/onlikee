<script setup lang="ts">
// Primer React 8c0b708: VisuallyHidden/VisuallyHidden.tsx 直译（公开组件）。
// 注意与 internal/components/VisuallyHidden.vue（_VisuallyHidden，clip:rect 技术、
// 支持 as/isVisible）是两套实现：React 中 ButtonBase loading 公告、CounterLabel 读屏
// 标签、Spinner、FilteredActionList 描述文本使用本公开版（clip-path + focus 可见 hack），
// Tooltip/KeybindingHint 使用内部版。
//
// Provides a component that implements the "visually hidden" technique. This is
// analogous to the common `sr-only` class. Children that are rendered inside
// this component will not be visible but will be available to screen readers.
//
// Note: if this component, or a descendant, has focus then this component will
// no longer be visually hidden.
//
// @see https://www.scottohara.me/blog/2023-03-21/visually-hidden-hack.html
defineOptions({ name: 'VisuallyHidden' })
withDefaults(defineProps<{ className?: string }>(), { className: undefined })
</script>
<template>
  <span :class="['visually-hidden', className]"><slot /></span>
</template>
<style src="./VisuallyHidden.css" />
