<script lang="ts">
import {
  Comment,
  defineComponent,
  type PropType,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  shallowRef,
  useId,
  watch,
} from 'vue'
import { treeViewItemKey, treeViewRootKey, defaultItemContext } from './context'
import { getAccessibleName } from './shared'
import { getFirstChildElement } from './navigation'
import type { TreeViewItemInstance, SubTreeState } from './types'
import LoadingItem from './TreeViewLoadingItem.vue'
import Item from './TreeViewItem.vue'
import { Text } from '../Text'

export default Object.assign(
  defineComponent({
    name: 'TreeViewSubTree',
    inheritAttrs: false,
    props: {
      state: { type: String as PropType<SubTreeState>, default: undefined },
      count: { type: Number, default: undefined },
    },
    setup(props, { attrs, slots }) {
      const item = inject(treeViewItemKey, defaultItemContext)
      const root = inject(treeViewRootKey, undefined)
      const element = shallowRef<HTMLUListElement | null>(null)
      const loadingItem = shallowRef<TreeViewItemInstance | null>(null)
      const label = shallowRef('')
      const emptyId = useId()
      let childrenPresent = false
      let loadingFocused = false
      let previousState = props.state
      const timers = new Set<ReturnType<typeof setTimeout>>()

      function update() {
        if (props.state === undefined || props.state === 'done')
          item.setIsSubTreeEmpty(!childrenPresent)
        const parent = document.getElementById(item.itemId.value)
        if (!parent) return
        label.value = getAccessibleName(parent)
        if (previousState === 'loading' && props.state === 'done') {
          root?.announceUpdate(
            element.value?.childElementCount
              ? `${label.value} content loaded`
              : `${label.value} is empty`,
          )
          if (loadingFocused) {
            const target = getFirstChildElement(parent) ?? parent
            const timer = setTimeout(() => {
              timers.delete(timer)
              target.focus()
            })
            timers.add(timer)
            loadingFocused = false
          }
        } else if (props.state === 'loading') root?.announceUpdate(`${label.value} content loading`)
        previousState = props.state
      }
      watch(
        () => loadingItem.value?.element,
        (node, _old, cleanup) => {
          if (!(node instanceof HTMLElement)) return
          const focus = () => {
            loadingFocused = true
          }
          const blur = (event: FocusEvent) => {
            if (event.relatedTarget) loadingFocused = false
          }
          node.addEventListener('focus', focus)
          node.addEventListener('blur', blur)
          cleanup(() => {
            node.removeEventListener('focus', focus)
            node.removeEventListener('blur', blur)
          })
        },
        { flush: 'post' },
      )
      onMounted(update)
      onUpdated(update)
      onBeforeUnmount(() => timers.forEach(clearTimeout))

      return () => {
        const children = slots.default?.()
        childrenPresent =
          !!children && (children.length === 0 || children.some((node) => node.type !== Comment))
        if (!item.isExpanded.value) return null
        return h(
          'ul',
          {
            ref: element,
            role: 'group',
            style: { listStyle: 'none', padding: 0, margin: 0 },
            'aria-label': attrs['aria-label'] || label.value,
          },
          [
            props.state === 'loading'
              ? h(LoadingItem, { ref: loadingItem, count: props.count })
              : children,
            item.isSubTreeEmpty.value && props.state !== 'loading'
              ? h(Item<'li'>, { id: emptyId, expanded: null }, () =>
                  h(Text, { class: 'fgColor-muted' }, () => 'No items found'),
                )
              : null,
          ],
        )
      }
    },
  }),
  { __SLOT__: Symbol('TreeView.SubTree') },
)
</script>
