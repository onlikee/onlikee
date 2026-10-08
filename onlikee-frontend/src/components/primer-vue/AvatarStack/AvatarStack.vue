<script setup lang="ts">
import {
  cloneVNode,
  Comment,
  Fragment,
  h,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  Text,
  useAttrs,
  useCssModule,
  useSlots,
  type VNode,
} from 'vue'
import type { AvatarResponsiveSize } from '../Avatar'
import type { AvatarStackProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<AvatarStackProps>(), {
  variant: 'cascade',
  shape: 'circle',
  alignRight: false,
  disableExpand: false,
})
const attrs = useAttrs()
const slots = useSlots()
const classes = useCssModule()
const body = shallowRef<HTMLElement>()
const hasInteractiveChildren = shallowRef(false)
let observer: MutationObserver | undefined

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Fragment && Array.isArray(node.children))
      return flatten(node.children as VNode[])
    if (node.type === Comment || node.type === Text) return []
    return [node]
  })
}

function updateInteractiveChildren() {
  const candidates = body.value?.querySelectorAll<HTMLElement>(
    'a[href], button, summary, select, input:not([type="hidden"]), textarea, [tabindex="0"], audio[controls], video[controls], [contenteditable]',
  )
  hasInteractiveChildren.value = Array.from(candidates ?? []).some((node) => {
    if (node.matches('[disabled], [hidden], [inert], [tabindex="-1"]')) return false
    const style = getComputedStyle(node)
    return style.display !== 'none' && style.visibility !== 'hidden'
  })
}

onMounted(() => {
  updateInteractiveChildren()
  observer = new MutationObserver(updateInteractiveChildren)
  if (body.value)
    observer.observe(body.value, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'disabled',
        'hidden',
        'inert',
        'tabindex',
        'href',
        'contenteditable',
        'controls',
        'type',
      ],
    })
})

onBeforeUnmount(() => observer?.disconnect())

function stackStyle(children: VNode[]): Record<string, string> {
  if (typeof props.size === 'number' && props.size)
    return { '--avatar-stack-size': `${props.size}px` }
  const style: Record<string, string> = {}
  for (const key of ['narrow', 'regular', 'wide'] as const) {
    const childSizes = children.map((child) => {
      const size = child.props?.size as number | AvatarResponsiveSize | undefined
      return (typeof size === 'object' ? size[key] : size) || 20
    })
    const size =
      typeof props.size === 'object'
        ? props.size[key] || 20
        : childSizes.length
          ? Math.min(...childSizes)
          : 20
    style[`--stackSize-${key}`] = `${size}px`
  }
  return style
}

// Read the slot during render so v-for/v-if changes update counts and inferred sizes.
const RenderStack = () => {
  const children = flatten(slots.default?.() ?? [])
  return h(
    'span',
    mergeProps(
      {
        class: classes['avatar-stack'],
        'data-component': 'AvatarStack',
        'data-variant': props.variant,
        'data-shape': props.shape,
        'data-avatar-count': children.length > 3 ? '3+' : children.length,
        'data-align-right': props.alignRight ? '' : undefined,
        'data-responsive': !props.size || typeof props.size === 'object' ? '' : undefined,
        style: stackStyle(children),
      },
      attrs,
    ),
    [
      h(
        'div',
        {
          ref: body,
          class: classes['avatar-stack-body'],
          'data-component': 'AvatarStack.Body',
          'data-disable-expand': props.disableExpand ? '' : undefined,
          tabindex: !hasInteractiveChildren.value && !props.disableExpand ? 0 : undefined,
        },
        children.map((child) =>
          cloneVNode(child, {
            class: classes['avatar-stack-item'],
            ...(props.shape === 'square' && typeof child.type !== 'string' ? { square: true } : {}),
          }),
        ),
      ),
    ],
  )
}
</script>

<template>
  <RenderStack />
</template>

<style module src="./AvatarStack.module.css"></style>
