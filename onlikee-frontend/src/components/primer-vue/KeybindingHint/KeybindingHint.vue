<script setup lang="ts">
import Text from '../Text/Text.vue'
import Sequence from './Sequence.vue'
import type { KeybindingHintFormat, KeybindingHintVariant } from './props'

// Primer React 8c0b708: KeybindingHint/KeybindingHint.tsx 直译
// —— `kbd` 元素（带样式重置）包裹 Sequence。
// inheritAttrs: false —— 源组件不把剩余属性展开到根元素：KeybindingHint.tsx:26-30 仅把
// className 交给根 Kbd（其余 props 进 Sequence），Sequence.tsx:8-19 转交 Chord，
// Chord.tsx:9 只解构 keys/format/variant/size，剩余 props 被丢弃、永不落 DOM。
defineOptions({ name: 'KeybindingHint', inheritAttrs: false })
withDefaults(
  defineProps<{
    keys: string
    format?: KeybindingHintFormat
    variant?: KeybindingHintVariant
    size?: 'small' | 'normal'
    className?: string
  }>(),
  { format: undefined, variant: undefined, size: undefined, className: undefined },
)
</script>
<template>
  <Text
    as="kbd"
    :class="['keybinding-hint', className]"
    data-testid="keybinding-hint"
    data-component="KeybindingHint"
  >
    <Sequence
      :keys="keys"
      :format="format"
      :variant="variant"
      :size="size"
    />
  </Text>
</template>
<style src="./KeybindingHint.css" />
