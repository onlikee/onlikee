<script setup lang="ts">
import { useAttrs } from 'vue'
import { useItemContext } from './context'
import { normalizeReactStyle } from '../internal/style'
defineOptions({ name: 'ActionListTrailingVisual', __SLOT__: Symbol('ActionList.TrailingVisual'), inheritAttrs: false })
defineProps<{ className?: string }>()
const context = useItemContext(), attrs = useAttrs()
</script>
<template>
  <span
    :id="context?.trailingVisualId.value"
    class="action-list-visual-wrap action-list-trailing-visual"
    :class="[className, attrs.class]"
    data-component="ActionList.TrailingVisual"
    v-bind="attrs"
    :style="normalizeReactStyle(attrs.style)"
  ><slot /></span>
</template>
