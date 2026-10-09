<template>
  <span
    :class="$style['tag']"
    :data-size="size"
    :data-removable="showRemove ? '' : undefined"
    :style="customStyle"
  >
    <span v-if="hasLeadingVisual" :class="$style['tag__visual']" :data-size="size">
      <RenderNodes :nodes="parsedChildren.leadingVisual" />
    </span>
    <RenderNodes :nodes="parsedChildren.label" />
    <button
      v-if="showRemove"
      :class="$style['tag__remove']"
      :data-size="size"
      @click.stop="handleRemove"
    >
      <svg
        :data-size="size"
        aria-hidden="true"
        focusable="false"
        data-octicon="x"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path
          d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
        />
      </svg>
    </button>
  </span>
</template>

<script setup lang="ts">
import { Comment, Fragment, Text, computed, useSlots, type VNode } from 'vue'

interface TagMarkerType {
  name?: string
  __name?: string
}

interface ParsedTagChildren {
  label: VNode[]
  leadingVisual: VNode[]
}

const RenderNodes = (props: { nodes: VNode[] }) => props.nodes

function getComponentName(type: VNode['type']) {
  if (typeof type !== 'object' && typeof type !== 'function') return ''
  const marker = type as TagMarkerType
  return marker.name ?? marker.__name ?? ''
}

function readSlotChildren(node: VNode) {
  if (typeof node.children === 'object' && node.children && 'default' in node.children) {
    const slot = node.children.default
    return typeof slot === 'function' ? slot() : []
  }
  return []
}

function isWhitespaceNode(node: VNode) {
  return node.type === Text && typeof node.children === 'string' && node.children.trim() === ''
}

function flattenChildren(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Fragment && Array.isArray(node.children)) {
      return flattenChildren(node.children as VNode[])
    }
    return [node]
  })
}

function parseTagChildren(nodes: VNode[]): ParsedTagChildren {
  const parsed: ParsedTagChildren = { label: [], leadingVisual: [] }
  for (const node of flattenChildren(nodes)) {
    if (node.type === Comment || isWhitespaceNode(node)) continue
    const componentName = getComponentName(node.type)
    if (componentName === 'TagLeadingVisual') {
      parsed.leadingVisual.push(...readSlotChildren(node))
      continue
    }
    parsed.label.push(node)
  }
  return parsed
}

const slots = useSlots()
const parsedChildren = computed(() => parseTagChildren(slots.default?.() ?? []))
const hasLeadingVisual = computed(() => Boolean(parsedChildren.value.leadingVisual.length))

const props = withDefaults(
  defineProps<{
    size?: 'small' | 'medium' | 'large' | 'xlarge'
    color?: string
    background?: string
    removable?: boolean
  }>(),
  {
    size: 'medium',
    color: '',
    background: '',
    removable: false,
  },
)

const emit = defineEmits<{
  remove: []
}>()

const showRemove = computed(() => props.removable)

const handleRemove = () => {
  emit('remove')
}

const customStyle = computed(() => ({
  color: props.color,
  background: props.background,
}))
</script>
<style module src="./Tag.module.css" />
