import { cloneVNode, h, isVNode, toRaw, type Component, type VNodeChild } from 'vue'

/** A Vue counterpart of a React node or component-valued visual prop. */
export type NodeProp = VNodeChild | Component

export function renderNode(node: NodeProp | undefined, props?: Record<string, unknown>): VNodeChild {
  if (isVNode(node)) return props ? cloneVNode(node, props) : node
  if (typeof node !== 'object' && typeof node !== 'function' || Array.isArray(node)) {
    return node as VNodeChild
  }
  return node ? h(toRaw(node) as Component, props) : null
}
