<script setup lang="ts">
import classes from './PageLayout.module.css'
import { usePageLayoutContext } from './context'
import { getResponsiveAttributes } from './responsive'
import { normalizeReactStyle } from '../internal/style'
import type { ResponsiveValue } from './types'
defineOptions({ inheritAttrs: false })
withDefaults(
  defineProps<{
    vertical?: boolean
    variant?: 'none' | 'line' | 'filled' | ResponsiveValue<'none' | 'line' | 'filled'>
    position?: 'start' | 'end' | ResponsiveValue<'start' | 'end'>
  }>(),
  { vertical: false, variant: 'none', position: undefined },
)
const { padding } = usePageLayoutContext()
</script>
<template>
  <div
    :class="vertical ? classes.VerticalDivider : classes.HorizontalDivider"
    :data-component="vertical ? 'PageLayout.VerticalDivider' : 'PageLayout.HorizontalDivider'"
    v-bind="{
      ...getResponsiveAttributes('variant', variant),
      ...getResponsiveAttributes('position', position),
      ...$attrs,
    }"
    :style="[
      !vertical ? { '--spacing-divider': `var(--spacing-${padding})` } : undefined,
      normalizeReactStyle($attrs.style),
    ]"
  >
    <slot v-if="vertical" />
  </div>
</template>
