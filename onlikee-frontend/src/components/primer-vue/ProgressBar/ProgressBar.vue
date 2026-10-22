<script setup lang="ts">
import { Comment, Fragment, h, shallowRef, useAttrs, type VNode } from 'vue'
import ProgressBarItem from './ProgressBarItem.vue'
import classes from './ProgressBar.module.css'
import { normalizeReactStyle } from '../internal/style'
import type { ProgressBarComponentProps, ProgressBarProps } from './types'

defineOptions({ name: 'ProgressBar', inheritAttrs: false })

const props = withDefaults(defineProps<ProgressBarComponentProps>(), {
  bg: 'success.emphasis',
  barSize: 'default',
  inline: undefined,
  animated: undefined,
})
const slots = defineSlots<{ default?: () => VNode[] }>()
const attrs = useAttrs() as ProgressBarProps
const element = shallowRef<HTMLSpanElement | null>(null)

// Template/v-for Fragments are Vue grouping syntax; explicit Fragments count as children.
function hasChildren(nodes: VNode[]): boolean {
  return nodes.some((node) => {
    if (node.type === Comment) return false
    if (node.type === Fragment && node.patchFlag !== 0 && Array.isArray(node.children))
      return hasChildren(node.children as VNode[])
    return true
  })
}

const Render = () => {
  const children = slots.default?.() ?? []
  const validChildren = hasChildren(children)
  if (validChildren && props.progress) {
    throw new Error('You should pass `progress` or children, not both.')
  }

  const {
    'aria-label': ariaLabel,
    'aria-valuenow': ariaValueNow,
    'aria-valuetext': ariaValueText,
    class: classValue,
    style,
    ...rest
  } = attrs

  return h(
    'span',
    {
      ref: element,
      'data-component': 'ProgressBar',
      class: [props.className, classValue, classes.ProgressBarContainer],
      'data-progress-display': props.inline ? 'inline' : 'block',
      'data-progress-bar-size': props.barSize,
      ...rest,
      style: normalizeReactStyle(style),
    },
    validChildren
      ? children
      : [
          h(ProgressBarItem, {
            'data-animated': props.animated,
            progress: props.progress,
            bg: props.bg,
            'aria-label': ariaLabel,
            'aria-valuenow': ariaValueNow,
            'aria-valuetext': ariaValueText,
          }),
        ],
  )
}

defineExpose({ element })
</script>

<template>
  <Render />
</template>
