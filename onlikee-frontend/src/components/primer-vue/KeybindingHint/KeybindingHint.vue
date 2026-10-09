<script setup lang="ts">
import Text from '../Text/Text.vue'
import Sequence from './Sequence.vue'
import type { KeybindingHintFormat, KeybindingHintVariant } from './props'

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
    :class="[$style['keybinding-hint'], className]"
    data-testid="keybinding-hint"
    data-component="KeybindingHint"
  >
    <Sequence :keys="keys" :format="format" :variant="variant" :size="size" />
  </Text>
</template>
<style module src="./KeybindingHint.module.css" />
