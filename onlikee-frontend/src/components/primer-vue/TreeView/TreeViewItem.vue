<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'li'">
import {
  computed,
  h,
  inject,
  onBeforeUnmount,
  provide,
  shallowRef,
  toRef,
  useAttrs,
  useId,
  useSlots,
  watch,
  type Component,
  type ComponentPublicInstance,
  type NativeElements,
  type PropType,
  type VNode,
} from 'vue'
import { ChevronDownIcon, ChevronRightIcon } from '@onlikee/octicons-vue'
import { useSlots as extractSlots, isSlot } from '../composables/useSlots'
import { normalizeReactStyle } from '../internal/style'
import { usePlatformRef, getAccessibleKeybindingHintString } from '../KeybindingHint'
import {
  treeViewRootKey,
  treeViewItemKey,
  defaultItemContext,
  loadingPlaceholderKey,
} from './context'
import { getNextFocusableElement } from './navigation'
import LeadingAction from './TreeViewLeadingAction.vue'
import LeadingVisual from './TreeViewLeadingVisual.vue'
import TrailingVisual from './TreeViewTrailingVisual.vue'
import SubTree from './TreeViewSubTree.vue'
import TrailingAction from './TreeViewTrailingAction.vue'
import ActionDialog from './TreeViewActionDialog.vue'
import type { TreeViewSecondaryActions } from './types'
import classes from './TreeView.module.css'

defineOptions({ name: 'TreeViewItem', inheritAttrs: false })
const props = defineProps({
  id: { type: String, required: true },
  as: { type: [String, Object, Function] as PropType<As>, default: undefined },
  containIntrinsicSize: { type: String, default: undefined },
  current: { type: Boolean, default: false },
  defaultExpanded: { type: Boolean, default: undefined },
  expanded: { type: Boolean as PropType<boolean | null>, default: undefined },
  onExpandedChange: { type: Function as PropType<(expanded: boolean) => void>, default: undefined },
  onSelect: {
    type: Function as PropType<(event: MouseEvent | KeyboardEvent) => void>,
    default: undefined,
  },
  className: { type: String, default: undefined },
  secondaryActions: { type: Array as PropType<TreeViewSecondaryActions[]>, default: undefined },
})
defineSlots<{ default?: () => unknown }>()
const slots = useSlots()
const attrs = useAttrs()
const root = inject(treeViewRootKey, undefined)
const parent = inject(treeViewItemKey, defaultItemContext)
const loading = inject(loadingPlaceholderKey, false)
const labelId = useId()
const leadingVisualId = useId()
const trailingVisualId = useId()
const trailingActionId = useId()
const target = shallowRef<Element | ComponentPublicInstance | null>(null)
const element = computed(() =>
  target.value && 'element' in target.value
    ? (target.value.element as Element | null)
    : target.value,
)
const focused = shallowRef(false)
const showActions = shallowRef(false)
const controlled = props.expanded !== undefined
const internalExpanded = shallowRef(
  root?.expandedStateCache.get(props.id) ?? props.defaultExpanded ?? props.current,
)
const isExpanded = computed(() => (controlled ? (props.expanded ?? false) : internalExpanded.value))
const emptyOverride = shallowRef<boolean>()
let initialEmpty: boolean | undefined
const isSubTreeEmpty = computed(() => emptyOverride.value ?? initialEmpty ?? false)
const level = parent.level
const platform = usePlatformRef()
const shortcutText = computed(
  () =>
    `Press (${getAccessibleKeybindingHintString(`Shift+${platform.value === 'apple' ? 'Meta' : 'Control'}+U`, platform.value)}) for more actions.`,
)

function setExpanded(value: boolean) {
  if (!controlled) internalExpanded.value = value
  props.onExpandedChange?.(value)
  root?.expandedStateCache.set(props.id, value)
}
function toggle(event?: Event) {
  setExpanded(!isExpanded.value)
  event?.stopPropagation()
}
provide(treeViewItemKey, {
  itemId: toRef(props, 'id'),
  level: level + 1,
  isSubTreeEmpty,
  setIsSubTreeEmpty: (value) => {
    emptyOverride.value = value
  },
  isExpanded,
  setIsExpanded: setExpanded,
  leadingVisualId,
  trailingVisualId,
  trailingActionId,
})
if (import.meta.env.DEV)
  watch(
    () => props.expanded !== undefined,
    (next) => {
      if (next !== controlled)
        console.warn(
          `A component is changing ${props.id} from ${controlled ? 'controlled to uncontrolled' : 'uncontrolled to controlled'}. Decide between using a controlled or uncontrolled value for the lifetime of the component.`,
        )
    },
  )

function handleKeyDown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Enter':
    case ' ':
      if (props.onSelect) props.onSelect(event)
      else toggle(event)
      event.stopPropagation()
      break
    case 'ArrowRight':
    case 'ArrowLeft': {
      if (event.altKey || event.metaKey) return
      // Vue handles item events before the root's native focus-zone listener.
      // Resolve horizontal navigation before toggling, as React's delegated events do.
      const next = getNextFocusableElement(event.currentTarget as HTMLElement, event)
      next?.focus({ preventScroll: true })
      event.preventDefault()
      event.stopPropagation()
      setExpanded(event.key === 'ArrowRight')
      break
    }
    case 'U':
    case 'u':
      if (!(event.shiftKey && (event.metaKey || event.ctrlKey)) || !props.secondaryActions) return
      if (props.secondaryActions.length > 1) showActions.value = true
      else props.secondaryActions[0]!.onClick()
      break
  }
}
function handleClick(event: MouseEvent) {
  if (props.onSelect) props.onSelect(event)
  else toggle(event)
  event.stopPropagation()
}
function setElement(node: Element | ComponentPublicInstance | null) {
  target.value = node
}
onBeforeUnmount(() => {
  target.value = null
})
defineExpose({ element })

const Render = () => {
  const [matched, rest] = extractSlots(slots.default?.(), {
    leadingAction: LeadingAction,
    leadingVisual: LeadingVisual,
    trailingVisual: TrailingVisual,
  })
  const isSubTree = (child: unknown): child is VNode =>
    !!child &&
    typeof child === 'object' &&
    'type' in child &&
    (child.type === SubTree || isSlot(child, SubTree))
  const subTree = rest.find(isSubTree)
  const content = rest.filter((child) => !isSubTree(child))
  initialEmpty ??= !subTree
  const empty = emptyOverride.value ?? initialEmpty
  const describedBy = [
    matched.leadingVisual ? leadingVisualId : null,
    matched.trailingVisual ? trailingVisualId : null,
  ]
    .filter(Boolean)
    .join(' ')
  const ariaLabel = attrs['aria-label'] as string | undefined
  const ariaLabelledby = attrs['aria-labelledby'] as string | undefined
  const as = props.as ?? 'li'
  const item = h(
    as,
    {
      ...attrs,
      key: 'treeitem',
      style: typeof as === 'string' ? normalizeReactStyle(attrs.style) : attrs.style,
      class: [
        'PRIVATE_TreeView-item',
        props.className,
        attrs.class,
        classes.prcTreeViewTreeViewItem,
      ],
      ref: setElement,
      tabindex: 0,
      id: props.id,
      role: 'treeitem',
      'aria-label':
        props.secondaryActions && ariaLabel ? `${ariaLabel}. ${shortcutText.value}` : ariaLabel,
      'aria-labelledby': ariaLabel
        ? undefined
        : `${ariaLabelledby || labelId} ${props.secondaryActions ? trailingActionId : ''}`.trim(),
      'aria-describedby': describedBy || undefined,
      'aria-level': level,
      'aria-expanded':
        (empty && (!isExpanded.value || !subTree)) || props.expanded === null
          ? undefined
          : isExpanded.value,
      'aria-current': props.current ? 'true' : undefined,
      'aria-selected': focused.value ? 'true' : 'false',
      'data-has-leading-action': matched.leadingAction ? true : undefined,
      'data-loading': loading ? true : undefined,
      onKeydown: handleKeyDown,
      onFocus: (event: FocusEvent) => {
        root?.scrollElementIntoView((event.currentTarget as HTMLElement).firstElementChild)
        focused.value = true
        event.stopPropagation()
      },
      onBlur: () => {
        focused.value = false
      },
      onClick: handleClick,
      onAuxclick: (event: MouseEvent) => {
        if (props.onSelect && event.button === 1) props.onSelect(event)
        event.stopPropagation()
      },
    },
    typeof as === 'string' ? renderContent() : { default: renderContent },
  )
  function renderContent() {
    return [
      h(
        'div',
        {
          class: ['PRIVATE_TreeView-item-container', classes.prcTreeViewTreeViewItemContainer],
          style: {
            '--level': level,
            contentVisibility: props.containIntrinsicSize ? 'auto' : undefined,
            containIntrinsicSize: props.containIntrinsicSize,
          },
        },
        [
          h(
            'div',
            { style: { gridArea: 'spacer', display: 'flex' } },
            h(
              'div',
              { style: { width: '100%', display: 'flex' } },
              Array.from({ length: level - 1 }, (_, i) =>
                h('div', {
                  key: i,
                  class: [
                    'PRIVATE_TreeView-item-level-line',
                    classes.prcTreeViewTreeViewItemLevelLine,
                  ],
                }),
              ),
            ),
          ),
          matched.leadingAction,
          subTree
            ? h(
                'div',
                {
                  class: [
                    'PRIVATE_TreeView-item-toggle',
                    props.onSelect && 'PRIVATE_TreeView-item-toggle--hover',
                    level === 1 && 'PRIVATE_TreeView-item-toggle--end',
                    classes.prcTreeViewTreeViewItemToggle,
                    classes.prcTreeViewTreeViewItemToggleHover,
                    classes.prcTreeViewTreeViewItemToggleEnd,
                  ],
                  onClick: (event: MouseEvent) => {
                    if (props.onSelect) toggle(event)
                  },
                },
                h(isExpanded.value ? ChevronDownIcon : ChevronRightIcon, { size: 12 }),
              )
            : null,
          h(
            'div',
            {
              id: labelId,
              class: ['PRIVATE_TreeView-item-content', classes.prcTreeViewTreeViewItemContent],
            },
            [
              matched.leadingVisual,
              h(
                'span',
                {
                  class: [
                    'PRIVATE_TreeView-item-content-text',
                    classes.prcTreeViewTreeViewItemContentText,
                  ],
                },
                content,
              ),
              matched.trailingVisual,
            ],
          ),
          props.secondaryActions
            ? [
                h(TrailingAction, {
                  items: props.secondaryActions,
                  shortcutText: shortcutText.value,
                }),
                showActions.value
                  ? h(ActionDialog, {
                      items: props.secondaryActions,
                      onClose: () => {
                        showActions.value = false
                      },
                    })
                  : null,
              ]
            : null,
        ],
      ),
      subTree,
    ]
  }
  return props.as !== undefined && props.as !== 'li'
    ? h('li', { key: 'wrapper', role: 'none' }, item)
    : item
}
</script>

<template><Render /></template>
