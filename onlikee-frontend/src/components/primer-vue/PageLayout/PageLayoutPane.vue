<script setup lang="ts">
import classes from './PageLayout.module.css'
import { computed, shallowRef } from 'vue'
import { usePageLayoutContext } from './context'
import { getResponsiveAttributes, isResponsiveValue } from './responsive'
import { normalizeReactStyle } from '../internal/style'
import { isCustomWidthOptions, isPaneWidth } from './usePaneWidth'
import { useOverflow, useResizablePane } from './useResizablePane'
import PageLayoutDivider from './PageLayoutDivider.vue'
import DragHandle from './DragHandle.vue'
import type { PageLayoutPaneComponentProps } from './types'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<PageLayoutPaneComponentProps>(), {
  position: 'end',
  positionWhenNarrow: 'inherit',
  width: 'medium',
  minWidth: 256,
  padding: 'none',
  resizable: false,
  widthStorageKey: 'paneWidth',
  divider: 'none',
  dividerWhenNarrow: 'inherit',
  sticky: false,
  offsetHeader: 0,
  hidden: false,
  'data-component': 'PageLayout.Pane',
})
const { rowGap, columnGap, paneRef, contentWrapperRef } = usePageLayoutContext()
const handleRef = shallowRef<HTMLDivElement | null>(null)
const refs = { handleRef, paneRef, contentWrapperRef }
defineExpose({ element: paneRef })
const positionProp = computed(() =>
  !isResponsiveValue(props.position) && props.positionWhenNarrow !== 'inherit'
    ? { regular: props.position, narrow: props.positionWhenNarrow }
    : props.position,
)
const dividerProp = computed(() =>
  !isResponsiveValue(props.divider) && props.dividerWhenNarrow !== 'inherit'
    ? { regular: props.divider, narrow: props.dividerWhenNarrow }
    : props.divider,
)
const position = () => (isResponsiveValue(positionProp.value) ? 'end' : positionProp.value)
const dividerVariant = computed(() =>
  isResponsiveValue(dividerProp.value) ? 'none' : dividerProp.value,
)
const horizontalVariant = computed(() =>
  isResponsiveValue(dividerProp.value)
    ? dividerProp.value
    : ({ narrow: dividerVariant.value, regular: 'none' } as const),
)
const verticalVariant = computed(() =>
  isResponsiveValue(dividerProp.value)
    ? {
        narrow: 'none' as const,
        regular: props.resizable ? ('line' as const) : dividerProp.value.regular || 'none',
        wide: props.resizable
          ? ('line' as const)
          : dividerProp.value.wide || dividerProp.value.regular || 'none',
      }
    : {
        narrow: 'none' as const,
        regular: props.resizable ? ('line' as const) : dividerVariant.value,
      },
)
const { currentWidth, minPaneWidth, maxPaneWidth, onDragStart, onDrag, onDragEnd, onDoubleClick } =
  useResizablePane(() => ({ ...props, paneRef, handleRef, contentWrapperRef }), position)
const hasOverflow = useOverflow(
  paneRef,
  () => normalizedProps.ariaLabel,
  () => normalizedProps.ariaLabelledby,
  'Pane',
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
function setPane(node: unknown) {
  paneRef.value = node as HTMLDivElement | null
}
const normalizedProps = props as typeof props & {
  ariaLabel?: string
  ariaLabelledby?: string
  dataComponent?: string
}
</script>
<template>
  <div
    :class="[classes.PaneWrapper, className, $attrs.class]"
    :style="[
      {
        '--offset-header': typeof offsetHeader === 'number' ? `${offsetHeader}px` : offsetHeader,
        '--spacing-row': `var(--spacing-${rowGap})`,
        '--spacing-column': `var(--spacing-${columnGap})`,
      },
      normalizeReactStyle(style ?? $attrs.style),
    ]"
    v-bind="{
      ...getResponsiveAttributes('is-hidden', hidden),
      ...getResponsiveAttributes('position', positionProp),
    }"
    :data-sticky="sticky || undefined"
  >
    <PageLayoutDivider
      :variant="horizontalVariant"
      :class="classes.PaneHorizontalDivider"
      :style="{ '--spacing': `var(--spacing-${rowGap})` }"
      :position="positionProp"
    />
    <div
      v-bind="{ ...(hasOverflow ? { tabindex: 0, role: 'region' } : {}), ...labelProps }"
      :id="id || undefined"
      :ref="setPane"
      :class="classes.Pane"
      :data-component="normalizedProps.dataComponent ?? 'PageLayout.Pane'"
      :data-resizable="resizable || undefined"
      :data-allow-mismatch="resizable && !onResizeEnd ? 'style' : undefined"
      :style="{
        '--spacing': `var(--spacing-${padding})`,
        '--pane-min-width': isCustomWidthOptions(width) ? width.min : `${minWidth}px`,
        '--pane-max-width': isCustomWidthOptions(width)
          ? width.max
          : 'calc(100vw - var(--pane-max-width-diff))',
        '--pane-width-custom': isCustomWidthOptions(width) ? width.default : undefined,
        '--pane-width-size': `var(--pane-width-${isPaneWidth(width) ? width : 'custom'})`,
        '--pane-width': `${currentWidth}px`,
      }"
    >
      <slot />
    </div>
    <PageLayoutDivider
      vertical
      :variant="verticalVariant"
      :position="positionProp"
      :class="classes.PaneVerticalDivider"
      :style="{ '--spacing': `var(--spacing-${columnGap})` }"
    >
      <DragHandle
        v-if="resizable"
        :handle-ref="refs.handleRef"
        :drag-target-ref="refs.paneRef"
        :content-wrapper-ref="refs.contentWrapperRef"
        :aria-valuemin="minPaneWidth"
        :aria-valuemax="maxPaneWidth"
        :aria-valuenow="currentWidth"
        :on-drag-start="onDragStart"
        :on-drag="onDrag"
        :on-drag-end="onDragEnd"
        :on-double-click="onDoubleClick"
      />
    </PageLayoutDivider>
  </div>
</template>
