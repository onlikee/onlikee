<script lang="ts">
import { Comment, defineComponent, Fragment, h, inject, Text, type PropType, type VNode } from 'vue'
import { useTab } from '../Tabs'
import CounterLabel from '../CounterLabel/CounterLabel.vue'
import { normalizeReactStyle } from '../internal/style'
import { renderNode } from '../internal/renderNode'
import { underlinePanelsKey } from './context'
import type { UnderlinePanelsTabProps } from './types'
import classes from './UnderlineTabbedInterface.module.css'

export default defineComponent({
  name: 'UnderlinePanelsTab',
  inheritAttrs: false,
  props: {
    value: { type: String, default: undefined },
    counter: { type: [Number, String], default: undefined },
    icon: {
      type: [Object, Function] as PropType<UnderlinePanelsTabProps['icon']>,
      default: undefined,
    },
    className: { type: String, default: undefined },
  },
  emits: { select: (_event: MouseEvent | KeyboardEvent) => true },
  setup(props, { slots, attrs, emit }) {
    const { tabProps } = useTab(() => ({ value: props.value ?? '' }))
    const context = inject(underlinePanelsKey)
    return () => {
      const children = (slots.default?.() ?? []).filter((node) => node.type !== Comment)
      const directText = (nodes: VNode[]): string =>
        nodes
          .map((node) => {
            if (node.type === Text && typeof node.children === 'string') return node.children
            if (node.type === Fragment && node.patchFlag !== 0 && Array.isArray(node.children))
              return directText(node.children as VNode[])
            return ''
          })
          .join('')
      const { onKeydown, onMousedown, onFocus, ...tabAttrs } = tabProps.value
      const { class: classValue, style, ...rest } = attrs
      return h(
        'button',
        {
          ...rest,
          ...tabAttrs,
          class: [classes.UnderlineItem, props.className, classValue],
          style: normalizeReactStyle(style),
          type: 'button',
          onClick(event: MouseEvent) {
            if (!event.defaultPrevented) emit('select', event)
          },
          onKeydown(event: KeyboardEvent) {
            onKeydown(event)
            if ((event.key === ' ' || event.key === 'Enter') && !event.defaultPrevented)
              emit('select', event)
          },
          onMousedown,
          onFocus,
        },
        [
          props.icon ? h('span', { 'data-component': 'icon' }, [renderNode(props.icon)]) : null,
          children.length
            ? h(
                'span',
                { 'data-component': 'text', 'data-content': directText(children) || undefined },
                children,
              )
            : null,
          props.counter !== undefined
            ? h('span', { 'data-component': 'counter' }, [
                context?.loadingCounters.value
                  ? h('span', { class: classes.LoadingCounter })
                  : h(CounterLabel, null, { default: () => props.counter }),
              ])
            : null,
        ],
      )
    }
  },
})
</script>
