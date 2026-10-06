import { cloneVNode, h, isVNode, toRaw, type Component, type VNodeChild } from 'vue'

/* 渲染节点或组件形式的视觉属性。 */
export type NodeProp = VNodeChild | Component

export function renderNode(node: NodeProp | undefined, props?: Record<string, unknown>): VNodeChild {
  if (isVNode(node)) return props ? cloneVNode(node, props) : node
  if (typeof node !== 'object' && typeof node !== 'function' || Array.isArray(node)) {
    return node as VNodeChild
  }
  return node ? h(toRaw(node) as Component, props) : null
}
