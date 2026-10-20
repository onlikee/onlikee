<script setup lang="ts">
import { Fragment, cloneVNode, h, isVNode, useAttrs, useSlots } from 'vue'
import type { VNode, VNodeChild } from 'vue'
import { ActionList } from '../ActionList'
import { useSlots as extractSlots } from '../composables/useSlots'
import { useGroupHeadingTag } from './context'
import GroupHeading from './NavListGroupHeading.vue'
import type { NavListGroupProps } from './types'

defineOptions({ name: 'NavListGroup', inheritAttrs: false })
const props = defineProps<NavListGroupProps>()
const attrs = useAttrs()
const slots = useSlots()
const groupHeadingTag = useGroupHeadingTag()

function flattenFragments(children: VNodeChild): VNodeChild[] {
  if (Array.isArray(children)) return children.flatMap(flattenFragments)
  if (isVNode(children) && children.type === Fragment)
    return flattenFragments(children.children as VNodeChild)
  return [children]
}

function removeHeading(children: VNodeChild, heading: VNode): VNodeChild {
  if (Array.isArray(children)) return children.map((child) => removeHeading(child, heading))
  if (children === heading) return null
  if (isVNode(children) && children.type === Fragment) {
    const fragment = cloneVNode(children)
    fragment.children = removeHeading(children.children as VNodeChild, heading) as VNode[]
    return fragment
  }
  return children
}

const Render = ({ children }: { children: VNode[] }) => {
  const [matched] = extractSlots(flattenFragments(children), { groupHeading: GroupHeading })
  const heading = matched.groupHeading
  return [
    props.hideDivider ? null : h(ActionList.Divider),
    h(
      ActionList.Group,
      { ...attrs, className: props.className },
      {
        default: () => [
          heading
            ? cloneVNode(heading, { headingWrapElement: 'div' })
            : props.title
              ? h(
                  ActionList.GroupHeading,
                  {
                    as: groupHeadingTag(),
                    'data-component': 'ActionList.GroupHeading',
                  },
                  { default: () => props.title },
                )
              : null,
          heading ? removeHeading(children, heading) : children,
        ],
      },
    ),
  ]
}
</script>

<template>
  <Render :children="slots.default?.() ?? []" />
</template>
