<template>
  <li class="action-list-group">
    <RenderNodes :nodes="parsedChildren.heading" />
    <ul class="action-list-list action-list-group-list">
      <RenderNodes :nodes="parsedChildren.items" />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { Comment, Fragment, Text, computed, useSlots, type VNode } from 'vue'

interface MarkerType {
  name?: string
  __name?: string
}

interface ParsedChildren {
  heading: VNode[]
  items: VNode[]
}

const RenderNodes = (props: { nodes: VNode[] }) => props.nodes

function getComponentName(type: VNode['type']) {
  if (typeof type !== 'object' && typeof type !== 'function') return ''
  const marker = type as MarkerType
  return marker.name ?? marker.__name ?? ''
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
  const parsed: ParsedChildren = { heading: [], items: [] }
  for (const node of flattenChildren(nodes)) {
    if (node.type === Comment || isWhitespaceNode(node)) continue
    const componentName = getComponentName(node.type)
    if (componentName === 'ActionListGroupHeading') {
      parsed.heading.push(node)
      continue
    }
    parsed.items.push(node)
  }
  return parsed
}

const slots = useSlots()
const parsedChildren = computed(() => parseChildren(slots.default?.() ?? []))
</script>

<style scoped>
.action-list-group {
  list-style: none;
}

.action-list-group:not(:first-child) {
  margin-block-start: 8px;
}

.action-list-group-list {
  padding: 0;
  margin: 0;
  list-style: none;
}
</style>
