<script setup lang="ts">
import { computed, h, inject, provide, shallowRef, useSlots } from 'vue'
import type { VNode } from 'vue'
import classes from '../ActionList/ActionList.module.css'
import { itemWithSubNavKey, subNavDepthKey } from './context'

defineOptions({ name: 'NavListSubNav', inheritAttrs: false, __SLOT__: Symbol('NavList.SubNav') })
const parent = inject(itemWithSubNavKey, { buttonId: '', subNavId: '' })
const parentDepth = inject(subNavDepthKey, null)
const depth = computed(() => parentDepth?.value ?? 0)
provide(
  subNavDepthKey,
  computed(() => depth.value + 1),
)
const element = shallowRef<HTMLUListElement | null>(null)
const slots = useSlots()
defineExpose({ element })

const Render = ({ children }: { children: VNode[] }) => {
  if (!parent.buttonId || !parent.subNavId)
    console.error('NavList.SubNav must be a child of a NavList.Item')
  if (depth.value > 3) {
    console.error('NavList.SubNav only supports four levels of nesting')
    return null
  }
  return h(
    'ul',
    {
      class: classes['action-list-sub-group'],
      id: parent.subNavId,
      'aria-labelledby': parent.buttonId,
      ref: element,
      'data-component': 'NavList.SubNav',
    },
    children,
  )
}
</script>

<template>
  <Render :children="slots.default?.() ?? []" />
</template>
