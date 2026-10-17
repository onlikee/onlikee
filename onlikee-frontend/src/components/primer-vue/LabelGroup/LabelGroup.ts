import {
  Comment,
  Fragment,
  Text,
  cloneVNode,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  shallowRef,
  type Component,
  type PropType,
  type VNode,
} from 'vue'
import { getFocusableChild } from '@primer/behaviors/utils'
import XIcon from '@onlikee/octicons-vue/icons/x'
import { AnchoredOverlay, type AnchorRenderProps } from '../AnchoredOverlay'
import { Button, IconButton } from '../Button'
import { VisuallyHidden } from '../VisuallyHidden'
import classes from './LabelGroup.module.css'

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Fragment && Array.isArray(node.children))
      return flatten(node.children as VNode[])
    if (node.type === Comment || (node.type === Text && !String(node.children).trim())) return []
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
    const container = shallowRef<HTMLElement | null>(null)
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
      if (
        props.visibleChildCount !== 'auto' ||
        isOverflowShown.value ||
        !container.value ||
        typeof IntersectionObserver === 'undefined'
      ) {
        stopObserver()
        return
      }
      const nodes = Array.from(container.value.children).filter((child) =>
        child.hasAttribute('data-index'),
      )
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
      if (props.overflowStyle === 'inline' && isOverflowShown.value) return false
      if (typeof props.visibleChildCount === 'number') return index >= props.visibleChildCount
      return props.visibleChildCount === 'auto' && visibility.value[String(index)] === false
    }
    async function expandInline(hiddenIndices: number[]) {
      firstHiddenIndex = hiddenIndices[0]
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
      if (!disposed) expandButton.value?.focus()
    }
    function moreLabel(count: number) {
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
    onBeforeUnmount(() => {
      disposed = true
      stopObserver()
    })
    expose({ element: container })

    return () => {
      const children = flatten(slots.default?.() ?? [])
      const isList = props.as === 'ul' || props.as === 'ol'
      const truncating = Boolean(props.visibleChildCount)
      const item = isList ? 'li' : 'span'
      const hiddenIndices = children.flatMap((_child, index) => (isHidden(index) ? [index] : []))
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
            { default: () => moreLabel(hiddenCount) },
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
                { default: () => moreLabel(hiddenCount) },
              ),
            focusZoneSettings: { disabled: true },
            overlayProps: {
              role: 'dialog',
              'aria-label': `All ${children.length} labels`,
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
                  h(
                    'div',
                    { class: classes.OverlayInner },
                    children.map((node) => cloneVNode(node)),
                  ),
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
            ...children.map((child, index) =>
              h(
                item,
                {
                  key: child.key ?? index,
                  'data-index': index,
                  class: [classes.ItemWrapper, isHidden(index) && classes['ItemWrapper--hidden']],
                },
                [child],
              ),
            ),
            h(item, { 'data-component': 'LabelGroup.Toggle' }, toggle ? [toggle] : []),
          ]
        : isList
          ? children.map((child, index) => h('li', { key: child.key ?? index }, [child]))
          : children
      return h(
        props.as,
        {
          ...attrs,
          ref: container,
          'data-overflow':
            !truncating || (props.overflowStyle === 'inline' && isOverflowShown.value)
              ? 'inline'
              : undefined,
          'data-list': isList || undefined,
          class: [props.className, classes.Container, attrs.class],
          'data-component': 'LabelGroup',
        },
        content,
      )
    }
  },
})
