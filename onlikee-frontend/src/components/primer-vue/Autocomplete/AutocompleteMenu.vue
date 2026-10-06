<script lang="ts">
import { computed, defineComponent, getCurrentInstance, h, isRef, onBeforeUnmount, onMounted, ref, shallowRef, watch, type PropType, type Ref } from 'vue'
import { FocusKeys, scrollIntoView } from '@primer/behaviors'
import { isEditableElement, isMacOS } from '@primer/behaviors/utils'
import Spinner from '../Spinner/Spinner.vue'
import { renderNode, type NodeProp } from '../internal/renderNode'
import { normalizeReactStyle } from '../internal/style'
import { useAutocompleteContext } from './context'
import type { AutocompleteMenuItem } from './types'
import PlusIcon from '../../octicons-vue3/icons/plus.vue'
import CheckIcon from '../../octicons-vue3/icons/check.vue'

type AddNewItem = AutocompleteMenuItem & { handleAddItem: (item: Omit<AutocompleteMenuItem, 'onAction' | 'leadingVisual'>) => void }
type MenuEntry = AutocompleteMenuItem & {
  role: 'option'
  active: boolean
  selected: boolean | undefined
  onAction: (item: MenuEntry) => void
}

const getDefaultSortFn = (isItemSelectedFn: (itemId: string) => boolean) => (itemIdA: string, itemIdB: string) =>
  isItemSelectedFn(itemIdA) === isItemSelectedFn(itemIdB) ? 0 : isItemSelectedFn(itemIdA) ? -1 : 1
const menuScrollMargins = { startMargin: 0, endMargin: 8 }
function getDefaultItemFilter(filterValue: string) {
  return function (item: AutocompleteMenuItem, _i: number) {
    return Boolean(item.text?.toLowerCase().startsWith(filterValue.toLowerCase()))
  }
}
const isItemSelected = (itemId: string, selectedItemIds: string[]) => selectedItemIds.includes(itemId)
function getItemById(itemId: string, items: AutocompleteMenuItem[]) {
  return items.find(item => item.id === itemId)
}
// 属性选择器转义：可用时用 CSS.escape；jsdom/SSR 缺少 CSS 全局时退回引号/反斜杠转义（id 仅出现在 [data-id="..."] 中）
const escapeCss = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
  ? (value: string) => CSS.escape(value)
  : (value: string) => value.replace(/["\\]/g, '\\$&')

let announcementTimeout: ReturnType<typeof setTimeout> | 0 = 0
function debounceAnnouncement(announcement: unknown) {
  if (announcementTimeout) clearTimeout(announcementTimeout)
  announcementTimeout = setTimeout(() => {
    announcementTimeout = 0
    if (typeof window === 'undefined') return
    void import('@primer/live-region-element')
      .then(({ announce }) => announce(announcement as string))
      .catch(() => {})
  }, 250)
}

const KEY_TO_BIT: Record<string, number> = {
  ArrowLeft: FocusKeys.ArrowHorizontal,
  ArrowDown: FocusKeys.ArrowVertical,
  ArrowUp: FocusKeys.ArrowVertical,
  ArrowRight: FocusKeys.ArrowHorizontal,
  h: FocusKeys.HL,
  j: FocusKeys.JK,
  k: FocusKeys.JK,
  l: FocusKeys.HL,
  a: FocusKeys.AD,
  s: FocusKeys.WS,
  w: FocusKeys.WS,
  d: FocusKeys.AD,
  Tab: FocusKeys.Tab,
  Home: FocusKeys.HomeAndEnd,
  End: FocusKeys.HomeAndEnd,
  PageUp: FocusKeys.PageUpDown,
  PageDown: FocusKeys.PageUpDown,
  Backspace: FocusKeys.Backspace
}
const KEY_TO_DIRECTION: Record<string, 'previous' | 'next' | 'start' | 'end'> = {
  ArrowLeft: 'previous',
  ArrowDown: 'next',
  ArrowUp: 'previous',
  ArrowRight: 'next',
  h: 'previous',
  j: 'next',
  k: 'previous',
  l: 'next',
  a: 'previous',
  s: 'next',
  w: 'previous',
  d: 'next',
  Tab: 'next',
  Home: 'start',
  End: 'end',
  PageUp: 'start',
  PageDown: 'end',
  Backspace: 'previous'
}
const BIND_KEYS = FocusKeys.ArrowVertical | FocusKeys.HomeAndEnd
const isActiveDescendantAttribute = 'data-is-active-descendant'
const activeDescendantActivatedDirectly = 'activated-directly'
const activeDescendantActivatedIndirectly = 'activated-indirectly'
const hasActiveDescendantAttribute = 'data-has-active-descendant'

function getDirection(keyboardEvent: KeyboardEvent) {
  // focus-zone.mjs:66-81 —— Ctrl/Cmd+ArrowUp/Left → start, Ctrl/Cmd+ArrowDown/Right → end
  const direction = KEY_TO_DIRECTION[keyboardEvent.key]
  if (keyboardEvent.key === 'Tab' && keyboardEvent.shiftKey) return 'previous'
  const isMac = isMacOS()
  if ((isMac && keyboardEvent.metaKey) || (!isMac && keyboardEvent.ctrlKey)) {
    if (keyboardEvent.key === 'ArrowLeft' || keyboardEvent.key === 'ArrowUp') return 'start'
    else if (keyboardEvent.key === 'ArrowRight' || keyboardEvent.key === 'ArrowDown') return 'end'
  }
  return direction
}

function shouldIgnoreFocusHandling(keyboardEvent: KeyboardEvent, activeElement: Element | null) {
  const key = keyboardEvent.key
  const isSingleChar = key.length === 1 || (key.length === 2 && key.charCodeAt(0) >= 0xd800 && key.charCodeAt(0) <= 0xdbff)
  const isEditable = isEditableElement(activeElement)
  const isSelect = activeElement instanceof HTMLSelectElement
  if (isEditable && (isSingleChar || key === 'Home' || key === 'End')) return true
  if (isSelect) {
    const isMac = isMacOS()
    if (key === 'ArrowDown' && isMac && !keyboardEvent.metaKey) return true
    if (key === 'ArrowDown' && !isMac && keyboardEvent.altKey) return true
    return false
  }
  if (isEditable && !isSelect) {
    const isInputElement = activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement
    const cursorAtStart = isInputElement && activeElement.selectionStart === 0 && activeElement.selectionEnd === 0
    const cursorAtEnd = isInputElement &&
      activeElement.selectionStart === activeElement.value.length &&
      activeElement.selectionEnd === activeElement.value.length
    if (key === 'ArrowLeft' && !cursorAtStart) return true
    if (key === 'ArrowRight' && !cursorAtEnd) return true
    const isContentEditable = activeElement instanceof HTMLElement && activeElement.isContentEditable
    if (activeElement instanceof HTMLTextAreaElement || isContentEditable) {
      if (key === 'PageUp' || key === 'PageDown') return true
      if (key === 'ArrowUp' && !cursorAtStart) return true
      if (key === 'ArrowDown' && !cursorAtEnd) return true
    }
  }
  return false
}

export default defineComponent({
  name: 'AutocompleteMenu', __SLOT__: Symbol('Autocomplete.Menu'), inheritAttrs: false,
  props: {
    items: { type: Array as PropType<AutocompleteMenuItem[]>, required: true },
    selectedItemIds: { type: Array as PropType<string[]>, required: true },
    selectionVariant: { type: String as PropType<'single' | 'multiple'>, default: 'single' },
    loading: Boolean,
    emptyStateText: { type: null as unknown as PropType<NodeProp | false | null>, default: 'No selectable options' },
    filterFn: { type: Function as PropType<(item: AutocompleteMenuItem, index: number) => boolean>, default: undefined },
    sortOnCloseFn: { type: Function as PropType<(a: string, b: string) => number>, default: undefined },
    addNewItem: { type: Object as PropType<AddNewItem>, default: undefined },
    customScrollContainerRef: { type: Object as PropType<Ref<HTMLElement | null> | HTMLElement>, default: undefined }
  },
  emits: {
    'update:selectedItemIds': (_ids: string[]) => true,
    'selected-change': (_items: AutocompleteMenuItem | AutocompleteMenuItem[]) => true,
    'open-change': (_open: boolean) => true
  },
  setup(props, { attrs, emit, slots }) {
    const context = useAutocompleteContext()
    const instance = getCurrentInstance()!
    const listContainerRef = ref<HTMLElement | null>(null)
    const highlightedItem = shallowRef<AutocompleteMenuItem>()
    const sortedItemIds = ref<string[]>(props.items.map(({ id: itemId }) => itemId)) // :171
    const generatedUniqueId = computed(() => context.id.value) // :172 useId(id) —— context id is already props.id ?? generated

    // focusZone internal state (focus-zone.mjs:133-143): focusableElements set is replaced by allItems,
    // currentFocusedElement is tracked by li[data-id]
    let zoneCurrentId: string | undefined
    let zoneActive = false

    const assertSelection = () => {
      if (props.selectionVariant === 'single' && props.selectedItemIds.length > 1) {
        throw new Error('Autocomplete: selectionVariant "single" cannot be used with multiple selected items')
      }
    }
    assertSelection()
    watch([() => props.selectionVariant, () => props.selectedItemIds], assertSelection)

    function findItemElement(id: string | undefined | null): HTMLElement | null {
      if (id === undefined || id === null) return null
      return listContainerRef.value?.querySelector<HTMLElement>(`li[data-id="${escapeCss(id)}"]`) ?? null
    }

    function onActiveDescendantChanged(current: HTMLElement | undefined, _previous: HTMLElement | undefined, directlyActivated: boolean) {
      context.activeDescendantRef.value = current ?? null
      if (current) {
        const selectedItem = allItems.value.find(item => item.id === current.closest('li')?.getAttribute('data-id'))
        highlightedItem.value = selectedItem
        context.setIsMenuDirectlyActivated(directlyActivated)
      }
      // Source reads customScrollContainerRef.current —— only resolves for ref objects; raw elements fall through to the scrollContainerRef branch (source quirk)
      const custom = isRef(props.customScrollContainerRef) ? props.customScrollContainerRef.value : undefined
      if (current && custom && directlyActivated) scrollIntoView(current, custom, menuScrollMargins)
      else if (current && context.scrollContainerRef.value && directlyActivated) scrollIntoView(current, context.scrollContainerRef.value, menuScrollMargins)
    }

    function setActiveDescendant(from: HTMLElement | null | undefined, to: HTMLElement, directlyActivated = false) {
      if (from && from !== to) from.removeAttribute(isActiveDescendantAttribute)
      const control = context.inputRef.value
      if (!control || (!directlyActivated && control.getAttribute('aria-activedescendant') === to.id)) return
      control.setAttribute('aria-activedescendant', to.id)
      listContainerRef.value?.setAttribute(hasActiveDescendantAttribute, to.id)
      to.setAttribute(isActiveDescendantAttribute, directlyActivated ? activeDescendantActivatedDirectly : activeDescendantActivatedIndirectly)
      onActiveDescendantChanged(to, from ?? undefined, directlyActivated)
    }

    function clearActiveDescendant(previouslyActiveElement?: HTMLElement | null) {
      // focus-zone.mjs:186-198 —— focusInStrategy='previous': preserves currentFocusedElement (zoneCurrentId)
      context.inputRef.value?.removeAttribute('aria-activedescendant')
      listContainerRef.value?.removeAttribute(hasActiveDescendantAttribute)
      previouslyActiveElement?.removeAttribute(isActiveDescendantAttribute)
      for (const element of Array.from(listContainerRef.value?.querySelectorAll(`[${isActiveDescendantAttribute}]`) ?? [])) {
        element.removeAttribute(isActiveDescendantAttribute)
      }
      onActiveDescendantChanged(undefined, previouslyActiveElement ?? undefined, false)
    }

    function updateFocusedElement(to: HTMLElement | null | undefined, directlyActivated = false) {
      // focus-zone.mjs:152-169 (activeDescendantControl branch)
      const from = findItemElement(zoneCurrentId)
      zoneCurrentId = to?.getAttribute('data-id') ?? undefined
      if (to && document.activeElement === context.inputRef.value) setActiveDescendant(from, to, directlyActivated)
      // Source: clearActiveDescendant() default argument = just-assigned currentFocusedElement (i.e. to)
      else clearActiveDescendant(to)
    }

    function zoneCreate() {
      // focus-zone.mjs:279-282 + 199-221 —— beginFocusManagement then updateFocusedElement(getFirst());
      // source calls twice (second hits setActiveDescendant early-return, focus-zone.mjs:177-180), net effect is equivalent to a single call
      zoneCurrentId = undefined
      updateFocusedElement(findItemElement(allItems.value[0]?.id), false)
    }

    function zoneAbort() {
      const items = allItems.value
      const index = items.findIndex(item => item.id === zoneCurrentId)
      if (zoneCurrentId !== undefined && index >= 0 && document.activeElement === context.inputRef.value) {
        for (let i = index + 1; i < items.length; i++) {
          highlightedItem.value = items[i]
          context.setIsMenuDirectlyActivated(false)
          context.activeDescendantRef.value = findItemElement(items[i].id)
        }
      }
      zoneCurrentId = undefined
      clearActiveDescendant(null)
    }

    const syncZone = () => {
      const shouldBeActive = Boolean(context.showMenu.value) && !props.loading &&
        listContainerRef.value instanceof HTMLElement && context.inputRef.value instanceof HTMLElement
      if (shouldBeActive && !zoneActive) {
        zoneActive = true
        zoneCreate()
      } else if (!shouldBeActive && zoneActive) {
        zoneActive = false
        zoneAbort()
      }
    }
    watch([context.showMenu, () => props.loading], syncZone, { flush: 'post' })
    onMounted(syncZone)

    watch([highlightedItem, context.deferredInputValue, () => props.selectedItemIds], () => {
      const item = highlightedItem.value
      if (item && item.text !== undefined && item.text.startsWith(context.deferredInputValue.value) && !props.selectedItemIds.includes(item.id)) {
        context.setAutocompleteSuggestion(item.text)
      } else {
        context.setAutocompleteSuggestion('')
      }
    }, { immediate: true })

    const itemSortOrderData = computed(() => sortedItemIds.value.reduce<Record<string, number>>((acc, curr, i) => {
      acc[curr] = i
      return acc
    }, {}))

    function defaultOnAction(item: MenuEntry) {
      const otherSelectedItemIds = props.selectedItemIds.filter(selectedItemId => selectedItemId !== item.id)
      const newSelectedItemIds = props.selectedItemIds.includes(item.id) ? otherSelectedItemIds : [...otherSelectedItemIds, item.id]
      const selectedItems = newSelectedItemIds.map(newSelectedItemId => getItemById(newSelectedItemId, props.items)) as AutocompleteMenuItem[]
      if (instance.vnode.props?.onSelectedChange) emit('selected-change', selectedItems)
      else {
        const { text = '' } = selectedItems.slice(-1)[0] as AutocompleteMenuItem
        context.setInputValue(text)
      }
      emit('update:selectedItemIds', newSelectedItemIds) // Vue v-model glue (registered as port supplement)
      if (props.selectionVariant === 'multiple') {
        context.setInputValue('')
        context.setAutocompleteSuggestion('')
      } else {
        context.setShowMenu(false)
        const input = context.inputRef.value
        input?.setSelectionRange(input.value.length, input.value.length)
      }
      // Source does not call input.focus() (registered deviation: old implementation had extra focus, now removed)
    }

    const selectableItems = computed<MenuEntry[]>(() => props.items.map(selectableItem => ({
      ...selectableItem,
      role: 'option',
      id: selectableItem.id,
      active: highlightedItem.value?.id === selectableItem.id,
      selected: props.selectionVariant === 'multiple' ? props.selectedItemIds.includes(selectableItem.id) : undefined,
      onAction: defaultOnAction
    })))

    const sortedAndFilteredItemsToRender = computed(() => {
      const itemFilter = props.filterFn ?? getDefaultItemFilter(context.deferredInputValue.value)
      return selectableItems.value
        .filter(itemFilter)
        .sort((a, b) => itemSortOrderData.value[a.id] - itemSortOrderData.value[b.id])
    })

    const allItems = computed<MenuEntry[]>(() => [
      ...sortedAndFilteredItemsToRender.value,
      ...(props.addNewItem ? [{
        ...props.addNewItem,
        role: 'option' as const,
        key: props.addNewItem.id,
        active: highlightedItem.value?.id === props.addNewItem.id,
        selected: props.selectionVariant === 'multiple' ? props.selectedItemIds.includes(props.addNewItem.id) : undefined,
        leadingVisual: () => h(PlusIcon), // Source: () => <PlusIcon />
        onAction: (item: MenuEntry) => {
          const addNewItem = props.addNewItem!
          // Source spreads the entire entry (onAction/key/active/selected are carried into the payload at runtime)
          addNewItem.handleAddItem({ ...item, id: item.id || generatedUniqueId.value, leadingVisual: undefined } as Omit<AutocompleteMenuItem, 'onAction' | 'leadingVisual'>)
          if (props.selectionVariant === 'multiple') {
            context.setInputValue('')
            context.setAutocompleteSuggestion('')
          }
          // single: menu stays open, input unchanged (source quirk)
        }
      }] : [])
    ])

    // focus-zone.mjs:283-351 MutationObserver equivalent: re-highlight after current item is removed by filtering (take first surviving item),
    // when new items appear and there is no current highlight, activate the first item
    watch(allItems, (items, previous) => {
      if (!zoneActive) return
      const previousItems = previous ?? []
      const removed = previousItems.filter(old => !items.some(item => item.id === old.id))
      if (removed.length > 0 && removed.some(old => old.id === zoneCurrentId)) {
        updateFocusedElement(findItemElement(items[0]?.id), false) // endFocusManagement: current removed → getFirst
      }
      const added = items.filter(item => !previousItems.some(old => old.id === item.id))
      if (added.length > 0 && zoneCurrentId === undefined) {
        updateFocusedElement(findItemElement(items[0]?.id), false) // beginFocusManagement: only acts when no current
      }
    }, { flush: 'post' })

    const sortEffect = () => {
      const itemIdSortResult = [...sortedItemIds.value].sort(
        props.sortOnCloseFn ? props.sortOnCloseFn : getDefaultSortFn(itemId => isItemSelected(itemId, props.selectedItemIds))
      )
      const sortResultMatchesState =
        itemIdSortResult.length === sortedItemIds.value.length &&
        itemIdSortResult.every((element, index) => element === sortedItemIds.value[index])
      if (context.showMenu.value === false && !sortResultMatchesState) sortedItemIds.value = itemIdSortResult
      emit('open-change', Boolean(context.showMenu.value))
    }
    watch([context.showMenu, () => props.selectedItemIds, () => props.sortOnCloseFn, sortedItemIds], sortEffect, { flush: 'post' })
    onMounted(sortEffect)

    const syncSelectedItemLength = () => {
      if (props.selectedItemIds.length) context.setSelectedItemLength(props.selectedItemIds.length)
    }
    watch(() => props.selectedItemIds, syncSelectedItemLength, { flush: 'post' })
    onMounted(syncSelectedItemLength)

    watch([allItems, () => props.emptyStateText], ([items]) => {
      if (items.length === 0) debounceAnnouncement(props.emptyStateText)
    }, { immediate: true })

    context.navigate = event => {
      // focus-zone.mjs:464-523 —— keydown listener on input (keyboardEventRecipient = activeDescendantControl).
      // Returning true means source has already preventDefault'd (non-Tab keys, focus-zone.mjs:518-520).
      if (!zoneActive) return false // zone already destroyed when menu closed/loading (useFocusZone deps)
      if (!(event.key in KEY_TO_DIRECTION)) return false
      const keyBit = KEY_TO_BIT[event.key]
      if (event.defaultPrevented || !((keyBit & BIND_KEYS) > 0) || shouldIgnoreFocusHandling(event, document.activeElement)) return false
      const direction = getDirection(event)
      const items = allItems.value
      const size = items.length
      // getCurrentFocusedIndex (focus-zone.mjs:456-463): no current → 0 (preventInitialFocus=false)
      let lastFocusedIndex = zoneCurrentId === undefined ? 0 : items.findIndex(item => item.id === zoneCurrentId)
      if (lastFocusedIndex === -1) lastFocusedIndex = 0
      let nextFocusedIndex = lastFocusedIndex
      if (direction === 'previous') nextFocusedIndex -= 1
      else if (direction === 'start') nextFocusedIndex = 0
      else if (direction === 'next') nextFocusedIndex += 1
      else nextFocusedIndex = size - 1 // 'end' (focus-zone.mjs:488-490)
      if (nextFocusedIndex < 0) nextFocusedIndex = size - 1 // focusOutBehavior: 'wrap' (non-Tab keys)
      if (nextFocusedIndex >= size) nextFocusedIndex = 0
      // focus-zone.mjs:507-512 —— updateFocusedElement(nextElementToFocus || currentFocusedElement, true)
      if (lastFocusedIndex !== nextFocusedIndex) updateFocusedElement(findItemElement(items[nextFocusedIndex]?.id), true)
      else updateFocusedElement(findItemElement(zoneCurrentId), true)
      return true
    }

    context.notifyControlFocus = () => {
      // focus-zone.mjs:387-395 —— input focusin: no current → highlight first item; has current → re-set activedescendant
      if (!zoneActive) return
      if (zoneCurrentId === undefined) updateFocusedElement(findItemElement(allItems.value[0]?.id), false)
      else {
        const current = findItemElement(zoneCurrentId)
        if (current) setActiveDescendant(null, current, false)
      }
    }

    context.notifyControlBlur = () => {
      // focus-zone.mjs:396-398 —— input focusout → clearActiveDescendant (zoneCurrentId preserved, 'previous' strategy)
      if (!zoneActive) return
      clearActiveDescendant(findItemElement(zoneCurrentId))
    }

    function select(item: MenuEntry, event?: Event, ignorePriorPrevention = false) {
      if (item.disabled || item.inactiveText || item.loading || context.composing.value) return
      const onSelectUser = item.onSelect as ((selectEvent: Event) => void) | undefined
      if (typeof onSelectUser === 'function' && event) onSelectUser(event)
      if (event?.defaultPrevented && !ignorePriorPrevention) return
      item.onAction(item)
    }

    onBeforeUnmount(() => {
      context.navigate = () => false
      context.notifyControlFocus = () => {}
      context.notifyControlBlur = () => {}
      context.activeDescendantRef.value = null
      context.inputRef.value?.removeAttribute('aria-activedescendant')
    })

    function renderItem(item: MenuEntry) {
      const {
        id, onAction: _onAction, children, text, leadingVisual, trailingVisual, key, role: _role,
        variant = 'default', size = 'medium', disabled, inactiveText, selected, active, loading, className,
        onSelect: _onSelect, groupId: _groupId, renderItem: _renderItem, handleAddItem: _handleAddItem,
        metadata: _metadata,
        ...restProps
      } = item
      const itemId = id
      const labelId = `${itemId}--label`
      const trailingVisualId = `${itemId}--trailing-visual`
      const inactive = Boolean(inactiveText)
      const showInactiveIndicator = false
      const inactiveWarningId = inactive && !showInactiveIndicator ? `${itemId}--warning-message` : undefined
      const ariaLabelledBy = [labelId, trailingVisual ? trailingVisualId : undefined].filter(Boolean).join(' ')
      const ariaDescribedBy = inactiveWarningId
      const passthrough: Record<string, unknown> = {}
      for (const [name, value] of Object.entries(restProps)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') passthrough[name] = value
      }
      const hasLeadingVisual = Boolean(leadingVisual)
      function visualOrIndicator(position: 'leading' | 'trailing') {
        const slotVisual = position === 'leading'
          ? (leadingVisual
              ? h('span', { class: 'autocomplete-menu__leading-visual autocomplete-menu__visual-wrap', 'data-component': 'ActionList.LeadingVisual' }, [renderNode(leadingVisual)])
              : null)
          : (trailingVisual
              ? h('span', { id: trailingVisualId, class: 'autocomplete-menu__trailing-visual autocomplete-menu__visual-wrap', 'data-component': 'ActionList.TrailingVisual' }, [renderNode(trailingVisual)])
              : null)
        if (!loading) return slotVisual
        if ((hasLeadingVisual && position === 'trailing') || (!hasLeadingVisual && position === 'leading')) return slotVisual
        return position === 'leading'
          ? h('span', { class: 'autocomplete-menu__leading-visual autocomplete-menu__visual-wrap', 'data-component': 'ActionList.LeadingVisual' }, [h(Spinner, { size: 'small' })])
          : h('span', { id: trailingVisualId, class: 'autocomplete-menu__trailing-visual autocomplete-menu__visual-wrap', 'data-component': 'ActionList.TrailingVisual' }, [h(Spinner, { size: 'small' })])
      }
      const menuItemProps = {
        onClick: (event: MouseEvent) => select(item, event),
        onKeypress: (event: KeyboardEvent) => {
          if (disabled || inactiveText || loading) return
          if (event.key === ' ' || event.key === 'Enter') {
            if (event.key === ' ') event.preventDefault() // prevent Space from scrolling the page
            select(item, event, event.key === ' ')
          }
        },
        'aria-disabled': disabled ? true : undefined,
        'data-inactive': inactive ? true : undefined,
        'data-loading': loading && !inactive ? true : undefined,
        tabindex: 0,
        'aria-labelledby': ariaLabelledBy,
        'aria-describedby': ariaDescribedBy,
        'aria-selected': selected,
        role: 'option',
        id: itemId
      }
      return h('li', Object.assign({}, menuItemProps, passthrough, {
        id: itemId,
        'data-id': itemId,
        role: 'option',
        'data-component': 'ActionList.Item',
        'data-variant': variant === 'danger' ? variant : undefined,
        'data-active': active ? true : undefined,
        'data-inactive': inactiveText ? true : undefined,
        'data-is-disabled': disabled ? true : undefined,
        'data-has-description': 'false',
        class: ['autocomplete-menu__item', className],
        style: normalizeReactStyle(restProps.style),
        key: (key ?? itemId) as string | number,
        onMousedown: (event: MouseEvent) => event.preventDefault() // Vue supplement: prevents click from stealing input focus (alternative to source zone container focusin refocus path, registered)
      }), slots.item?.({ item, active: Boolean(active), selected }) ?? [
        h('div', { class: 'autocomplete-menu__content', 'data-size': size }, [
          h('span', { class: 'autocomplete-menu__spacer' }),
          props.selectionVariant === 'multiple'
            ? h('span', { class: 'autocomplete-menu__leading-action autocomplete-menu__visual-wrap', 'data-component': 'ActionList.Selection' }, [
                h('div', { class: 'autocomplete-menu__multi-select-checkbox' })
              ])
            : h('span', { class: 'autocomplete-menu__leading-action autocomplete-menu__visual-wrap', 'data-component': 'ActionList.Selection' }, [
                h(CheckIcon, { class: 'autocomplete-menu__single-select-checkmark' })
              ]),
          visualOrIndicator('leading'),
          h('span', { class: 'autocomplete-menu__sub-content', 'data-component': 'ActionList.Item--DividerContainer' }, [
            h('span', { id: labelId, class: 'autocomplete-menu__label', 'data-component': 'ActionList.Item.Label' }, [
              renderNode(children ?? text),
              loading === true && !inactive ? h('span', { class: 'autocomplete-menu__visually-hidden' }, 'Loading') : null
            ]),
            visualOrIndicator('trailing'),
            !showInactiveIndicator && inactiveText
              ? h('span', { class: 'autocomplete-menu__inactive-warning', id: inactiveWarningId }, inactiveText)
              : null
          ])
        ])
      ])
    }

    return () => {
      const shown = context.showMenu.value
      const { class: ulClass, style: ulStyle, ...restAttrs } = attrs
      return h('span', {
        class: shown ? undefined : 'autocomplete-menu__visually-hidden',
        hidden: shown ? undefined : true
      }, [
        props.loading
          ? h('div', { class: 'autocomplete-menu__loading' }, [h(Spinner)]) // :359-362 SpinnerWrapper
          : h('div', {
              ref: listContainerRef, // :364
              onFocusin: (event: FocusEvent) => {
                // focus-zone.mjs:366-371 —— container focusin: refocus input and highlight the reached item
                if (!zoneActive || !(event.target instanceof HTMLElement)) return
                const target = event.target
                if (allItems.value.some(item => item.id === target.getAttribute('data-id'))) {
                  context.inputRef.value?.focus()
                  updateFocusedElement(target, false)
                }
              },
              onMousemoveCapture: (event: MouseEvent) => {
                if (!zoneActive || !(event.target instanceof Node)) return
                const target = event.target
                let element: HTMLElement | null = null
                if (target instanceof HTMLElement && allItems.value.some(item => item.id === target.getAttribute('data-id'))) {
                  element = target
                } else {
                  const li = target instanceof Element ? target.closest('li[data-id]') : null
                  if (li && allItems.value.some(item => item.id === li.getAttribute('data-id'))) element = li as HTMLElement
                }
                if (element) updateFocusedElement(element, false)
              }
            }, [
              allItems.value.length
                ? h('ul', {
                    ...restAttrs,
                    role: 'listbox',
                    id: `${context.id.value}-listbox`, // :370
                    'data-component': 'Autocomplete.Menu',
                    'data-dividers': 'false',
                    'data-variant': 'inset',
                    class: ['autocomplete-menu', ulClass],
                    style: normalizeReactStyle(ulStyle)
                  }, allItems.value.map(renderItem))
                : props.emptyStateText !== false && props.emptyStateText !== null
                  ? h('div', { class: 'autocomplete-menu__empty' }, [ // :409-411 —— plain div (EmptyStateWrapper), no AriaStatus
                      Object.prototype.hasOwnProperty.call(instance.vnode.props, 'emptyStateText') || Object.prototype.hasOwnProperty.call(instance.vnode.props, 'empty-state-text')
                        ? renderNode(props.emptyStateText as NodeProp)
                        : slots.emptyState?.() ?? renderNode(props.emptyStateText as NodeProp)
                    ])
                  : null
            ])
      ])
    }
  }
})
</script>

<style scoped>
.autocomplete-menu__visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
.autocomplete-menu__loading { display: flex; justify-content: center; padding: var(--base-size-16, 1rem); }
.autocomplete-menu__empty { padding: var(--base-size-16, 1rem); }
.autocomplete-menu { padding: 0; margin: 0; list-style: none; padding-block: var(--base-size-8, 0.5rem); }
.autocomplete-menu__item { position: relative; list-style: none; background-color: var(--control-transparent-bgColor-rest, #ffffff00); border-radius: var(--borderRadius-medium, 0.375rem); margin-inline: var(--base-size-8, 0.5rem); }
.autocomplete-menu__content { position: relative; display: grid; width: 100%; color: var(--control-fgColor-rest, #25292e); text-align: left; user-select: none; background-color: transparent; border: none; border-radius: var(--borderRadius-medium, 0.375rem); transition: background 33.333ms linear; padding-block: var(--control-medium-paddingBlock, 0.375rem); padding-inline: var(--control-medium-paddingInline-condensed, 0.5rem); touch-action: manipulation; -webkit-tap-highlight-color: transparent; grid-template-rows: min-content; grid-template-areas: 'spacer leadingAction leadingVisual content'; grid-template-columns: min-content min-content min-content minmax(0, auto); align-items: start; }
.autocomplete-menu__content > :not(:last-child):not(.autocomplete-menu__spacer) { margin-right: var(--control-medium-gap, 0.5rem); }
.autocomplete-menu__content:hover { text-decoration: none; cursor: pointer; }
.autocomplete-menu__content[data-size='large'] { padding-block: var(--control-large-paddingBlock, 0.625rem); }
.autocomplete-menu__spacer { display: none; width: 0px; grid-area: spacer; }
.autocomplete-menu__leading-action { grid-area: leadingAction; }
.autocomplete-menu__leading-visual { grid-area: leadingVisual; }
.autocomplete-menu__visual-wrap { display: flex; min-width: max-content; min-height: var(--base-size-20, 1.25rem); line-height: 20px; color: var(--fgColor-muted, #59636e); pointer-events: none; fill: var(--fgColor-muted, #59636e); align-items: center; }
.autocomplete-menu__sub-content { grid-area: content; position: relative; display: grid; width: 100%; grid-template-rows: min-content; grid-template-areas: 'label trailingVisual trailingAction'; grid-template-columns: minmax(0, auto) min-content min-content; align-items: start; }
.autocomplete-menu__sub-content > :not(:last-child) { margin-right: var(--control-medium-gap, 0.5rem); }
.autocomplete-menu__trailing-visual { grid-area: trailingVisual; font-size: var(--text-body-size-medium, 0.875rem); }
.autocomplete-menu__label { position: relative; font-size: var(--text-body-size-medium, 0.875rem); font-weight: var(--base-text-weight-normal, 400); line-height: 20px; color: var(--fgColor-default, #1f2328); grid-area: label; word-break: break-word; }
.autocomplete-menu__inactive-warning { font-size: var(--text-body-size-small, 0.75rem); line-height: 16px; color: var(--fgColor-attention, #9a6700); grid-row: 2/2; }
@media (hover: hover) {
  .autocomplete-menu__item:not([data-is-disabled]):hover, .autocomplete-menu__item:not([data-is-disabled]):active { cursor: pointer; }
  .autocomplete-menu__item:not([data-is-disabled]):hover { background-color: var(--control-transparent-bgColor-hover, #818b981a); }
}
.autocomplete-menu__item:not([data-is-disabled]):active { background-color: var(--control-transparent-bgColor-active, #818b9826); }
.autocomplete-menu__item[data-variant='danger']:not([data-is-disabled]) .autocomplete-menu__leading-action,
.autocomplete-menu__item[data-variant='danger']:not([data-is-disabled]) .autocomplete-menu__leading-visual,
.autocomplete-menu__item[data-variant='danger']:not([data-is-disabled]) .autocomplete-menu__label { color: var(--control-danger-fgColor-rest, #d1242f); }
@media (hover: hover) {
  .autocomplete-menu__item[data-variant='danger']:not([data-is-disabled]):hover { background: var(--control-danger-bgColor-hover, #ffebe9); }
}
.autocomplete-menu__item[data-variant='danger']:not([data-is-disabled]):active { background: var(--control-danger-bgColor-active, #ffebe966); }
.autocomplete-menu__item[data-active], .autocomplete-menu__item[data-is-active-descendant] { background: var(--control-transparent-bgColor-selected, #818b9826); outline: 2px solid transparent; }
.autocomplete-menu__item[data-active] .autocomplete-menu__label { font-weight: var(--base-text-weight-semibold, 600); color: var(--control-fgColor-rest, #25292e); }
@media (hover: hover) {
  .autocomplete-menu__item[data-active]:hover { background-color: var(--control-transparent-bgColor-hover, #818b981a); }
}
.autocomplete-menu__item[data-active]::after, .autocomplete-menu__item[data-is-active-descendant]::after { position: absolute; top: var(--base-size-4, 0.25rem); left: calc(-1 * var(--base-size-8, 0.5rem)); width: var(--base-size-4, 0.25rem); height: calc(100% - var(--base-size-8, 0.5rem)); content: ''; background: var(--borderColor-accent-emphasis, #0969da); border-radius: var(--borderRadius-medium, 0.375rem); }
.autocomplete-menu__item[data-inactive='true'] *:not(.autocomplete-menu__inactive-warning) { color: var(--fgColor-muted, #59636e); }
@media (hover: hover) {
  .autocomplete-menu__item[data-inactive='true']:hover { cursor: not-allowed; background-color: transparent; }
}
.autocomplete-menu__item[data-inactive='true']:active { background: transparent; }
.autocomplete-menu__item[data-loading='true'] .autocomplete-menu__label,
.autocomplete-menu__item[data-loading='true'] .autocomplete-menu__leading-visual,
.autocomplete-menu__item[data-loading='true'] .autocomplete-menu__trailing-visual,
.autocomplete-menu__item[data-loading='true'] .autocomplete-menu__leading-action,
.autocomplete-menu__item[data-loading='true'] .autocomplete-menu__visual-wrap { color: var(--fgColor-muted, #59636e); }
.autocomplete-menu__item[data-is-disabled] .autocomplete-menu__content * { color: var(--control-fgColor-disabled, #818b98); }
@media (hover: hover) {
  .autocomplete-menu__item[data-is-disabled] .autocomplete-menu__content:hover { cursor: not-allowed; background-color: transparent; }
  .autocomplete-menu__item[data-is-disabled]:hover { background-color: transparent; }
}
.autocomplete-menu__item[data-is-disabled] .autocomplete-menu__multi-select-checkbox { background-color: var(--control-bgColor-disabled, #eff2f5); border-color: var(--control-borderColor-disabled, #818b981a); }
.autocomplete-menu__item[data-is-disabled][aria-selected='true'] .autocomplete-menu__multi-select-checkbox { background-color: var(--control-checked-bgColor-disabled, #818b98); border-color: var(--control-checked-bgColor-disabled, #818b98); }
.autocomplete-menu__item[data-is-disabled][aria-selected='true'] .autocomplete-menu__multi-select-checkbox::before { background-color: var(--control-checked-fgColor-disabled, #ffffff); }
.autocomplete-menu__multi-select-checkbox { position: relative; display: grid; width: var(--base-size-16, 1rem); height: var(--base-size-16, 1rem); margin: 0; cursor: pointer; background-color: var(--bgColor-default, #ffffff); border: var(--borderWidth-thin, 0.0625rem) solid var(--control-borderColor-emphasis, #818b98); border-radius: var(--borderRadius-small, 0.1875rem); transition: background-color, border-color 80ms cubic-bezier(0.33, 1, 0.68, 1); place-content: center; }
.autocomplete-menu__multi-select-checkbox::before { width: var(--base-size-16, 1rem); height: var(--base-size-16, 1rem); content: ''; background-color: var(--control-checked-fgColor-rest, #ffffff); transition: visibility 0s linear 230ms; clip-path: inset(var(--base-size-16, 1rem) 0 0 0); mask-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTEuNzgwMyAwLjIxOTYyNUMxMS45MjEgMC4zNjA0MjcgMTIgMC41NTEzMDUgMTIgMC43NTAzMTNDMTIgMC45NDkzMjEgMTEuOTIxIDEuMTQwMTkgMTEuNzgwMyAxLjI4MUw0LjUxODYgOC41NDA0MkM0LjM3Nzc1IDguNjgxIDQuMTg2ODIgOC43NiAzLjk4Nzc0IDguNzZDMy43ODg2NyA4Ljc2IDMuNTk3NzMgOC42ODEgMy40NTY4OSA4LjU0MDQyTDAuMjAxNjIyIDUuMjg2MkMwLjA2ODkyNzcgNS4xNDM4MyAtMC4wMDMzMDkwNSA0Ljk1NTU1IDAuMDAwMTE2NDkzIDQuNzYwOThDMC4wMDM1NTIwNSA0LjU2NjQzIDAuMDgyMzg5NCA0LjM4MDgxIDAuMjIwMDMyIDQuMjQzMjFDMC4zNTc2NjUgNC4xMDU2MiAwLjU0MzM1NSA0LjAyNjgxIDAuNzM3OTcgNC4wMjMzOEMwLjkzMjU4NCA0LjAxOTk0IDEuMTIwOTMgNC4wOTIxNyAxLjI2MzM0IDQuMjI0ODJMMy45ODc3NCA2Ljk0ODM1TDEwLjcxODYgMC4yMTk2MjVDMTAuODU5NSAwLjA3ODk5MjMgMTEuMDUwNCAwIDExLjI0OTUgMEMxMS40NDg1IDAgMTEuNjM5NSAwLjA3ODk5MjMgMTEuNzgwMyAwLjIxOTYyNVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg=='); mask-size: 75%; mask-repeat: no-repeat; mask-position: center; animation: autocomplete-checkmark-out 80ms cubic-bezier(0.65, 0, 0.35, 1); }
.autocomplete-menu__item[aria-selected='true'] .autocomplete-menu__multi-select-checkbox { background-color: var(--control-checked-bgColor-rest, #0969da); border-color: var(--control-checked-borderColor-rest, #0969da); transition: background-color, border-color 80ms cubic-bezier(0.32, 0, 0.67, 0) 0ms; }
.autocomplete-menu__item[aria-selected='true'] .autocomplete-menu__multi-select-checkbox::before { visibility: visible; transition: visibility 0s linear 0s; animation: autocomplete-checkmark-in 80ms cubic-bezier(0.65, 0, 0.35, 1) forwards 80ms; }
.autocomplete-menu__item[aria-selected='false'] .autocomplete-menu__multi-select-checkbox::before { visibility: hidden; }
.autocomplete-menu__single-select-checkmark { visibility: hidden; }
.autocomplete-menu__item[aria-selected='true'] .autocomplete-menu__single-select-checkmark { visibility: visible; }
.autocomplete-menu__item[aria-selected='false'] .autocomplete-menu__single-select-checkmark { visibility: hidden; }
@keyframes autocomplete-checkmark-in { from { clip-path: inset(var(--base-size-16, 1rem) 0 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes autocomplete-checkmark-out { from { clip-path: inset(0 0 0 0); } to { clip-path: inset(var(--base-size-16, 1rem) 0 0 0); } }
</style>
