<script lang="ts">
import classes from './ActionList.module.css'
import { defineComponent, h, ref, type Component, type PropType } from 'vue'
import Item from './ActionListItemBase.vue'
import Tooltip from '../TooltipV2/Tooltip.vue'
import { normalizeReactStyle } from '../internal/style'
import { exposeElement } from './context'
import type { ActionListItemSize, ActionListItemVariant } from './types'
export default defineComponent({
  name: 'ActionListLinkItem', __SLOT__: Symbol('ActionList.LinkItem'), inheritAttrs: false,
  props: {
    as: { type: [String, Object, Function] as PropType<string | Component>, default: 'a' },
    active: Boolean, inactiveText: { type: String, default: undefined },
    variant: { type: String as PropType<ActionListItemVariant>, default: 'default' },
    size: { type: String as PropType<ActionListItemSize>, default: 'medium' },
    className: { type: String, default: undefined }, privateTooltipText: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, expose }) {
    const element = ref<HTMLElement | null>(null)
    const setElement = (node: unknown) => {
      const instance = node as { element?: HTMLElement; $el?: HTMLElement } | null
      element.value = node instanceof HTMLElement ? node : instance?.element ?? instance?.$el ?? null
    }
    expose(exposeElement(element))
    return () => h(Item, {
      active: props.active, inactiveText: props.inactiveText, variant: props.variant,
      size: props.size, className: props.className, class: attrs.class, 'data-inactive': props.inactiveText ? true : undefined,
      privateItemWrapper: (bindings: Record<string, unknown>, children: import('vue').VNodeChild[]) => {
        const { onClick, ...rest } = bindings
        if (props.inactiveText) return h('span', rest, children)
        const { class: _class, ...linkAttrs } = attrs
        const link = h(props.as, { 'data-component': 'Link', ...rest, ...linkAttrs, ref: setElement, class: [rest.class, classes['action-list-link']], style: normalizeReactStyle(attrs.style),
          onClick: (event: MouseEvent) => {
            (onClick as ((event: MouseEvent) => void) | undefined)?.(event)
            const handlers = attrs.onClick
            if (Array.isArray(handlers)) handlers.forEach(handler => handler(event))
            else if (typeof handlers === 'function') handlers(event)
          }
        }, typeof props.as === 'string' ? children : { default: () => children })
        return props.privateTooltipText ? h(Tooltip, { text: props.privateTooltipText, direction: 'e', delay: 'medium' }, { default: () => link }) : link
      }
    }, slots)
  }
})
</script>
