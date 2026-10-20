<script setup lang="ts">
import { h, nextTick, shallowRef, useAttrs, useId } from 'vue'
import type { Component } from 'vue'
import { PlusIcon } from '@onlikee/octicons-vue'
import { ActionList } from '../ActionList'
import Item from './NavListItem.vue'
import type { NavListGroupExpandProps, NavListGroupExpandInstance } from './types'

defineOptions({ name: 'NavListGroupExpand', inheritAttrs: false })
const props = withDefaults(defineProps<NavListGroupExpandProps>(), { label: 'Show more', pages: 0 })
const attrs = useAttrs()
const currentPage = shallowRef(0)
const groupId = useId()
const button = shallowRef<NavListGroupExpandInstance | null>(null)
// The public Item boundary checks polymorphism; the internal render accepts all item variants.
const InternalItem = Item as Component
defineExpose({
  get element() {
    return button.value?.element ?? null
  },
})

async function expand() {
  currentPage.value++
  await nextTick()
  const targets = document.querySelectorAll<HTMLElement>(`[data-expand-focus-target="${groupId}"]`)
  targets[targets.length - 1]?.focus()
}

const Render = () => {
  const itemsPerPage = props.items.length / props.pages
  const amountToShow =
    props.pages === 0 ? props.items.length : Math.ceil(itemsPerPage * currentPage.value)
  const focusTargetIndex = currentPage.value === 1 ? 0 : amountToShow - Math.floor(itemsPerPage)
  return [
    currentPage.value > 0
      ? props.items.map((item, index) => {
          if (index >= amountToShow) return
          const focusTarget = index === focusTargetIndex ? groupId : undefined
          if (props.renderItem)
            return props.renderItem({ ...item, 'data-expand-focus-target': focusTarget })
          const { text, trailingVisual, leadingVisual, trailingAction, ...rest } = item
          return h(
            InternalItem,
            { ...rest, key: index, 'data-expand-focus-target': focusTarget },
            {
              default: () => [
                leadingVisual
                  ? h(ActionList.LeadingVisual, null, { default: () => h(leadingVisual) })
                  : null,
                text,
                trailingVisual
                  ? h(ActionList.TrailingVisual, null, { default: () => h(trailingVisual) })
                  : null,
                trailingAction
                  ? h(ActionList.TrailingAction, {
                      ...trailingAction,
                      label: trailingAction.label || '',
                    })
                  : null,
              ],
            },
          )
        })
      : null,
    currentPage.value < props.pages || currentPage.value === 0
      ? h(
          ActionList.Item,
          {
            as: 'button',
            'aria-expanded': 'false',
            ref: button,
            onSelect: expand,
            ...attrs,
          },
          {
            default: () => [
              props.label,
              h(ActionList.TrailingVisual, null, { default: () => h(PlusIcon) }),
            ],
          },
        )
      : null,
  ]
}
</script>

<template>
  <Render />
</template>
