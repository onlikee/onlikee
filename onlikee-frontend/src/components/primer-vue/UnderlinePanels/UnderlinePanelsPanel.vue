<script setup lang="ts">
import { useAttrs } from 'vue'
import { useTabPanel } from '../Tabs'
import { normalizeReactStyle } from '../internal/style'
import type { UnderlinePanelsPanelComponentProps } from './types'

defineOptions({ name: 'UnderlinePanelsPanel', inheritAttrs: false })
const props = defineProps<UnderlinePanelsPanelComponentProps>()
const attrs = useAttrs()
const { tabPanelProps } = useTabPanel(() => ({ value: props.value ?? '' }))
</script>

<template>
  <div
    v-bind="{ ...attrs, ...tabPanelProps }"
    :class="[className, attrs.class]"
    :style="normalizeReactStyle(attrs.style)"
  >
    <slot />
  </div>
</template>
