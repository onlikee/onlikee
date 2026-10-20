<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'a'">
import { h, inject, shallowRef, useAttrs, useSlots } from 'vue'
import type { Component, NativeElements, VNode } from 'vue'
import { ActionList } from '../ActionList'
import { useSlots as extractSlots } from '../composables/useSlots'
import { subNavDepthKey } from './context'
import SubNav from './NavListSubNav.vue'
import ItemWithSubNav from './NavListItemWithSubNav.vue'
import type { NavListItemComponentProps, NavListItemInstance } from './types'

defineOptions({ name: 'NavListItem', inheritAttrs: false })
const props = defineProps<NavListItemComponentProps<As>>()
const attrs = useAttrs()
const slots = useSlots()
const depth = inject(subNavDepthKey, null)
const link = shallowRef<NavListItemInstance | null>(null)
defineExpose({
  get element() {
    return link.value?.element ?? null
  },
})

const Render = ({ children }: { children: VNode[] }) => {
  const [matched, rest] = extractSlots(children, {
    subNav: SubNav,
    trailingAction: ActionList.TrailingAction,
  })
  if (!matched.subNav && props.defaultOpen)
    console.error('NavList.Item must have a NavList.SubNav to use defaultOpen.')
  if (matched.subNav)
    return h(
      ItemWithSubNav,
      {
        subNav: matched.subNav,
        depth: depth?.value ?? 0,
        defaultOpen: props.defaultOpen,
        tooltipText: props.tooltipText,
      },
      { default: () => rest },
    )
  const { as, href, defaultOpen: _defaultOpen, tooltipText, ...itemProps } = props
  const ariaCurrent = attrs['aria-current']
  return h(
    ActionList.LinkItem,
    {
      ref: link,
      as,
      active: Boolean(ariaCurrent) && ariaCurrent !== 'false',
      style: { '--subitem-depth': depth?.value ?? 0 },
      'data-component': 'NavList.Item',
      privateTooltipText: tooltipText,
      ...itemProps,
      ...(href === undefined ? {} : { href }),
      ...attrs,
    },
    { default: () => children },
  )
}
</script>

<template>
  <Render :children="slots.default?.() ?? []" />
</template>
