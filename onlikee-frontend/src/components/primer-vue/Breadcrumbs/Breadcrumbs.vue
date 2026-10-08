<script setup lang="ts">
import {
  Comment,
  Fragment,
  Text,
  cloneVNode,
  h,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  useCssModule,
  useAttrs,
  useSlots,
  type VNode,
} from 'vue'
import type { BreadcrumbsProps } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<BreadcrumbsProps>(), { overflow: 'wrap', variant: 'normal' })
const attrs = useAttrs()
const slots = useSlots()
const classes = useCssModule()
const container = ref<HTMLElement>()
const menu = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const open = ref(false)
const widths = ref<number[]>([])
const availableWidth = ref(0)
let observer: ResizeObserver | undefined

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Fragment && Array.isArray(node.children))
      return flatten(node.children as VNode[])
    return node.type === Comment || node.type === Text ? [] : [node]
  })
}

function measure() {
  if (!container.value || props.overflow === 'wrap') return
  availableWidth.value = container.value.clientWidth
  const items = container.value.querySelectorAll<HTMLElement>('[data-measure-item]')
  const next = Array.from(items, (item) => item.offsetWidth)
  if (
    next.length !== widths.value.length ||
    next.some((width, index) => width !== widths.value[index])
  )
    widths.value = next
  observer?.observe(container.value)
  items.forEach((item) => observer?.observe(item))
}

function outside(event: MouseEvent) {
  if (!menu.value?.contains(event.target as Node)) open.value = false
}

function escape(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    open.value = false
    trigger.value?.focus()
  }
}

function separator() {
  return h(
    'svg',
    {
      class: classes['breadcrumbs-separator'],
      width: 16,
      height: 16,
      viewBox: '0 0 16 16',
      'aria-hidden': 'true',
    },
    [
      h('path', {
        d: 'M10.956 1.27994L6.06418 14.7201L5 14.7201L9.89181 1.27994L10.956 1.27994Z',
        fill: 'currentColor',
      }),
    ],
  )
}

onMounted(() => {
  observer = new ResizeObserver(measure)
  measure()
  document.addEventListener('click', outside)
  document.addEventListener('keydown', escape)
})
onUpdated(measure)
onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('click', outside)
  document.removeEventListener('keydown', escape)
})

function RenderBreadcrumbs() {
  const children = flatten(slots.default?.() ?? [])
  let count = 0
  let keepRoot = props.overflow === 'menu-with-root'
  if (
    props.overflow !== 'wrap' &&
    widths.value.length === children.length &&
    availableWidth.value > 0
  ) {
    const limit = keepRoot ? 3 : availableWidth.value < 544 && children.length > 2 ? 1 : 4
    const total = (start: number) =>
      widths.value.slice(start).reduce((sum, width) => sum + width, 0) +
      (start > 0 ? 44 : 0) +
      (keepRoot && start > 0 ? (widths.value[0] ?? 0) : 0)
    while (
      count < children.length - 1 &&
      (children.length - count > limit || total(count) > availableWidth.value)
    )
      count++
    if (keepRoot && count > 0 && total(count) > availableWidth.value) keepRoot = false
  }
  const hidden = children.map((_, index) => index < count && !(index === 0 && keepRoot))
  const menuItems = children.filter((_, index) => hidden[index])
  const nodes = children.map((child, index) =>
    h(
      'li',
      {
        key: child.key ?? index,
        class: classes['breadcrumbs-item'],
        'data-measure-item': '',
        'data-collapsed': hidden[index] ? '' : undefined,
        'aria-hidden': hidden[index] ? true : undefined,
        inert: hidden[index] ? true : undefined,
      },
      [child, props.overflow !== 'wrap' && index < children.length - 1 ? separator() : null],
    ),
  )
  if (menuItems.length) {
    nodes.splice(
      keepRoot ? 1 : 0,
      0,
      h(
        'li',
        {
          class: [classes['breadcrumbs-item'], classes['breadcrumbs-menu']],
          key: 'overflow',
          ref: menu,
        },
        [
          h(
            'button',
            {
              ref: trigger,
              type: 'button',
              class: classes['breadcrumbs-trigger'],
              'aria-label': `${menuItems.length} more breadcrumb items`,
              'aria-expanded': open.value,
              onClick: () => {
                open.value = !open.value
              },
            },
            [
              h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', 'aria-hidden': 'true' }, [
                ...[2, 8, 14].map((cx) => h('circle', { cx, cy: 8, r: 1.5, fill: 'currentColor' })),
              ]),
            ],
          ),
          separator(),
          open.value
            ? h(
                'ul',
                { class: classes['breadcrumbs-overlay'] },
                menuItems.map((child, index) => h('li', { key: index }, [cloneVNode(child)])),
              )
            : null,
        ],
      ),
    )
  }
  return h(
    'nav',
    mergeProps({ class: classes['breadcrumbs'], 'aria-label': 'Breadcrumbs' }, attrs, {
      ref: container,
      'data-component': 'Breadcrumbs',
      'data-overflow': props.overflow,
      'data-variant': props.variant,
    }),
    [h('ol', { class: classes['breadcrumbs-list'] }, nodes)],
  )
}
</script>

<template>
  <RenderBreadcrumbs />
</template>

<style module src="./Breadcrumbs.module.css"></style>
