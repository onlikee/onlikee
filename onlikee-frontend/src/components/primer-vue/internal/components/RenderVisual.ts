import { h, isVNode, type Component, type FunctionalComponent, type VNodeChild } from 'vue'

export type InputVisual = VNodeChild | Component

/* 支持以组件或节点指定视觉内容。 */
const RenderVisual: FunctionalComponent<{ visual?: InputVisual }> = ({ visual }) => {
  if (visual === undefined || visual === null) return null
  if (
    isVNode(visual) ||
    Array.isArray(visual) ||
    (typeof visual !== 'object' && typeof visual !== 'function')
  )
    return visual as VNodeChild
  return h(visual as Component)
}
RenderVisual.props = ['visual']
export default RenderVisual
