<script setup lang="ts">
import {
  Comment,
  Fragment,
  Text,
  h,
  onMounted,
  shallowRef,
  useAttrs,
  useSlots,
  type VNode,
} from 'vue'
import type { RelativeTimeElement } from '@github/relative-time-element'
import type { RelativeTimeOptions } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'RelativeTime', inheritAttrs: false })
const props = defineProps<RelativeTimeOptions>()
const attrs = useAttrs()
const slots = useSlots()
const element = shallowRef<RelativeTimeElement | null>(null)
onMounted(async () => {
  // Loading after mount preserves the UTC server fallback during hydration and
  // keeps HTMLElement/customElements out of the server module evaluation path.
  if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
    await import('@github/relative-time-element')
  }
})

function hasContent(nodes: VNode[]): boolean {
  return nodes.some((node) => {
    if (node.type === Comment) return false
    if (node.type === Fragment && node.patchFlag !== 0 && Array.isArray(node.children))
      return hasContent(node.children as VNode[])
    return node.type !== Text || node.children !== ''
  })
}

const Render = () => {
  const {
    date: suppliedDate,
    datetime,
    noTitle,
    className,
    onRelativeTimeUpdated,
    ...options
  } = props
  const date = datetime ? new Date(datetime) : suppliedDate
  const attributes: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(options)) {
    if (value === undefined) continue
    // The native, not-yet-upgraded element has a read-only namespace `prefix`.
    // Attributes work before and after upgrade, including getter-only timeZone.
    attributes[`^${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`] = value
  }
  const fallback =
    date?.toLocaleDateString('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }) ?? ''
  const children = slots.default?.()
  return h(
    'relative-time',
    {
      ...attributes,
      ...Object.fromEntries(Object.entries(attrs).filter(([, value]) => value !== undefined)),
      ref: element,
      class: [className, attrs.class],
      style: normalizeReactStyle(attrs.style),
      '^datetime': date?.toISOString() ?? '',
      '^no-title': noTitle ? '' : undefined,
      onRelativeTimeUpdated,
      'data-component': 'RelativeTime',
    },
    children && hasContent(children) ? children : fallback,
  )
}
defineExpose({ element, update: () => element.value?.update() })
</script>

<template><Render /></template>
