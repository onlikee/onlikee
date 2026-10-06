<script lang="ts">
import { Comment, Fragment, Text, cloneVNode, defineComponent, h, onBeforeUnmount, provide, shallowRef, watch, type VNode } from 'vue'
import { ChevronRightIcon } from '@/components/octicons-vue3'
import { ActionList, ActionListContainerContext } from '../ActionList'
import { useContainerContext } from '../ActionList/context'
import { isSlot } from '../composables/useSlots'
import Tooltip from '../TooltipV2/Tooltip.vue'
import { useMenuContext } from './context'

export default defineComponent({
  name: 'ActionMenuAnchor', __SLOT__: Symbol('ActionMenu.Anchor'), inheritAttrs: false,
  props: { id: { type: String, default: undefined }, className: { type: String, default: undefined } },
  setup(props, { slots, attrs, expose }) {
    const menu = useMenuContext()
    const container = useContainerContext()
    if (menu.isSubmenu) provide(ActionListContainerContext, {
      ...container, defaultTrailingVisual: h(ChevronRightIcon), afterSelect: () => menu.onOpen()
    })
    const instance = shallowRef<unknown>(null)
    watch(() => {
      if (!instance.value) return null
      const target = instance.value as { element?: unknown; $el?: unknown }
      const element = typeof HTMLElement !== 'undefined' && instance.value instanceof HTMLElement ? instance.value : target.element ?? target.$el
      return typeof HTMLElement !== 'undefined' && element instanceof HTMLElement ? element : null
    }, element => menu.setAnchor(element), { flush: 'post' })
    onBeforeUnmount(() => menu.setAnchor(null))
    expose({ get element() { return menu.anchor.value }, focus: () => menu.anchor.value?.focus() })
    function call(handler: unknown, event: Event) {
      if (Array.isArray(handler)) handler.forEach(value => call(value, event))
      else if (typeof handler === 'function') handler(event)
    }
    function decorate(child: VNode): VNode {
      // The accessibility props belong on the Tooltip's interactive child.
      if (child.type === Tooltip || isSlot(child, Tooltip)) {
        const children = child.children as { default?: () => VNode | VNode[] }
        return cloneVNode({ ...child, children: { ...children, default: () => {
          const content = children.default?.() ?? []
          return (Array.isArray(content) ? content : [content]).map(decorate)
        } } }, { id: props.id ?? menu.anchorId.value })
      }
      const original = child.props ?? {}
      const isItem = child.type === ActionList.Item || isSlot(child, ActionList.Item)
      const disabled = () => Boolean(original.disabled || original.loading || original.inactive || original.inactiveText) ||
        menu.anchor.value?.getAttribute('aria-disabled') === 'true'
      const injected: Record<string, unknown> = {
        ...attrs, id: props.id ?? menu.anchorId.value,
        ref: (value: unknown) => { instance.value = value },
        class: [props.className, attrs.class], 'aria-haspopup': 'true', 'aria-expanded': menu.open.value,
        tabindex: original.tabindex ?? 0
      }
      const click = (event: MouseEvent) => {
        const wasOpen = menu.open.value
        call(original.onClick, event); call(attrs.onClick, event)
        if (!disabled()) menu.onAnchorClick(event, wasOpen)
      }
      const keydown = (event: KeyboardEvent) => {
        call(original.onKeydown, event); call(attrs.onKeydown, event)
        if (!disabled()) menu.onAnchorKeydown(event)
      }
      // ActionList.Item owns click -> select -> afterSelect. Replacing its click
      // attribute would bypass that chain; handle its select event instead.
      if (isItem) injected.onSelect = (event: MouseEvent | KeyboardEvent) => {
        const wasOpen = menu.open.value
        call(original.onSelect, event); call(attrs.onSelect, event)
        if (event.defaultPrevented || disabled()) return
        if (event instanceof MouseEvent) menu.onAnchorClick(event, wasOpen)
        else menu.onOpen()
        event.preventDefault()
      }
      else injected.onClick = click
      injected.onKeydown = keydown
      const cloned = cloneVNode(child, injected, true)
      cloned.props = { ...cloned.props, onKeydown: keydown, ...(isItem ? { onSelect: injected.onSelect } : { onClick: click }) }
      return cloned
    }
    return () => {
      const children = (slots.default?.() ?? []).filter(child => child.type !== Comment)
      if (children.length !== 1 || !children[0] || children[0].type === Fragment || children[0].type === Text) {
        throw new Error('ActionMenu.Anchor requires one interactive child.')
      }
      return decorate(children[0])
    }
  }
})
</script>
