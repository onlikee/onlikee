<script setup lang="ts">
import classes from './PageLayout.module.css'
import { computed } from 'vue'
import { usePageLayoutContext } from './context'
import { getResponsiveAttributes, isResponsiveValue } from './responsive'
import { normalizeReactStyle } from '../internal/style'
import PageLayoutDivider from './PageLayoutDivider.vue'
import type { PageLayoutHeaderProps } from './types'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<PageLayoutHeaderProps>(), {
  padding: 'none',
  divider: 'none',
  dividerWhenNarrow: 'inherit',
  hidden: false,
  'data-component': 'PageLayout.Header',
})
const { rowGap } = usePageLayoutContext()
const dividerProp = computed(() =>
  !isResponsiveValue(props.divider) && props.dividerWhenNarrow !== 'inherit'
    ? { regular: props.divider, narrow: props.dividerWhenNarrow }
    : props.divider,
)
const normalizedProps = props as typeof props & {
  ariaLabel?: string
  ariaLabelledby?: string
  dataComponent?: string
}
</script>
<template>
  <header
    :class="[classes.Header, className, $attrs.class]"
    :style="[
      { '--spacing': `var(--spacing-${rowGap})` },
      normalizeReactStyle(style ?? $attrs.style),
    ]"
    :aria-label="normalizedProps.ariaLabel"
    :aria-labelledby="normalizedProps.ariaLabelledby"
    :data-component="normalizedProps.dataComponent ?? 'PageLayout.Header'"
    v-bind="getResponsiveAttributes('hidden', hidden)"
  >
    <div :class="classes.HeaderContent" :style="{ '--spacing': `var(--spacing-${padding})` }">
      <slot />
    </div>
    <PageLayoutDivider
      :variant="dividerProp"
      :class="classes.HeaderHorizontalDivider"
      :style="{ '--spacing': `var(--spacing-${rowGap})` }"
    />
  </header>
</template>
