<script setup lang="ts">
import classes from './ActionList.module.css'
import { useAttrs } from 'vue'
import { normalizeReactStyle } from '../internal/style'
import type { ActionListLeadingVisualProps } from './types'
defineOptions({ name: 'ActionListLeadingVisual', __SLOT__: Symbol('ActionList.LeadingVisual'), inheritAttrs: false })
defineProps<Pick<ActionListLeadingVisualProps, 'className'>>()
const attrs = useAttrs()
</script>
<template>
  <span
    :class="[classes['action-list-visual-wrap'], classes['action-list-leading-visual'], className, attrs.class]"
    data-component="ActionList.LeadingVisual"
    v-bind="attrs"
    :style="normalizeReactStyle(attrs.style)"
  ><slot /></span>
</template>
