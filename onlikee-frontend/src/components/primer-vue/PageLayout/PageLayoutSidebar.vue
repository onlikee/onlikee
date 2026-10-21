<script setup lang="ts">
import classes from './PageLayout.module.css'
import { computed, shallowRef } from 'vue'
import { usePageLayoutContext } from './context'
import { getResponsiveAttributes } from './responsive'
import { normalizeReactStyle } from '../internal/style'
import { isCustomWidthOptions, isPaneWidth } from './usePaneWidth'
import { useOverflow, useResizablePane } from './useResizablePane'
import PageLayoutDivider from './PageLayoutDivider.vue'
import DragHandle from './DragHandle.vue'
import type { PageLayoutSidebarComponentProps } from './types'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<PageLayoutSidebarComponentProps>(), {
  position: 'start',
  width: 'medium',
  minWidth: 256,
  padding: 'none',
  resizable: false,
  divider: 'none',
  sticky: false,
  responsiveVariant: 'default',
  hidden: false,
  'data-component': 'PageLayout.Sidebar',
})
const { columnGap, sidebarRef, sidebarContentWrapperRef } = usePageLayoutContext()
const handleRef = shallowRef<HTMLDivElement | null>(null)
const refs = { handleRef, sidebarRef, sidebarContentWrapperRef }
defineExpose({ element: sidebarRef })
const { currentWidth, minPaneWidth, maxPaneWidth, onDragStart, onDrag, onDragEnd, onDoubleClick } =
  useResizablePane(
    () => ({
      ...props,
      paneRef: sidebarRef,
      handleRef,
      contentWrapperRef: sidebarContentWrapperRef,
      constrainToViewport: true,
    }),
    () => props.position,
    true,
  )
const hasOverflow = useOverflow(
  sidebarRef,
  () => normalizedProps.ariaLabel,
  () => normalizedProps.ariaLabelledby,
  'Sidebar',
)
const labelProps = computed(() =>
  !hasOverflow.value
    ? {}
    : normalizedProps.ariaLabelledby
      ? { 'aria-labelledby': normalizedProps.ariaLabelledby }
      : normalizedProps.ariaLabel
        ? { 'aria-label': normalizedProps.ariaLabel }
        : {},
)
function setSidebar(node: unknown) {
  sidebarRef.value = node as HTMLDivElement | null
}
const normalizedProps = props as typeof props & {
  ariaLabel?: string
  ariaLabelledby?: string
  dataComponent?: string
}
</script>
<template>
  <div
    :class="[classes.SidebarWrapper, className, $attrs.class]"
    :style="[
      { '--spacing-column': `var(--spacing-${columnGap})` },
      normalizeReactStyle(style ?? $attrs.style),
    ]"
    v-bind="getResponsiveAttributes('is-hidden', hidden)"
    :data-position="position"
    :data-sticky="sticky || undefined"
    :data-responsive-variant="responsiveVariant !== 'default' ? responsiveVariant : undefined"
  >
    <template
      v-for="part in position === 'end' ? ['divider', 'sidebar'] : ['sidebar', 'divider']"
      :key="part"
    >
      <div
        v-if="part === 'sidebar'"
        v-bind="{ ...(hasOverflow ? { tabindex: 0, role: 'region' } : {}), ...labelProps }"
        :id="id || undefined"
        :ref="setSidebar"
        :class="classes.Sidebar"
        :data-component="normalizedProps.dataComponent ?? 'PageLayout.Sidebar'"
        :data-resizable="resizable || undefined"
        :data-allow-mismatch="resizable && widthStorageKey && !onResizeEnd ? 'style' : undefined"
        :style="{
          '--spacing': `var(--spacing-${padding})`,
          '--pane-min-width': isCustomWidthOptions(width) ? width.min : `${minWidth}px`,
          '--pane-max-width': isCustomWidthOptions(width)
            ? width.max
            : 'calc(100vw - var(--sidebar-max-width-diff))',
          '--pane-width-custom': isCustomWidthOptions(width) ? width.default : undefined,
          '--pane-width-size': `var(--pane-width-${isPaneWidth(width) ? width : 'custom'})`,
          '--pane-width': `${currentWidth}px`,
        }"
      >
        <slot />
      </div>
      <PageLayoutDivider
        v-else
        vertical
        :variant="resizable ? 'line' : divider"
        :position="position"
        :class="classes.SidebarVerticalDivider"
        :style="{ '--spacing': `var(--spacing-${columnGap})` }"
      >
        <DragHandle
          v-if="resizable"
          :handle-ref="refs.handleRef"
          :drag-target-ref="refs.sidebarRef"
          :content-wrapper-ref="refs.sidebarContentWrapperRef"
          :aria-valuemin="minPaneWidth"
          :aria-valuemax="maxPaneWidth"
          :aria-valuenow="currentWidth"
          :on-drag-start="onDragStart"
          :on-drag="onDrag"
          :on-drag-end="onDragEnd"
          :on-double-click="onDoubleClick"
        />
      </PageLayoutDivider>
    </template>
  </div>
</template>
