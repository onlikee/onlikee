<template>
  <div
    class="action-list-group-heading-wrap"
    :data-variant="variant"
    :data-has-trailing-action="hasTrailingAction ? 'true' : undefined"
  >
    <h3 class="action-list-group-heading">
      <RenderNodes :nodes="parsedChildren.label" />
    </h3>
    <span
      v-if="hasTrailingAction"
      class="action-list-group-heading-action"
    >
      <RenderNodes :nodes="parsedChildren.trailingAction" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { Comment, Fragment, Text, computed, useSlots, type VNode } from 'vue'

defineOptions({ name: 'ActionListGroupHeading' })

interface MarkerType {
  name?: string
  __name?: string
}

interface ParsedChildren {
  label: VNode[]
  trailingAction: VNode[]
}

const RenderNodes = (props: { nodes: VNode[] }) => props.nodes

function getComponentName(type: VNode['type']) {
  if (typeof type !== 'object' && typeof type !== 'function') return ''
  const marker = type as MarkerType
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

function parseChildren(nodes: VNode[]): ParsedChildren {
  const parsed: ParsedChildren = { label: [], trailingAction: [] }
  for (const node of flattenChildren(nodes)) {
    if (node.type === Comment || isWhitespaceNode(node)) continue
    const componentName = getComponentName(node.type)
    if (componentName === 'ActionListGroupHeadingTrailingAction') {
      parsed.trailingAction.push(...readSlotChildren(node))
      continue
    }
    parsed.label.push(node)
  }
  return parsed
}

withDefaults(
  defineProps<{
    variant?: 'subtle' | 'filled'
  }>(),
  {
    variant: 'subtle'
  }
)

const slots = useSlots()
const parsedChildren = computed(() => parseChildren(slots.default?.() ?? []))
const hasTrailingAction = computed(() => Boolean(parsedChildren.value.trailingAction.length))
</script>

<style scoped>
.action-list-group-heading-wrap {
  display: flex;
  flex-direction: column;
  padding: 6px 8px;
  color: var(--fgColor-muted, #59636e);
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
}

.action-list-group-heading-wrap[data-variant='filled'] {
  margin-block: 7px 8px;
  background: var(--bgColor-muted, #f6f8fa);
  border-block: 1px solid var(--borderColor-muted, #d1d9e0b3);
}

.action-list-group-heading {
  align-self: flex-start;
  margin: 0;
  color: inherit;
  font: inherit;
}

.action-list-group-heading-wrap[data-has-trailing-action='true'] {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.action-list-group-heading-action {
  display: inline-flex;
  align-items: center;
  margin-inline-start: auto;
}
</style>
