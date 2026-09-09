<template>
  <div
    ref="dropdownRef"
    class="dropdown"
  >
    <div
      ref="triggerRef"
      class="dropdown-trigger"
      :data-open="isOpen || undefined"
      @click="toggleOpen"
    >
      <RenderNodes :nodes="parsedChildren.trigger" />
    </div>
    <Teleport to="body">
      <Transition name="dropdown-fade">
        <div
          v-if="isOpen"
          ref="contentRef"
          class="dropdown-content"
          :data-width="parsedChildren.contentWidth"
          :data-side="resolvedPositionSide"
          :data-align="resolvedPositionAlign"
          :style="contentStyle"
        >
          <RenderNodes :nodes="parsedChildren.content" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Comment, Fragment, Text, computed, ref, onMounted, onBeforeUnmount, watch, nextTick, useSlots, type CSSProperties, type VNode } from 'vue'

type InsideSide =
  | 'inside-top'
  | 'inside-bottom'
  | 'inside-left'
  | 'inside-right'
  | 'inside-center'

type OutsideSide = 'outside-top' | 'outside-bottom' | 'outside-left' | 'outside-right'

type DropdownSide =
  | InsideSide
  | 'outside-top'
  | 'outside-bottom'
  | 'outside-left'
  | 'outside-right'

type DropdownAlign = 'start' | 'center' | 'end'
type DropdownContentWidth = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'auto'

interface DropdownMarkerType {
  name?: string
  __name?: string
}

interface ParsedDropdownChildren {
  trigger: VNode[]
  content: VNode[]
  contentWidth: DropdownContentWidth
}

interface RectLike {
  top: number
  left: number
  width: number
  height: number
}

interface HorizontalBoundary {
  left: number
  width: number
}

interface DocumentVerticalBoundary {
  top: number
  bottom: number
}

interface PositionSettings {
  side: DropdownSide
  align: DropdownAlign
  anchorOffset: number
  alignmentOffset: number
  allowOutOfBounds: boolean
  displayInViewport: boolean
}

interface DropdownPosition {
  top: number
  left: number
  maxWidth?: number
  anchorSide: DropdownSide
  anchorAlign: DropdownAlign
}

type DropdownContentStyle = CSSProperties & {
  '--dropdown-available-width'?: string
}

type ScrollTarget = Element | Window | VisualViewport

const ALTERNATE_ALIGNMENTS: Record<DropdownAlign, DropdownAlign[]> = {
  start: ['end', 'center'],
  end: ['start', 'center'],
  center: ['end', 'start']
}
const VIEWPORT_MARGIN = 8
const DEFAULT_ANCHOR_OFFSET = 4
const DEFAULT_ALIGNMENT_OFFSET = 4

const props = withDefaults(defineProps<{
  side?: DropdownSide
  align?: DropdownAlign
  anchorOffset?: number
  alignmentOffset?: number
  allowOutOfBounds?: boolean
  displayInViewport?: boolean
}>(), {
  side: 'outside-bottom',
  align: 'start',
  anchorOffset: undefined,
  alignmentOffset: undefined,
  allowOutOfBounds: false,
  displayInViewport: false
})

const slots = useSlots()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const position = ref<DropdownPosition>()

let updateFrame = 0
let resizeObserver: ResizeObserver | undefined
let scrollTargets: ScrollTarget[] = []

const resolvedPositionSide = computed(() => position.value?.anchorSide ?? props.side)
const resolvedPositionAlign = computed(() => position.value?.anchorAlign ?? props.align)
const contentStyle = computed<DropdownContentStyle>(() => ({
  top: `${position.value?.top ?? 0}px`,
  left: `${position.value?.left ?? 0}px`,
  '--dropdown-available-width': position.value?.maxWidth === undefined ? undefined : `${position.value.maxWidth}px`,
  visibility: position.value ? undefined : 'hidden'
}))
const positionSettings = computed<PositionSettings>(() => ({
  side: props.side,
  align: props.align,
  anchorOffset: props.anchorOffset ?? (props.side === 'inside-center' ? 0 : DEFAULT_ANCHOR_OFFSET),
  alignmentOffset: props.alignmentOffset ?? (props.align !== 'center' && props.side.startsWith('inside-') ? DEFAULT_ALIGNMENT_OFFSET : 0),
  allowOutOfBounds: props.allowOutOfBounds,
  displayInViewport: props.displayInViewport
}))

const positionDependencies = computed(() => [
  props.side,
  props.align,
  props.anchorOffset,
  props.alignmentOffset,
  props.allowOutOfBounds,
  props.displayInViewport,
  parsedChildren.value.contentWidth
])

const RenderNodes = (props: { nodes: VNode[] }) => props.nodes

function getRectRight(rect: Pick<RectLike, 'left' | 'width'>) {
  return rect.left + rect.width
}

function getRectBottom(rect: Pick<RectLike, 'top' | 'height'>) {
  return rect.top + rect.height
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

function getVisualViewportHorizontalBoundary(): HorizontalBoundary {
  const viewport = window.visualViewport
  const documentElement = document.documentElement
  const layoutWidth = documentElement.clientWidth || window.innerWidth

  return {
    left: viewport?.offsetLeft ?? 0,
    width: Math.min(viewport?.width ?? layoutWidth, layoutWidth)
  }
}

function getDocumentVerticalBoundary(): DocumentVerticalBoundary {
  const viewport = window.visualViewport
  const scrollingElement = document.scrollingElement ?? document.documentElement
  const documentElement = document.documentElement
  const body = document.body
  const documentHeight = Math.max(
    scrollingElement.scrollHeight,
    documentElement.scrollHeight,
    documentElement.offsetHeight,
    body?.scrollHeight ?? 0,
    body?.offsetHeight ?? 0
  )
  const viewportTop = viewport?.offsetTop ?? 0
  const top = viewportTop - scrollingElement.scrollTop

  return {
    top,
    bottom: top + documentHeight
  }
}

function isClippingOverflow(style: CSSStyleDeclaration) {
  return /auto|scroll|overlay|hidden|clip/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`)
}

function isScrollableOverflow(style: CSSStyleDeclaration) {
  return /auto|scroll|overlay/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`)
}

function getClippingAncestor(element: HTMLElement) {
  let current = element.parentElement

  while (current && current !== document.body) {
    if (isClippingOverflow(getComputedStyle(current))) {
      return current
    }

    current = current.parentElement
  }

  return null
}

function getHorizontalBoundary(anchorElement: HTMLElement, displayInViewport: boolean): HorizontalBoundary {
  if (displayInViewport) return getVisualViewportHorizontalBoundary()

  const clippingAncestor = getClippingAncestor(anchorElement)
  if (!clippingAncestor) return getVisualViewportHorizontalBoundary()

  const rect = clippingAncestor.getBoundingClientRect()
  const style = getComputedStyle(clippingAncestor)
  const borderRight = parseInt(style.borderRightWidth, 10) || 0
  const borderLeft = parseInt(style.borderLeftWidth, 10) || 0

  return {
    left: rect.left + borderLeft,
    width: Math.max(0, rect.width - borderLeft - borderRight)
  }
}

function getScrollableAncestors(element: HTMLElement): ScrollTarget[] {
  const ancestors: ScrollTarget[] = []
  let current = element.parentElement

  while (current && current !== document.body) {
    if (isScrollableOverflow(getComputedStyle(current))) {
      ancestors.push(current)
    }

    current = current.parentElement
  }

  ancestors.push(window)

  if (window.visualViewport) {
    ancestors.push(window.visualViewport)
  }

  return ancestors
}

function calculatePosition(
  floatingRect: RectLike,
  anchorRect: RectLike,
  side: DropdownSide,
  align: DropdownAlign,
  anchorOffset: number,
  alignmentOffset: number
) {
  const anchorRight = getRectRight(anchorRect)
  const anchorBottom = getRectBottom(anchorRect)
  let top = -1
  let left = -1

  if (side === 'outside-top') {
    top = anchorRect.top - anchorOffset - floatingRect.height
  } else if (side === 'outside-bottom') {
    top = anchorBottom + anchorOffset
  } else if (side === 'outside-left') {
    left = anchorRect.left - anchorOffset - floatingRect.width
  } else if (side === 'outside-right') {
    left = anchorRight + anchorOffset
  }

  if (side === 'outside-top' || side === 'outside-bottom') {
    if (align === 'start') {
      left = anchorRect.left + alignmentOffset
    } else if (align === 'center') {
      left = anchorRect.left - (floatingRect.width - anchorRect.width) / 2 + alignmentOffset
    } else {
      left = anchorRight - floatingRect.width - alignmentOffset
    }
  }

  if (side === 'outside-left' || side === 'outside-right') {
    if (align === 'start') {
      top = anchorRect.top + alignmentOffset
    } else if (align === 'center') {
      top = anchorRect.top - (floatingRect.height - anchorRect.height) / 2 + alignmentOffset
    } else {
      top = anchorBottom - floatingRect.height - alignmentOffset
    }
  }

  if (side === 'inside-top') {
    top = anchorRect.top + anchorOffset
  } else if (side === 'inside-bottom') {
    top = anchorBottom - anchorOffset - floatingRect.height
  } else if (side === 'inside-left') {
    left = anchorRect.left + anchorOffset
  } else if (side === 'inside-right') {
    left = anchorRight - anchorOffset - floatingRect.width
  } else if (side === 'inside-center') {
    left = (anchorRight + anchorRect.left) / 2 - floatingRect.width / 2 + anchorOffset
  }

  if (side === 'inside-top' || side === 'inside-bottom') {
    if (align === 'start') {
      left = anchorRect.left + alignmentOffset
    } else if (align === 'center') {
      left = anchorRect.left - (floatingRect.width - anchorRect.width) / 2 + alignmentOffset
    } else {
      left = anchorRight - floatingRect.width - alignmentOffset
    }
  } else if (side === 'inside-left' || side === 'inside-right' || side === 'inside-center') {
    if (align === 'start') {
      top = anchorRect.top + alignmentOffset
    } else if (align === 'center') {
      top = anchorRect.top - (floatingRect.height - anchorRect.height) / 2 + alignmentOffset
    } else {
      top = anchorBottom - floatingRect.height - alignmentOffset
    }
  }

  return { top, left }
}

function getVerticalFlipSide(side: DropdownSide): OutsideSide | undefined {
  if (side === 'outside-top') return 'outside-bottom'
  if (side === 'outside-bottom') return 'outside-top'

  return undefined
}

function getHorizontalFlipSide(side: DropdownSide): OutsideSide | undefined {
  if (side === 'outside-left') return 'outside-right'
  if (side === 'outside-right') return 'outside-left'

  return undefined
}

function shouldTryHorizontalAlignment(side: DropdownSide) {
  return side === 'outside-top' || side === 'outside-bottom' || side === 'inside-top' || side === 'inside-bottom'
}

function getHorizontalOverflow(left: number, floatingWidth: number, boundary: HorizontalBoundary) {
  const minLeft = boundary.left + VIEWPORT_MARGIN
  const maxRight = getRectRight(boundary) - VIEWPORT_MARGIN

  return Math.max(0, minLeft - left) + Math.max(0, left + floatingWidth - maxRight)
}

function getVerticalOverflow(top: number, floatingHeight: number, boundary: DocumentVerticalBoundary) {
  const minTop = boundary.top + VIEWPORT_MARGIN
  const maxBottom = boundary.bottom - VIEWPORT_MARGIN

  return Math.max(0, minTop - top) + Math.max(0, top + floatingHeight - maxBottom)
}

function clampHorizontalPosition(left: number, floatingWidth: number, boundary: HorizontalBoundary) {
  return clamp(left, boundary.left + VIEWPORT_MARGIN, getRectRight(boundary) - floatingWidth - VIEWPORT_MARGIN)
}

function toRectLike(rect: DOMRect | RectLike): RectLike {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  }
}

function calculateAnchoredPosition(
  horizontalBoundary: HorizontalBoundary,
  documentVerticalBoundary: DocumentVerticalBoundary,
  floatingRect: RectLike,
  anchorRect: RectLike,
  settings: PositionSettings
): DropdownPosition {
  const maxWidth = settings.allowOutOfBounds ? undefined : Math.max(0, horizontalBoundary.width - VIEWPORT_MARGIN * 2)
  const normalizedFloatingRect = toRectLike(floatingRect)
  const effectiveFloatingRect = {
    ...normalizedFloatingRect,
    width: maxWidth === undefined ? normalizedFloatingRect.width : Math.min(normalizedFloatingRect.width, maxWidth)
  }
  let currentPosition = calculatePosition(
    effectiveFloatingRect,
    anchorRect,
    settings.side,
    settings.align,
    settings.anchorOffset,
    settings.alignmentOffset
  )
  let anchorSide = settings.side
  let anchorAlign = settings.align

  if (!settings.allowOutOfBounds) {
    const verticalFlipSide = getVerticalFlipSide(anchorSide)
    if (verticalFlipSide) {
      const currentOverflow = getVerticalOverflow(currentPosition.top, effectiveFloatingRect.height, documentVerticalBoundary)

      if (currentOverflow > 0) {
        const nextPosition = calculatePosition(
          effectiveFloatingRect,
          anchorRect,
          verticalFlipSide,
          anchorAlign,
          settings.anchorOffset,
          settings.alignmentOffset
        )
        const nextOverflow = getVerticalOverflow(nextPosition.top, effectiveFloatingRect.height, documentVerticalBoundary)

        if (nextOverflow <= currentOverflow) {
          currentPosition = nextPosition
          anchorSide = verticalFlipSide
        }
      }
    }

    const horizontalFlipSide = getHorizontalFlipSide(anchorSide)
    if (horizontalFlipSide) {
      const currentOverflow = getHorizontalOverflow(currentPosition.left, effectiveFloatingRect.width, horizontalBoundary)

      if (currentOverflow > 0) {
        const nextPosition = calculatePosition(
          effectiveFloatingRect,
          anchorRect,
          horizontalFlipSide,
          anchorAlign,
          settings.anchorOffset,
          settings.alignmentOffset
        )
        const nextOverflow = getHorizontalOverflow(nextPosition.left, effectiveFloatingRect.width, horizontalBoundary)

        if (nextOverflow < currentOverflow) {
          currentPosition = nextPosition
          anchorSide = horizontalFlipSide
        }
      }
    }

    if (shouldTryHorizontalAlignment(anchorSide)) {
      let bestPosition = currentPosition
      let bestAlign = anchorAlign
      let bestOverflow = getHorizontalOverflow(currentPosition.left, effectiveFloatingRect.width, horizontalBoundary)

      for (const nextAlign of ALTERNATE_ALIGNMENTS[anchorAlign]) {
        const nextPosition = calculatePosition(
          effectiveFloatingRect,
          anchorRect,
          anchorSide,
          nextAlign,
          settings.anchorOffset,
          settings.alignmentOffset
        )
        const nextOverflow = getHorizontalOverflow(nextPosition.left, effectiveFloatingRect.width, horizontalBoundary)

        if (nextOverflow < bestOverflow) {
          bestPosition = nextPosition
          bestAlign = nextAlign
          bestOverflow = nextOverflow

          if (nextOverflow === 0) break
        }
      }

      currentPosition = bestPosition
      anchorAlign = bestAlign
    }

    currentPosition = {
      ...currentPosition,
      left: clampHorizontalPosition(currentPosition.left, effectiveFloatingRect.width, horizontalBoundary)
    }
  }

  return {
    ...currentPosition,
    maxWidth,
    anchorSide,
    anchorAlign
  }
}

function getComponentName(type: VNode['type']) {
  if (typeof type !== 'object' && typeof type !== 'function') return ''

  const marker = type as DropdownMarkerType
  return marker.name ?? marker.__name ?? ''
}

function readSlotChildren(node: VNode) {
  if (typeof node.children === 'object' && node.children && 'default' in node.children) {
    const slot = node.children.default
    return typeof slot === 'function' ? slot() : []
  }

  return []
}

function isWhitespaceNode(node: VNode) {
  return node.type === Text && typeof node.children === 'string' && node.children.trim() === ''
}

function flattenChildren(nodes: VNode[]): VNode[] {
  return nodes.flatMap(node => {
    if (node.type === Fragment && Array.isArray(node.children)) {
      return flattenChildren(node.children as VNode[])
    }

    return [node]
  })
}

function parseDropdownChildren(nodes: VNode[]): ParsedDropdownChildren {
  const parsed: ParsedDropdownChildren = {
    trigger: [],
    content: [],
    contentWidth: 'auto'
  }

  for (const node of flattenChildren(nodes)) {
    if (node.type === Comment || isWhitespaceNode(node)) continue

    const componentName = getComponentName(node.type)

    if (componentName === 'DropdownTrigger') {
      parsed.trigger.push(...readSlotChildren(node))
      continue
    }

    if (componentName === 'DropdownContent') {
      const props = node.props as { width?: DropdownContentWidth } | null

      parsed.content.push(...readSlotChildren(node))
      parsed.contentWidth = props?.width ?? 'auto'
    }
  }

  return parsed
}

const parsedChildren = computed(() => parseDropdownChildren(slots.default?.() ?? []))

function updatePosition() {
  if (!isOpen.value) return

  const anchor = triggerRef.value
  const content = contentRef.value
  if (!anchor || !content) return

  const anchorRect = anchor.getBoundingClientRect()
  const contentRect = content.getBoundingClientRect()
  const horizontalBoundary = getHorizontalBoundary(anchor, positionSettings.value.displayInViewport)
  const documentVerticalBoundary = getDocumentVerticalBoundary()
  position.value = calculateAnchoredPosition(horizontalBoundary, documentVerticalBoundary, contentRect, anchorRect, positionSettings.value)
}

function scheduleUpdatePosition() {
  if (updateFrame) return

  updateFrame = requestAnimationFrame(() => {
    updateFrame = 0
    updatePosition()
  })
}

function stopPositionObservers() {
  if (updateFrame) {
    cancelAnimationFrame(updateFrame)
    updateFrame = 0
  }

  resizeObserver?.disconnect()
  resizeObserver = undefined

  for (const target of scrollTargets) {
    target.removeEventListener('scroll', scheduleUpdatePosition)
  }

  scrollTargets = []
  window.removeEventListener('resize', scheduleUpdatePosition)
  window.visualViewport?.removeEventListener('resize', scheduleUpdatePosition)
}

function startPositionObservers() {
  stopPositionObservers()

  const anchor = triggerRef.value
  const content = contentRef.value
  if (!anchor || !content) return

  window.addEventListener('resize', scheduleUpdatePosition)
  window.visualViewport?.addEventListener('resize', scheduleUpdatePosition)

  scrollTargets = getScrollableAncestors(anchor)
  for (const target of scrollTargets) {
    target.addEventListener('scroll', scheduleUpdatePosition, { passive: true })
  }

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(scheduleUpdatePosition)
    resizeObserver.observe(anchor)
    resizeObserver.observe(content)
  }
}

function handleDocumentClick(e: MouseEvent) {
  const target = e.target as Node

  if (dropdownRef.value?.contains(target) || contentRef.value?.contains(target)) return

  isOpen.value = false
}

function toggleOpen() {
  isOpen.value = !isOpen.value
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  stopPositionObservers()
})

watch(isOpen, async open => {
  if (!open) {
    position.value = undefined
    stopPositionObservers()
    return
  }

  await nextTick()
  updatePosition()
  startPositionObservers()
})

watch(positionDependencies, async () => {
  if (!isOpen.value) return

  await nextTick()
  scheduleUpdatePosition()
}, { flush: 'post' })

defineExpose({ close: () => { isOpen.value = false } })
</script>

<style scoped>
.dropdown {
  display: inline-block;
  width: 100%;
}

.dropdown-trigger {
  cursor: pointer;
}

.dropdown-content {
  position: fixed;
  z-index: 9999;
  --dropdown-enter-x: 0;
  --dropdown-enter-y: 0;
  --dropdown-available-width: calc(100vw - 16px);
  box-sizing: border-box;
  min-width: min(192px, var(--dropdown-available-width));
  max-width: var(--dropdown-available-width);
  width: auto;
  overflow: auto;
  border-radius: 12px;
  background: var(--overlay-bgColor, #ffffff);
  box-shadow: var(--shadow-floating-small, 0px 0px 0px 1px #d1d9e080, 0px 6px 12px -3px #25292e0a, 0px 6px 18px 0px #25292e1f);
}

.dropdown-content[data-width='small'] {
  width: min(256px, var(--dropdown-available-width));
}

.dropdown-content[data-width='medium'] {
  width: min(320px, var(--dropdown-available-width));
}

.dropdown-content[data-width='large'] {
  width: min(480px, var(--dropdown-available-width));
}

.dropdown-content[data-width='xlarge'] {
  width: min(640px, var(--dropdown-available-width));
}

.dropdown-content[data-width='xxlarge'] {
  width: min(960px, var(--dropdown-available-width));
}

.dropdown-content[data-side='outside-bottom'],
.dropdown-content[data-side='inside-bottom'] {
  --dropdown-enter-y: -8px;
}

.dropdown-content[data-side='outside-top'],
.dropdown-content[data-side='inside-top'] {
  --dropdown-enter-y: 8px;
}

.dropdown-content[data-side='outside-left'],
.dropdown-content[data-side='inside-left'] {
  --dropdown-enter-x: 8px;
}

.dropdown-content[data-side='outside-right'],
.dropdown-content[data-side='inside-right'] {
  --dropdown-enter-x: -8px;
}

.dropdown-fade-enter-active {
  transition: opacity 0.15s, transform 0.15s;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translate(var(--dropdown-enter-x), var(--dropdown-enter-y));
}

/* 弹出时自动给 trigger 内的 Button 添加激活样式 */
.dropdown-trigger[data-open] :deep(.button[data-variant='default']) {
  background-color: var(--button-default-bgColor-active, var(--control-bgColor-active, #ebecf0));
  border-color: var(--button-default-borderColor-active, var(--button-default-borderColor-rest, #d0d7de));
}

.dropdown-trigger[data-open] :deep(.button[data-variant='primary']) {
  background-color: var(--button-primary-bgColor-active, #197935);
  border-color: var(--button-primary-borderColor-active, var(--button-primary-borderColor-rest, #1f232826));
  box-shadow: var(--button-primary-shadow-selected, var(--shadow-resting-small, 0 1px 0 0 #1f23280a));
}

.dropdown-trigger[data-open] :deep(.button[data-variant='danger']) {
  background-color: var(--button-danger-bgColor-active, var(--bgColor-danger-emphasis, #cf222e));
  border-color: var(--button-danger-borderColor-active, var(--button-danger-borderColor-hover, #1f232826));
  box-shadow: var(--button-danger-shadow-selected, var(--shadow-resting-small, 0 1px 0 0 #1f23280a));
  color: var(--button-danger-fgColor-active, #ffffff);
}

.dropdown-trigger[data-open] :deep(.button[data-variant='invisible']) {
  background-color: var(--button-invisible-bgColor-active, var(--control-transparent-bgColor-active, rgba(129, 139, 152, 0.16)));
}

.dropdown-trigger[data-open] :deep(.button[data-variant='link']) {
  text-decoration: underline;
}
</style>
