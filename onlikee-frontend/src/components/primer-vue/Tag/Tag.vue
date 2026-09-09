<template>
  <span
    class="tag"
    :data-size="size"
    :data-removable="showRemove ? '' : undefined"
    :style="customStyle"
  >
    <span
      v-if="hasLeadingVisual"
      class="tag__visual"
      :data-size="size"
    >
      <RenderNodes :nodes="parsedChildren.leadingVisual" />
    </span>
    <RenderNodes :nodes="parsedChildren.label" />
    <button
      v-if="showRemove"
      class="tag__remove"
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
      ><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" /></svg>
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
  return nodes.flatMap(node => {
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

const props = withDefaults(defineProps<{
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  color?: string
  background?: string
  removable?: boolean
}>(), {
  size: 'medium',
  color: '',
  background: '',
  removable: false,
})

const emit = defineEmits<{
  remove: []
}>()

const showRemove = computed(() => props.removable)

const handleRemove = () => {
  emit('remove')
}

const customStyle = computed(() => ({
  color: props.color,
  background: props.background
}))
</script>

<style scoped>
.tag {
    display: inline-flex;
    align-items: center;
    background: var(--bgColor-accent-muted, #ddf4ff);
    color: var(--fgColor-link, #0969da);
    border-radius: 100px;
    font-weight: 500;
    white-space: nowrap;
}

.tag[data-size='small'] {
    padding: 0 4px;
    line-height: 16px;
    font-size: 12px;
}

.tag[data-size='medium'] {
    padding: 0 6px;
    line-height: 20px;
    font-size: 12px;
}

.tag[data-size='large'] {
    padding: 0 8px;
    line-height: 24px;
    font-size: 14px;
}

.tag[data-size='xlarge'] {
    padding: 0 12px;
    line-height: 32px;
    font-size: 14px;
}

.tag[data-removable] {
    padding-right: 0;
}

.tag__visual {
    display: inline-flex;
    align-items: center;
}

.tag__visual[data-size='small'],
.tag__visual[data-size='medium'] {
    margin-right: 4px;
}

.tag__visual[data-size='large'],
.tag__visual[data-size='xlarge'] {
    margin-right: 6px;
}

.tag__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    color: currentColor;
    font-size: 14px;
    line-height: 1;
    border-radius: 9999px;
    flex-shrink: 0;
}

.tag__remove[data-size='small'] {
    width: 16px;
    height: 16px;
    margin-left: 4px;
}

.tag__remove[data-size='medium'] {
    width: 20px;
    height: 20px;
    margin-left: 4px;
}

.tag__remove[data-size='large'] {
    width: 24px;
    height: 24px;
    margin-left: 6px;
}

.tag__remove[data-size='xlarge'] {
    width: 32px;
    height: 32px;
    margin-left: 6px;
}

.tag__remove:hover {
    background: var(--control-transparent-bgColor-hover, #818b981a);
}

.tag__remove svg[data-size='small'],
.tag__remove svg[data-size='medium'] {
    width: 12px;
    height: 12px;
}

.tag__remove svg[data-size='large'],
.tag__remove svg[data-size='xlarge'] {
    width: 16px;
    height: 16px;
}
</style>
