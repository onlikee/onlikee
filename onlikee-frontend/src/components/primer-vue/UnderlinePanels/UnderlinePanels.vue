<script lang="ts">
import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  provide,
  shallowRef,
  useId,
  watch,
  type PropType,
  type VNode,
} from 'vue'
import Tab from './UnderlinePanelsTab.vue'
import Panel from './UnderlinePanelsPanel.vue'
import { underlinePanelsKey } from './context'
import { Tabs, useTabList } from '../Tabs'
import { elementChildren, isSlot } from '../composables/useSlots'
import { resolveFocusTarget } from '../internal/focusTarget'
import { normalizeReactStyle } from '../internal/style'
import type { UnderlinePanelsProps } from './types'
import classes from './UnderlinePanels.module.css'
import shared from './UnderlineTabbedInterface.module.css'

export default defineComponent({
  name: 'UnderlinePanels',
  inheritAttrs: false,
  props: {
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    activationMode: {
      type: String as PropType<UnderlinePanelsProps['activationMode']>,
      default: 'automatic',
    },
    id: { type: String, default: undefined },
    loadingCounters: { type: Boolean, default: undefined },
    className: { type: String, default: undefined },
    as: {
      type: [String, Object, Function] as PropType<UnderlinePanelsProps['as']>,
      default: 'div',
    },
  },
  emits: {
    change: (_selection: { value: string }) => true,
    'update:value': (_value: string) => true,
  },
  setup(props, { slots, attrs, emit }) {
    const generatedId = useId()
    const uncontrolledValue = shallowRef<string>()
    let initialized = false
    let previousSelectedFromProps: string | undefined
    const iconsVisible = shallowRef(true)
    let tabsHaveIcons = false
    let listWidth = 0
    const wrapperTarget = shallowRef<unknown>(null)
    const wrapperRef = computed(() => resolveFocusTarget(wrapperTarget.value))
    const listRef = shallowRef<HTMLUListElement | null>(null)
    const { tabListProps } = useTabList(() => ({
      'aria-label': attrs['aria-label'] as string,
      'aria-labelledby': attrs['aria-labelledby'] as string | undefined,
      ref: listRef,
    }))
    provide(underlinePanelsKey, {
      loadingCounters: computed(() => props.loadingCounters),
    })
    watch(
      [wrapperRef, listRef],
      ([wrapper, list], _previous, onCleanup) => {
        if (!wrapper || !list || typeof ResizeObserver === 'undefined') return
        const listObserver = new ResizeObserver((entries) => {
          if (tabsHaveIcons && iconsVisible.value) listWidth = entries[0]!.contentRect.width
        })
        const wrapperObserver = new ResizeObserver((entries) => {
          if (tabsHaveIcons) iconsVisible.value = entries[0]!.contentRect.width > listWidth
        })
        listObserver.observe(list)
        wrapperObserver.observe(wrapper)
        onCleanup(() => {
          listObserver.disconnect()
          wrapperObserver.disconnect()
        })
      },
      { flush: 'post' },
    )
    return () => {
      const tabs: VNode[] = []
      const panels: VNode[] = []
      let selectedFromProps: string | undefined
      let selectedCount = 0
      for (const child of elementChildren(slots.default?.())) {
        if (child.type === Tab || isSlot(child, Tab)) {
          const value: string = child.props?.value ?? String(tabs.length)
          const selected = child.props?.['aria-selected']
          if (selected === true || selected === 'true') {
            selectedFromProps = value
            selectedCount++
          }
          tabs.push(cloneVNode(child, { value }))
        } else if (child.type === Panel || isSlot(child, Panel)) {
          panels.push(cloneVNode(child, { value: child.props?.value ?? String(panels.length) }))
        }
      }
      const tabValues = tabs.map((tab) => tab.props!.value as string)
      const panelValues = panels.map((panel) => panel.props!.value as string)
      tabsHaveIcons = tabs.some((tab) => Boolean(tab.props?.icon))
      const controlled = props.value !== undefined
      if (!initialized) {
        uncontrolledValue.value = props.defaultValue ?? selectedFromProps ?? '0'
        initialized = true
        previousSelectedFromProps = selectedFromProps
      }
      if (!controlled && selectedFromProps !== previousSelectedFromProps) {
        previousSelectedFromProps = selectedFromProps
        if (selectedFromProps !== undefined) uncontrolledValue.value = selectedFromProps
      }
      const selected = controlled ? props.value! : uncontrolledValue.value!
      const effectiveValue = tabValues.includes(selected) ? selected : (tabValues[0] ?? selected)
      if (import.meta.env.DEV) {
        if (selectedCount > 1) throw new Error('Only one tab can be selected at a time.')
        if (tabs.length !== panels.length)
          throw new Error(
            `The number of tabs and panels must be equal. Counted ${tabs.length} tabs and ${panels.length} panels.`,
          )
        const duplicateTab = tabValues.find((value, index) => tabValues.indexOf(value) !== index)
        if (duplicateTab !== undefined)
          throw new Error(
            `Every tab must have a unique \`value\`. Found duplicate "${duplicateTab}".`,
          )
        const duplicatePanel = panelValues.find(
          (value, index) => panelValues.indexOf(value) !== index,
        )
        if (duplicatePanel !== undefined)
          throw new Error(
            `Every panel must have a unique \`value\`. Found duplicate "${duplicatePanel}".`,
          )
        const unmatched = tabValues.find((value) => !panelValues.includes(value))
        if (unmatched !== undefined)
          throw new Error(
            `Tab with \`value\` "${unmatched}" has no matching panel. Give a \`UnderlinePanels.Panel\` the same \`value\`.`,
          )
        if (controlled && selectedCount > 0)
          console.warn(
            'UnderlinePanels: do not combine the controlled `value` prop with `aria-selected` on a tab. `value` takes precedence; use `value`/`onChange` (or `defaultValue`) to drive selection.',
          )
        if (controlled && props.defaultValue !== undefined)
          console.warn(
            'UnderlinePanels: do not combine the controlled `value` prop with `defaultValue`. `value` takes precedence; use one or the other.',
          )
        const provided = props.value ?? props.defaultValue
        if (provided !== undefined && tabValues.length > 0 && !tabValues.includes(provided))
          console.warn(
            `UnderlinePanels: the selected value "${provided}" does not match any tab, so the first tab is selected instead. Provide a \`value\`/\`defaultValue\` that matches a \`UnderlinePanels.Tab\` \`value\`.`,
          )
      }
      const {
        'aria-label': _label,
        'aria-labelledby': _labelledBy,
        class: classValue,
        style,
        ...rest
      } = attrs
      const wrapperProps = {
        ...rest,
        id: props.id,
        ref: wrapperTarget,
        'data-icons-visible': iconsVisible.value,
        class: [
          shared.UnderlineWrapper,
          classes.StyledUnderlineWrapper,
          props.className,
          classValue,
        ],
        style: normalizeReactStyle(style),
      }
      return h(
        Tabs,
        {
          id: props.id ?? generatedId,
          value: effectiveValue,
          activationMode: props.activationMode,
          onValueChange({ value }) {
            if (!controlled) uncontrolledValue.value = value
            emit('update:value', value)
            emit('change', { value })
          },
        },
        {
          default: () => [
            h(
              props.as,
              wrapperProps,
              typeof props.as === 'string'
                ? [h('ul', { ...tabListProps.value, class: shared.UnderlineItemList }, tabs)]
                : {
                    default: () =>
                      h('ul', { ...tabListProps.value, class: shared.UnderlineItemList }, tabs),
                  },
            ),
            ...panels,
          ],
        },
      )
    }
  },
})
</script>
