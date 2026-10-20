<script setup lang="ts">
import { cloneVNode, h, isVNode, onMounted, provide, shallowRef, useId, watch } from 'vue'
import type { VNode, VNodeChild } from 'vue'
import { ChevronDownIcon } from '@onlikee/octicons-vue'
import { ActionList } from '../ActionList'
import SubItem from '../ActionList/ActionListSubItem.vue'
import classes from '../ActionList/ActionList.module.css'
import { slotChildren } from '../composables/useSlots'
import { itemWithSubNavKey } from './context'
import type { NavListSubNavInstance } from './types'

defineOptions({ name: 'NavListItemWithSubNav', inheritAttrs: false })
const props = defineProps<{
  subNav: VNode
  depth: number
  defaultOpen?: boolean
  tooltipText?: string
}>()
const buttonId = useId()
const subNavId = useId()
const isOpen = shallowRef<boolean>()
const containsCurrentItem = shallowRef(false)
const subNavRef = shallowRef<NavListSubNavInstance | null>(null)
provide(itemWithSubNavKey, { buttonId, subNavId })

function hasCurrentNavItem(node: VNodeChild): boolean {
  if (Array.isArray(node)) return node.some(hasCurrentNavItem)
  if (!isVNode(node)) return false
  const current = node.props?.['aria-current']
  return (Boolean(current) && current !== 'false') || hasCurrentNavItem(slotChildren(node))
}

function syncCurrentItem() {
  const current =
    hasCurrentNavItem(props.subNav) ||
    Boolean(subNavRef.value?.element?.querySelector('[aria-current]:not([aria-current=false])'))
  containsCurrentItem.value = current
  if (current) isOpen.value = true
}
onMounted(syncCurrentItem)
watch(() => [props.subNav, hasCurrentNavItem(props.subNav)], syncCurrentItem, { flush: 'post' })

const Render = ({ children }: { children: VNodeChild[] }) => {
  if (isOpen.value === undefined) {
    containsCurrentItem.value = hasCurrentNavItem(props.subNav)
    isOpen.value = props.defaultOpen || containsCurrentItem.value
  }
  return h(
    ActionList.Item,
    {
      id: buttonId,
      'aria-expanded': isOpen.value,
      'aria-controls': subNavId,
      active: !isOpen.value && containsCurrentItem.value,
      onSelect: () => {
        isOpen.value = !isOpen.value
      },
      style: { '--subitem-depth': props.depth },
      'data-component': 'NavList.Item',
      privateTooltipText: props.tooltipText,
    },
    {
      default: () => [
        ...children,
        h(ActionList.TrailingVisual, null, {
          default: () => h(ChevronDownIcon, { class: classes['action-list-expand-icon'] }),
        }),
        h(SubItem, null, { default: () => cloneVNode(props.subNav, { ref: subNavRef }) }),
      ],
    },
  )
}
const slots = defineSlots<{ default?: () => VNodeChild[] }>()
</script>

<template>
  <Render :children="slots.default?.() ?? []" />
</template>
