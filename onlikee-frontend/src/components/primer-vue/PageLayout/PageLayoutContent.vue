<script setup lang="ts">
import classes from './PageLayout.module.css'
import { usePageLayoutContext } from './context'
import { getResponsiveAttributes } from './responsive'
import { normalizeReactStyle } from '../internal/style'
import { resolveFocusTarget } from '../internal/focusTarget'
import type { PageLayoutContentProps } from './types'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<PageLayoutContentProps>(), {
  as: 'main',
  width: 'full',
  padding: 'none',
  hidden: false,
  'data-component': 'PageLayout.Content',
})
const { contentWrapperRef } = usePageLayoutContext()
function setContent(node: unknown) {
  contentWrapperRef.value = resolveFocusTarget(node)
}
const normalizedProps = props as typeof props & {
  ariaLabel?: string
  ariaLabelledby?: string
  dataComponent?: string
}
</script>
<template>
  <component
    :is="as"
    :ref="setContent"
    :class="[classes.ContentWrapper, className, $attrs.class]"
    :style="normalizeReactStyle(style ?? $attrs.style)"
    :aria-label="normalizedProps.ariaLabel"
    :aria-labelledby="normalizedProps.ariaLabelledby"
    :data-component="normalizedProps.dataComponent ?? 'PageLayout.Content'"
    v-bind="getResponsiveAttributes('is-hidden', hidden)"
  >
    <div
      :class="classes.Content"
      :data-width="width"
      :style="{ '--spacing': `var(--spacing-${padding})` }"
    >
      <slot />
    </div>
  </component>
</template>
