import {
  Comment,
  Fragment,
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  shallowRef,
  watch,
  type Component,
  type PropType,
  type VNode,
} from 'vue'
import { getFocusableChild } from '@primer/behaviors/utils'
import XIcon from '@onlikee/octicons-vue/icons/x'
import { AnchoredOverlay, type AnchorRenderProps } from '../AnchoredOverlay'
import { Button, IconButton } from '../Button'
import VisuallyHidden from '../internal/components/VisuallyHidden.vue'
import classes from './LabelGroup.module.css'

function childrenArray(nodes: VNode[]): (VNode | null)[] {
  return nodes.flatMap((node) => {
    // Compiler fragments represent template lists; explicit fragments remain one child.
    if (node.type === Fragment && node.patchFlag & (64 | 128 | 256) && Array.isArray(node.children))
      return childrenArray(node.children as VNode[])
    if (node.type === Comment) return [null]
    return [node]
  })
}

function toElement(value: unknown): HTMLElement | null {
  if (typeof HTMLElement === 'undefined') return null
  if (value instanceof HTMLElement) return value
  if (value && typeof value === 'object') {
    const target = value as { element?: unknown; $el?: unknown }
    if (target.element instanceof HTMLElement) return target.element
    if (target.$el instanceof HTMLElement) return target.$el
  }
  return null
}

export default defineComponent({
  name: 'LabelGroup',
  inheritAttrs: false,
  props: {
    as: { type: [String, Object, Function] as PropType<string | Component>, default: 'ul' },
    overflowStyle: { type: String as PropType<'inline' | 'overlay'>, default: 'overlay' },
    visibleChildCount: {
      type: [String, Number] as PropType<'auto' | number>,
      default: undefined,
    },
    className: { type: String, default: undefined },
  },
  setup(props, { slots, attrs, expose }) {
    const containerTarget = shallowRef<unknown>(null)
    const container = computed(() => toElement(containerTarget.value))
    const expandButton = shallowRef<HTMLElement | null>(null)
    const collapseButton = shallowRef<HTMLElement | null>(null)
    const isOverflowShown = ref(false)
    const visibility = ref<Record<string, boolean>>({})
    const buttonRect = shallowRef({ width: 0, right: 0 })
    let observer: IntersectionObserver | undefined
    let observedNodes: Element[] = []
    let reservedWidth = -1
    let mounted = false
    let disposed = false
    let firstHiddenIndex: number | undefined
    let focusTimer: ReturnType<typeof setTimeout> | undefined

    function measureButton() {
      const rect = expandButton.value?.getBoundingClientRect()
      if (
        rect &&
        (rect.width !== buttonRect.value.width || rect.right !== buttonRect.value.right)
      ) {
        buttonRect.value = { width: rect.width, right: rect.right }
      }
    }
    function setExpandButton(value: unknown) {
      expandButton.value = toElement(value)
      measureButton()
    }
    function stopObserver() {
      observer?.disconnect()
      observer = undefined
      observedNodes = []
    }
    function updateObserver() {
      if (!mounted) return
      measureButton()
      if (!props.visibleChildCount || isOverflowShown.value || !container.value) {
        stopObserver()
        return
      }
      const nodes = Array.from(container.value.children).filter((child) =>
        child.hasAttribute('data-index'),
      )
      if (typeof props.visibleChildCount === 'number') {
        const truncateAfter = props.visibleChildCount
        stopObserver()
        const updated = Object.fromEntries(
          nodes.map((node) => {
            const index = node.getAttribute('data-index')!
            return [index, Number(index) < truncateAfter]
          }),
        )
        if (
          Object.keys(updated).length !== Object.keys(visibility.value).length ||
          Object.keys(updated).some((index) => updated[index] !== visibility.value[index])
        )
          visibility.value = updated
        return
      }
      if (
        observer &&
        reservedWidth === buttonRect.value.width &&
        observedNodes.length === nodes.length &&
        observedNodes.every((node, index) => node === nodes[index])
      )
        return
      stopObserver()
      observedNodes = nodes
      reservedWidth = buttonRect.value.width
      observer = new IntersectionObserver(
        (entries) => {
          if (disposed || isOverflowShown.value) return
          const updated = { ...visibility.value }
          let changed = false
          for (const entry of entries) {
            const index = entry.target.getAttribute('data-index')
            if (index !== null && updated[index] !== entry.isIntersecting) {
              updated[index] = entry.isIntersecting
              changed = true
            }
          }
          if (changed) visibility.value = updated
        },
        { root: container.value, rootMargin: `0px -${reservedWidth}px 0px 0px`, threshold: 1 },
      )
      for (const child of nodes) observer.observe(child)
    }

    function isHidden(index: number) {
      return visibility.value[String(index)] === false
    }
    async function expandInline(hiddenIndices: number[]) {
      firstHiddenIndex = hiddenIndices[0]
      visibility.value = {}
      isOverflowShown.value = true
      await nextTick()
      if (disposed) return
      const firstHidden = container.value?.querySelector<HTMLElement>(
        `[data-index="${firstHiddenIndex}"]`,
      )
      const focusable = firstHidden ? getFocusableChild(firstHidden) : null
      ;(focusable ?? collapseButton.value)?.focus()
    }
    async function close() {
      isOverflowShown.value = false
      await nextTick()
      if (!disposed && props.overflowStyle === 'inline')
        focusTimer = setTimeout(() => expandButton.value?.focus(), 10)
    }
    function moreLabel() {
      const count = Object.values(visibility.value).filter((visible) => !visible).length
      return [
        h(VisuallyHidden, null, { default: () => `Show +${count} more` }),
        h('span', { 'aria-hidden': 'true' }, `+${count}`),
      ]
    }
    onMounted(() => {
      mounted = true
      updateObserver()
    })
    onUpdated(updateObserver)
    watch(container, updateObserver, { flush: 'post' })
    onBeforeUnmount(() => {
      disposed = true
      clearTimeout(focusTimer)
      stopObserver()
    })
    expose({})

    return () => {
      const children = childrenArray(slots.default?.() ?? [])
      const isList = props.as === 'ul' || props.as === 'ol'
      const truncating = Boolean(props.visibleChildCount)
      const item = isList ? 'li' : 'span'
      const hiddenIndices = children.flatMap((child, index) =>
        child && isHidden(index) ? [index] : [],
      )
      const hiddenCount = hiddenIndices.length
      let toggle: VNode | null = null
      if (truncating && props.overflowStyle === 'inline') {
        if (isOverflowShown.value) {
          toggle = h(
            Button,
            {
              ref: (value: unknown) => (collapseButton.value = toElement(value)),
              variant: 'invisible',
              size: 'small',
              onClick: close,
            },
            { default: () => 'Show less' },
          )
        } else if (hiddenCount) {
          toggle = h(
            Button,
            {
              ref: setExpandButton,
              variant: 'invisible',
              size: 'small',
              onClick: () => expandInline(hiddenIndices),
            },
            { default: moreLabel },
          )
        }
      } else if (truncating && hiddenCount) {
        const overlayWidth =
          8 + buttonRect.value.right - (container.value?.getBoundingClientRect().left ?? 0)
        toggle = h(
          AnchoredOverlay,
          {
            open: isOverflowShown.value,
            onOpen: () => (isOverflowShown.value = true),
            onClose: close,
            width: 'auto',
            height: 'auto',
            align: 'start',
            side: 'inside-right',
            anchorRef: expandButton,
            anchorOffset: -8,
            alignmentOffset: -8,
            renderAnchor: (anchorProps: AnchorRenderProps) =>
              h(
                Button,
                {
                  ...anchorProps,
                  variant: 'invisible',
                  size: 'small',
                  ref: (value: unknown) => {
                    anchorProps.ref(value)
                    setExpandButton(value)
                  },
                },
                { default: moreLabel },
              ),
            focusZoneSettings: { disabled: true },
            overlayProps: {
              role: 'dialog',
              'aria-label': `All ${children.filter(Boolean).length} labels`,
              'aria-modal': true,
            },
          },
          {
            default: () =>
              h(
                'div',
                {
                  class: classes.OverlayContainer,
                  style: { width: `${overlayWidth}px`, padding: '8px' },
                },
                [
                  h('div', { class: classes.OverlayInner }, childrenArray(slots.default?.() ?? [])),
                  h(IconButton, {
                    icon: XIcon,
                    'aria-label': 'Close',
                    variant: 'invisible',
                    className: classes.CloseButton,
                    onClick: close,
                  }),
                ],
              ),
          },
        )
      }
      const content = truncating
        ? [
            ...children.map(
              (child, index) =>
                child &&
                h(
                  item,
                  {
                    key: index,
                    'data-index': index,
                    class: [classes.ItemWrapper, isHidden(index) && classes['ItemWrapper--hidden']],
                  },
                  [child],
                ),
            ),
            h(item, { 'data-component': 'LabelGroup.Toggle' }, toggle ? [toggle] : []),
          ]
        : isList
          ? children.map((child, index) => child && h('li', { key: index }, [child]))
          : children
      const rootAttrs = {
        ref: truncating ? containerTarget : undefined,
        'data-overflow':
          !truncating || (props.overflowStyle === 'inline' && isOverflowShown.value)
            ? 'inline'
            : undefined,
        'data-list': isList || undefined,
        class: [props.className, classes.Container, attrs.class],
        'data-component': 'LabelGroup',
      }
      return typeof props.as === 'string'
        ? h(props.as, rootAttrs, content)
        : h(props.as, rootAttrs, { default: () => content })
    }
  },
})
