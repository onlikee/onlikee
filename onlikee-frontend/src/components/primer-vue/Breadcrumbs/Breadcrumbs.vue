<script lang="ts">
import {
  Comment,
  Fragment,
  Text,
  defineComponent,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  shallowRef,
  watch,
  type PropType,
  type VNode,
} from 'vue'
import BreadcrumbsMenuItem from './BreadcrumbsMenuItem.vue'
import BreadcrumbsItem from './BreadcrumbsItem.vue'
import BreadcrumbsSeparator from './BreadcrumbsSeparator.vue'
import classes from './Breadcrumbs.module.css'
import { normalizeReactStyle } from '../internal/style'
import type { BreadcrumbsProps } from './types'

const MENU_BUTTON_FALLBACK_WIDTH = 32
const CONTAINER_FALLBACK_WIDTH = 800

function calculateOverflow({
  availableWidth,
  itemCount,
  childArrayWidths,
  menuButtonWidth,
  overflow,
  hideRoot,
}: {
  availableWidth: number
  itemCount: number
  childArrayWidths: number[]
  menuButtonWidth: number
  overflow: NonNullable<BreadcrumbsProps['overflow']>
  hideRoot: boolean
}) {
  let effectiveHideRoot = hideRoot
  const rootItemWidth = childArrayWidths[0] ?? 0
  const isNarrow = availableWidth < 544
  let minVisibleItems = 4
  if (!effectiveHideRoot) minVisibleItems = 3
  else if (isNarrow && itemCount > 2) minVisibleItems = 1

  const calculateVisibleItemsWidth = (widths: number[]) => {
    const total = widths.reduce((sum, width) => sum + width + 16, 0)
    return !effectiveHideRoot ? rootItemWidth + total : total
  }
  let visibleWidths = [...childArrayWidths]
  let menuItemCount = 0
  if (availableWidth > 0 && visibleWidths.length > 0) {
    let total = calculateVisibleItemsWidth(visibleWidths)
    while (
      (overflow === 'menu' || overflow === 'menu-with-root') &&
      (total > availableWidth || visibleWidths.length > minVisibleItems)
    ) {
      menuItemCount += 1
      visibleWidths = visibleWidths.slice(1)
      total = calculateVisibleItemsWidth(visibleWidths) + menuButtonWidth
      if (visibleWidths.length === 1 && total > availableWidth) {
        effectiveHideRoot = true
        break
      } else {
        effectiveHideRoot = hideRoot
      }
    }
  }
  return { menuItemCount, effectiveHideRoot }
}

// Vue uses structural Fragments for template groups and v-for.
function flattenChildren(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Fragment && node.patchFlag !== 0 && Array.isArray(node.children))
      return flattenChildren(node.children as VNode[])
    return node.type === Comment ? [] : [node]
  })
}

export default Object.assign(
  defineComponent({
    name: 'Breadcrumbs',
    inheritAttrs: false,
    props: {
      className: { type: String, default: undefined },
      style: {
        type: [Object, String, Array] as PropType<BreadcrumbsProps['style']>,
        default: undefined,
      },
      overflow: { type: String as PropType<BreadcrumbsProps['overflow']>, default: 'wrap' },
      variant: { type: String as PropType<BreadcrumbsProps['variant']>, default: 'normal' },
    },
    setup(props, { attrs, slots }) {
      const instance = getCurrentInstance()!
      const container = shallowRef<HTMLElement | null>(null)
      const childArrayWidths = shallowRef<number[]>([])
      const containerWidth = shallowRef<number | null>(null)
      const menuButtonWidth = shallowRef(MENU_BUTTON_FALLBACK_WIDTH)
      let childArray: VNode[] = []
      let previousParentVNode: VNode | undefined
      let previousOverflow: BreadcrumbsProps['overflow']
      let needsMeasurement = true
      let stopObserving: (() => void) | undefined

      function measureItems() {
        if (!needsMeasurement) return
        needsMeasurement = false
        if (props.overflow === 'wrap' || !container.value) return
        containerWidth.value = container.value.offsetWidth
        const list = container.value.querySelector('ol')
        if (list && list.children.length > 0 && list.children.length === childArray.length)
          childArrayWidths.value = Array.from(
            list.children,
            (child) => (child as HTMLElement).offsetWidth,
          )
      }

      function observeContainer() {
        stopObserving?.()
        stopObserving = undefined
        const target = container.value
        if (props.overflow === 'wrap' || !target) return
        if (typeof ResizeObserver === 'function') {
          const observer = new ResizeObserver((entries) => {
            if (entries[0]) containerWidth.value = Math.round(entries[0].contentRect.width)
          })
          observer.observe(target)
          stopObserving = () => observer.disconnect()
        } else {
          let previousRect: DOMRect | undefined
          const saveDimensions = () => {
            const rect = target.getBoundingClientRect()
            if (rect.width !== previousRect?.width || rect.height !== previousRect?.height)
              containerWidth.value = Math.round(rect.width)
            previousRect = rect
          }
          window.addEventListener('resize', saveDimensions)
          stopObserving = () => window.removeEventListener('resize', saveDimensions)
        }
      }

      function measureMenuButton(element: HTMLDetailsElement | null) {
        // Match the source selector and its fallback when IconButton renders as summary.
        const button = element?.querySelector<HTMLElement>('button[data-component="IconButton"]')
        if (button) menuButtonWidth.value = button.offsetWidth
      }

      onMounted(() => {
        measureItems()
        observeContainer()
      })
      onUpdated(measureItems)
      watch(() => props.overflow, observeContainer, { flush: 'post' })
      onBeforeUnmount(() => stopObserving?.())

      return () => {
        const children = flattenChildren(slots.default?.() ?? [])
        childArray = children.filter((child) => child.type !== Text)
        if (previousParentVNode !== instance.vnode || previousOverflow !== props.overflow) {
          needsMeasurement = true
          previousParentVNode = instance.vnode
          previousOverflow = props.overflow
        }
        const hideRoot = props.overflow !== 'menu-with-root'
        const { menuItemCount, effectiveHideRoot } =
          props.overflow === 'wrap' || childArrayWidths.value.length !== childArray.length
            ? { menuItemCount: 0, effectiveHideRoot: hideRoot }
            : calculateOverflow({
                availableWidth: containerWidth.value ?? CONTAINER_FALLBACK_WIDTH,
                itemCount: childArray.length,
                childArrayWidths: childArrayWidths.value,
                menuButtonWidth: menuButtonWidth.value,
                overflow: props.overflow,
                hideRoot,
              })

        let finalChildren: VNode[]
        if (props.overflow === 'wrap' || menuItemCount === 0) {
          finalChildren = children.map((child, index) =>
            h('li', { class: classes.ItemWrapper, key: child.key ?? index }, [child]),
          )
        } else {
          const menuItems = childArray.slice(0, menuItemCount)
          const effectiveMenuItems = effectiveHideRoot ? menuItems : menuItems.slice(1)
          const menuElement = h(
            'li',
            { class: classes.BreadcrumbsItem, 'data-overflow-menu': '', key: 'breadcrumbs-menu' },
            [
              h(BreadcrumbsMenuItem, {
                items: effectiveMenuItems,
                'aria-label': `${effectiveMenuItems.length} more breadcrumb items`,
                onElement: measureMenuButton,
              }),
              h(BreadcrumbsSeparator),
            ],
          )
          const visibleElements = childArray
            .slice(menuItemCount)
            .map((child, index) =>
              h('li', { class: classes.BreadcrumbsItem, key: `visible + ${index}` }, [
                child,
                h(BreadcrumbsSeparator),
              ]),
            )
          const rootElement = h('li', { class: classes.BreadcrumbsItem, key: 'rootElement' }, [
            childArray[0],
            h(BreadcrumbsSeparator),
          ])
          finalChildren = effectiveHideRoot
            ? [menuElement, ...visibleElements]
            : [rootElement, menuElement, ...visibleElements]
        }

        return h(
          'nav',
          {
            class: [props.className, attrs.class, classes.BreadcrumbsBase],
            'aria-label': 'Breadcrumbs',
            style: normalizeReactStyle(props.style),
            ref: container,
            'data-overflow': props.overflow,
            'data-variant': props.variant,
            'data-component': 'Breadcrumbs',
          },
          [h('ol', { class: classes.BreadcrumbsList }, finalChildren)],
        )
      }
    },
  }),
  { Item: BreadcrumbsItem },
)
</script>
