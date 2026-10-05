<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import Button from './SelectPanelButton.vue'
defineOptions({ name: 'SelectPanelSecondaryActionLink', inheritAttrs: false })
// React SelectPanel.tsx:1074-1080 → Button/LinkButton.tsx:8 —— `as: Component = 'a'`：
// 消费方传入的 as 优先，未传时回退 'a'（解构默认值语义）
const attrs = useAttrs()
const resolvedAs = computed(() => (attrs.as as string | undefined) ?? 'a')
</script>
<template>
  <Button
    v-bind="$attrs"
    :as="resolvedAs"
    variant="invisible"
    block
    data-component="SelectPanel.SecondaryActionLink"
  >
    <slot />
  </Button>
</template>
