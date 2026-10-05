<script setup lang="ts">
import { computed } from 'vue'
import VisuallyHidden from '../internal/components/VisuallyHidden.vue'
import { accessibleKeyName, condensedKeyName, fullKeyName } from './key-names'
import { usePlatformRef } from './platform'
import type { KeybindingHintFormat } from './props'

// Primer React 8c0b708: KeybindingHint/components/Key.tsx 直译
// —— 单个按键：可视符号（aria-hidden）+ 屏幕阅读器可读名称（VisuallyHidden）。
defineOptions({ name: 'KeybindingHintKey' })
const props = defineProps<{ name: string; format: KeybindingHintFormat }>()
// 源 Key.tsx:13 在 render 中调用 usePlatform()（useContext → override 变化即重渲染）；
// Vue 等价：computed 内读取 usePlatformRef()，override（ref 提供）变化时重算文本。
const platform = usePlatformRef()
const accessible = computed(() => accessibleKeyName(props.name, platform.value))
const visible = computed(() =>
  props.format === 'condensed' ? condensedKeyName(props.name, platform.value) : fullKeyName(props.name, platform.value),
)
</script>
<template>
  <VisuallyHidden>{{ accessible }}</VisuallyHidden>
  <span aria-hidden="true">{{ visible }}</span>
</template>
