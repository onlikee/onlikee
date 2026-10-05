import { cloneVNode, Comment, defineComponent, Fragment, inject, isVNode, type VNode, type VNodeChild } from 'vue'
import { selectValueKey } from './context'

/** Apply SSR defaults to native option children, including native optgroups. */
export default defineComponent({
  name: 'SelectNativeOptions',
  setup(_, { slots }) {
    const initialValue = inject(selectValueKey, undefined)?.value
    function text(nodes: VNodeChild): string {
      if (Array.isArray(nodes)) return nodes.map(text).join('')
      if (isVNode(nodes)) return nodes.type === Comment ? '' : text(nodes.children as VNodeChild)
      return typeof nodes === 'string' || typeof nodes === 'number' ? String(nodes) : ''
    }
    function children(nodes: VNodeChild): VNodeChild {
      if (Array.isArray(nodes)) return nodes.map(children)
      if (!isVNode(nodes)) return nodes
      if (nodes.type === 'option' && initialValue !== undefined) {
        const optionValue = nodes.props?.value !== undefined ? String(nodes.props.value ?? '') : text(nodes.children as VNodeChild).replace(/[\t\n\f\r ]+/g, ' ').trim()
        return cloneVNode(nodes, { selected: optionValue === initialValue })
      }
      if (nodes.type === Fragment || nodes.type === 'optgroup') {
        const cloned = cloneVNode(nodes)
        cloned.children = children(nodes.children as VNodeChild) as VNode['children']
        return cloned
      }
      return nodes
    }
    return () => children(slots.default?.())
  },
})
