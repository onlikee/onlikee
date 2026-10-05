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
// AutocompleteMenu.tsx:174-275 —— item entry after selectableItems/allItemsToRender mapping
type MenuEntry = AutocompleteMenuItem & {
  role: 'option'
  active: boolean
  selected: boolean | undefined
  onAction: (item: MenuEntry) => void
}

// ---- AutocompleteMenu.tsx:29-52 module-level utility functions (source direct port) ----
const getDefaultSortFn = (isItemSelectedFn: (itemId: string) => boolean) => (itemIdA: string, itemIdB: string) =>
  isItemSelectedFn(itemIdA) === isItemSelectedFn(itemIdB) ? 0 : isItemSelectedFn(itemIdA) ? -1 : 1
const menuScrollMargins = { startMargin: 0, endMargin: 8 } // AutocompleteMenu.tsx:31
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

// AutocompleteMenu.tsx:129-131 —— module-level debounce(announce, 250) (@github/mini-throttle trailing semantics;
// this dependency is not installed → inline equivalent implementation). announce is loaded on demand (same strategy as AriaStatus.vue):
// @primer/live-region-element registers custom elements at import time, avoiding bringing side effects into SSR.
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

// ---- @primer/behaviors focus-zone direct port (focus-zone.mjs:26-130); useFocusZone(AutocompleteMenu.tsx:287-315)
// does not pass bindKeys/getNextFocusable → default bindKeys = ArrowVertical | HomeAndEnd (focus-zone.mjs:135) ----
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
  // focus-zone.mjs:82-126 direct port —— M-2: in editable elements, Home/End/single characters are all ignored (return true)
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
    const listContainerRef = ref<HTMLElement | null>(null) // AutocompleteMenu.tsx:168
    const highlightedItem = shallowRef<AutocompleteMenuItem>() // :170 —— source stores entire item object (stale reference quirk preserved, M-4)
    const sortedItemIds = ref<string[]>(props.items.map(({ id: itemId }) => itemId)) // :171
    const generatedUniqueId = computed(() => context.id.value) // :172 useId(id) —— context id is already props.id ?? generated

    // focusZone internal state (focus-zone.mjs:133-143): focusableElements set is replaced by allItems,
    // currentFocusedElement is tracked by li[data-id]
    let zoneCurrentId: string | undefined
    let zoneActive = false

    const assertSelection = () => {
      // AutocompleteMenu.tsx:353-355 —— render phase assertion
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
      // AutocompleteMenu.tsx:296-312 —— activeDescendantRef.current = current || null is executed unconditionally;
      // when current exists, search by data-id (may get undefined → highlightedItem is left dangling); only scroll when directlyActivated
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
      // focus-zone.mjs:170-185 (!to.id uniqueId branch is dead code: Item always renders id, Item.tsx:210)
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
      // focus-zone.mjs:354-358 → endFocusManagement (255-273): when input still has focus, cascade highlight
      // item by item to the last one (M-4: highlightedItem residue), then updateFocusedElement(undefined) → clearActiveDescendant;
      // intermediate attribute/marker changes are all erased by the final clear, so only the resulting state transitions are reproduced here.
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

    // useFocusZone.ts:50-73 —— effect deps [disabled=!showMenu, loading]；zone 仅在 container 与 input
    // 均已挂载时创建（M-6）。注意：Vue 的 immediate+post 会在 setup 期同步执行（DOM 未就绪），
    // 故用 onMounted 承载首次执行，等价 React 的 post-commit effect。
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

    // H-1 —— AutocompleteMenu.tsx:317-326: deps exactly [highlightedItem, deferredInputValue, selectedItemIds, setAutocompleteSuggestion]
    watch([highlightedItem, context.deferredInputValue, () => props.selectedItemIds], () => {
      const item = highlightedItem.value
      if (item && item.text !== undefined && item.text.startsWith(context.deferredInputValue.value) && !props.selectedItemIds.includes(item.id)) {
        context.setAutocompleteSuggestion(item.text)
      } else {
        context.setAutocompleteSuggestion('')
      }
    }, { immediate: true })

    const itemSortOrderData = computed(() => sortedItemIds.value.reduce<Record<string, number>>((acc, curr, i) => {
      // AutocompleteMenu.tsx:219-227
      acc[curr] = i
      return acc
    }, {}))

    function defaultOnAction(item: MenuEntry) {
      // AutocompleteMenu.tsx:183-203 —— pair semantics: other + (includes ? removal : addition), single mode also goes through the same logic
      // (M-2 source quirk: when single-selecting a new item, emits ['old selection', 'new selection'] pair instead of replacing)
      const otherSelectedItemIds = props.selectedItemIds.filter(selectedItemId => selectedItemId !== item.id)
      const newSelectedItemIds = props.selectedItemIds.includes(item.id) ? otherSelectedItemIds : [...otherSelectedItemIds, item.id]
      const selectedItems = newSelectedItemIds.map(newSelectedItemId => getItemById(newSelectedItemId, props.items)) as AutocompleteMenuItem[]
      if (instance.vnode.props?.onSelectedChange) emit('selected-change', selectedItems)
      else {
        // getdefaultCheckedSelectionChange (AutocompleteMenu.tsx:39-46) —— destructuring empty array throws TypeError, source quirk kept as-is
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
      // AutocompleteMenu.tsx:174-217 —— disabled items also enter the list (M-5: still highlightable/selectable, only stopped by Item layer guard)
      ...selectableItem,
      role: 'option',
      id: selectableItem.id,
      active: highlightedItem.value?.id === selectableItem.id,
      selected: props.selectionVariant === 'multiple' ? props.selectedItemIds.includes(selectableItem.id) : undefined,
      onAction: defaultOnAction
    })))

    const sortedAndFilteredItemsToRender = computed(() => {
      // AutocompleteMenu.tsx:229-235 —— unknown id produces NaN comparator (source as-is, V8 treats as 0/stable sort)
      const itemFilter = props.filterFn ?? getDefaultItemFilter(context.deferredInputValue.value)
      return selectableItems.value
        .filter(itemFilter)
        .sort((a, b) => itemSortOrderData.value[a.id] - itemSortOrderData.value[b.id])
    })

    const allItems = computed<MenuEntry[]>(() => [
      // AutocompleteMenu.tsx:237-275
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

    // AutocompleteMenu.tsx:328-344 —— deps include sortedItemIds itself: after setSortedItemIds it runs again,
    // onOpenChange is called unconditionally again (source double-emit quirk preserved)
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

    // AutocompleteMenu.tsx:346-351 —— only syncs when non-empty (source quirk: clearing selection does not reset to 0; M-12 trigger chain)
    const syncSelectedItemLength = () => {
      if (props.selectedItemIds.length) context.setSelectedItemLength(props.selectedItemIds.length)
    }
    watch(() => props.selectedItemIds, syncSelectedItemLength, { flush: 'post' })
    onMounted(syncSelectedItemLength)

    // AutocompleteMenu.tsx:281-285 —— triggers regardless of loading/showMenu when render list is empty;
    // when emptyStateText=false, source passes false directly to announce (kept as-is)
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
      const items = allItems.value // zone focusable set = rendered li's (including disabled items, M-5)
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
      // Item.tsx:186-192 (click) / 194-208 (keyPress) guards; composing check is Vue IME addition (registered)
      if (item.disabled || item.inactiveText || item.loading || context.composing.value) return
      // Item.tsx:131-142 —— user onSelect first, defaultPrevented blocks subsequent action
      const onSelectUser = item.onSelect as ((selectEvent: Event) => void) | undefined
      if (typeof onSelectUser === 'function' && event) onSelectUser(event)
      // Item.tsx:200-203: Space's preventDefault is reset by source before checking; native defaultPrevented is read-only →
      // use ignorePriorPrevention to compensate (user onSelect preventDefault on Space is un-mirrored edge case, registered)
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
      // AutocompleteMenu.tsx:373-406 + ActionList/Item.tsx:86-104 —— destructuring consistent with source
      const {
        id, onAction: _onAction, children, text, leadingVisual, trailingVisual, key, role: _role,
        variant = 'default', size = 'medium', disabled, inactiveText, selected, active, loading, className,
        onSelect: _onSelect, groupId: _groupId, renderItem: _renderItem, handleAddItem: _handleAddItem,
        metadata: _metadata, // object value —— React DOM skips non-primitive unknown attributes
        ...restProps
      } = item
      const itemId = id
      const labelId = `${itemId}--label` // Item.tsx:214
      const trailingVisualId = `${itemId}--trailing-visual` // Item.tsx:213
      const inactive = Boolean(inactiveText)
      const showInactiveIndicator = false // Item.tsx:127-129 —— listRole='listbox' → always false
      const inactiveWarningId = inactive && !showInactiveIndicator ? `${itemId}--warning-message` : undefined // Item.tsx:215
      const ariaLabelledBy = [labelId, trailingVisual ? trailingVisualId : undefined].filter(Boolean).join(' ') // Item.tsx:233-237
      // Item.tsx:239-245 —— description is not a slot (M-11), aria-describedby can only contain the warning id
      const ariaDescribedBy = inactiveWarningId
      // Item.tsx:282 {...props} —— React DOM only renders primitive unknown attributes
      // (string description is output as a raw attribute; object/component values are skipped, M-10/M-11)
      const passthrough: Record<string, unknown> = {}
      for (const [name, value] of Object.entries(restProps)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') passthrough[name] = value
      }
      const hasLeadingVisual = Boolean(leadingVisual)
      function visualOrIndicator(position: 'leading' | 'trailing') {
        // Visuals.tsx:59-86 —— inactiveText argument is always undefined in Autocomplete scenarios (Item.tsx:350-358,374-382)
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
        // Item.tsx:247-260
        onClick: (event: MouseEvent) => select(item, event),
        onKeypress: (event: KeyboardEvent) => {
          // Item.tsx:194-208
          if (disabled || inactiveText || loading) return
          if (event.key === ' ' || event.key === 'Enter') {
            if (event.key === ' ') event.preventDefault() // prevent Space from scrolling the page
            select(item, event, event.key === ' ')
          }
        },
        'aria-disabled': disabled ? true : undefined,
        'data-inactive': inactive ? true : undefined,
        'data-loading': loading && !inactive ? true : undefined,
        tabindex: 0, // Item.tsx:254 —— focusable=undefined → tabIndex 0 (M-10)
        'aria-labelledby': ariaLabelledBy,
        'aria-describedby': ariaDescribedBy,
        'aria-selected': selected, // Item.tsx:257 —— single → undefined omitted; multiple → "true"/"false"
        role: 'option',
        id: itemId
      }
      return h('li', Object.assign({}, menuItemProps, passthrough, {
        // AutocompleteMenu.tsx:390-392 —— id/data-id/role are after itemProps spread
        id: itemId,
        'data-id': itemId,
        role: 'option',
        // Item.tsx:325-335
        'data-component': 'ActionList.Item',
        'data-variant': variant === 'danger' ? variant : undefined,
        'data-active': active ? true : undefined,
        'data-inactive': inactiveText ? true : undefined,
        'data-is-disabled': disabled ? true : undefined,
        'data-has-description': 'false', // Item.tsx:332 —— slots.description never exists → literal "false" (M-10)
        class: ['autocomplete-menu__item', className],
        style: normalizeReactStyle(restProps.style),
        key: (key ?? itemId) as string | number,
        onMousedown: (event: MouseEvent) => event.preventDefault() // Vue supplement: prevents click from stealing input focus (alternative to source zone container focusin refocus path, registered)
      }), slots.item?.({ item, active: Boolean(active), selected }) ?? [
        // Item.tsx:347-393
        h('div', { class: 'autocomplete-menu__content', 'data-size': size }, [ // Item.tsx:341-343 ItemWrapper
          h('span', { class: 'autocomplete-menu__spacer' }), // Item.tsx:348
          props.selectionVariant === 'multiple' // Selection.tsx:40-52
            ? h('span', { class: 'autocomplete-menu__leading-action autocomplete-menu__visual-wrap', 'data-component': 'ActionList.Selection' }, [
                h('div', { class: 'autocomplete-menu__multi-select-checkbox' })
              ])
            : h('span', { class: 'autocomplete-menu__leading-action autocomplete-menu__visual-wrap', 'data-component': 'ActionList.Selection' }, [
                h(CheckIcon, { class: 'autocomplete-menu__single-select-checkmark' })
              ]),
          visualOrIndicator('leading'),
          h('span', { class: 'autocomplete-menu__sub-content', 'data-component': 'ActionList.Item--DividerContainer' }, [ // Item.tsx:359-361
            // Item.tsx:362-373 —— ConditionalWrapper if=!!slots.description → false → children rendered directly (no wrapper)
            h('span', { id: labelId, class: 'autocomplete-menu__label', 'data-component': 'ActionList.Item.Label' }, [
              renderNode(children ?? text),
              loading === true && !inactive ? h('span', { class: 'autocomplete-menu__visually-hidden' }, 'Loading') : null // Item.tsx:366-371 strict === true
            ]),
            visualOrIndicator('trailing'),
            !showInactiveIndicator && inactiveText // Item.tsx:384-392
              ? h('span', { class: 'autocomplete-menu__inactive-warning', id: inactiveWarningId }, inactiveText)
              : null
          ])
        ])
      ])
    }

    return () => {
      const shown = context.showMenu.value
      const { class: ulClass, style: ulStyle, ...restAttrs } = attrs
      // AutocompleteMenu.tsx:357-415
      return h('span', {
        // :358 <VisuallyHidden isVisible={showMenu} hidden={!showMenu}> → span (_VisuallyHidden.tsx:14-27)
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
                // focus-zone.mjs:372-385 —— hover indirect highlight; disabled items are equally highlightable (M-5)
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
                    ...restAttrs, // List.tsx:122 —— restProps spread last (aria-labelledby comes from here, and can override the defaults below)
                    role: 'listbox', // AutocompleteMenu.tsx:369
                    id: `${context.id.value}-listbox`, // :370
                    'data-component': 'Autocomplete.Menu', // :367 —— overrides List default 'ActionList' (List.tsx:118,122)
                    'data-dividers': 'false', // List.tsx:119 —— showDividers=false → literal "false" (M-9: no aria-multiselectable)
                    'data-variant': 'inset', // List.tsx:120 —— default variant
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
/* Ported from AutocompleteMenu.module.css + relevant subset of ActionList.module.css
   (scenario: role=listbox, data-variant=inset, no dividers/subitem/trailing-action).
   var() fallback values taken from Primer primitives 11.5.1 light theme. */
.autocomplete-menu__visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
/* AutocompleteMenu.module.css:1-9 SpinnerWrapper (no align-items) */
.autocomplete-menu__loading { display: flex; justify-content: center; padding: var(--base-size-16, 1rem); }
/* AutocompleteMenu.module.css EmptyStateWrapper —— only padding */
.autocomplete-menu__empty { padding: var(--base-size-16, 1rem); }
/* ActionList.module.css:3-16 .ActionList + [data-variant='inset'] */
.autocomplete-menu { padding: 0; margin: 0; list-style: none; padding-block: var(--base-size-8, 0.5rem); }
/* ActionList.module.css:18-23 (inset item margin-inline) + 111-121 (.ActionListItem) */
.autocomplete-menu__item { position: relative; list-style: none; background-color: var(--control-transparent-bgColor-rest, #ffffff00); border-radius: var(--borderRadius-medium, 0.375rem); margin-inline: var(--base-size-8, 0.5rem); }
/* ActionList.module.css:501-541 .ActionListContent */
.autocomplete-menu__content { position: relative; display: grid; width: 100%; color: var(--control-fgColor-rest, #25292e); text-align: left; user-select: none; background-color: transparent; border: none; border-radius: var(--borderRadius-medium, 0.375rem); transition: background 33.333ms linear; padding-block: var(--control-medium-paddingBlock, 0.375rem); padding-inline: var(--control-medium-paddingInline-condensed, 0.5rem); touch-action: manipulation; -webkit-tap-highlight-color: transparent; grid-template-rows: min-content; grid-template-areas: 'spacer leadingAction leadingVisual content'; grid-template-columns: min-content min-content min-content minmax(0, auto); align-items: start; }
.autocomplete-menu__content > :not(:last-child):not(.autocomplete-menu__spacer) { margin-right: var(--control-medium-gap, 0.5rem); }
.autocomplete-menu__content:hover { text-decoration: none; cursor: pointer; }
.autocomplete-menu__content[data-size='large'] { padding-block: var(--control-large-paddingBlock, 0.625rem); }
/* ActionList.module.css:612-616 .Spacer (depth=0) */
.autocomplete-menu__spacer { display: none; width: 0px; grid-area: spacer; }
.autocomplete-menu__leading-action { grid-area: leadingAction; }
.autocomplete-menu__leading-visual { grid-area: leadingVisual; }
/* ActionList.module.css:688-699 .VisualWrap */
.autocomplete-menu__visual-wrap { display: flex; min-width: max-content; min-height: var(--base-size-20, 1.25rem); line-height: 20px; color: var(--fgColor-muted, #59636e); pointer-events: none; fill: var(--fgColor-muted, #59636e); align-items: center; }
/* ActionList.module.css:591-606 .ActionListSubContent */
.autocomplete-menu__sub-content { grid-area: content; position: relative; display: grid; width: 100%; grid-template-rows: min-content; grid-template-areas: 'label trailingVisual trailingAction'; grid-template-columns: minmax(0, auto) min-content min-content; align-items: start; }
.autocomplete-menu__sub-content > :not(:last-child) { margin-right: var(--control-medium-gap, 0.5rem); }
.autocomplete-menu__trailing-visual { grid-area: trailingVisual; font-size: var(--text-body-size-medium, 0.875rem); }
/* ActionList.module.css:702-713 .ItemLabel */
.autocomplete-menu__label { position: relative; font-size: var(--text-body-size-medium, 0.875rem); font-weight: var(--base-text-weight-normal, 400); line-height: 20px; color: var(--fgColor-default, #1f2328); grid-area: label; word-break: break-word; }
/* ActionList.module.css:784-794 .InactiveWarning */
.autocomplete-menu__inactive-warning { font-size: var(--text-body-size-small, 0.75rem); line-height: 16px; color: var(--fgColor-attention, #9a6700); grid-row: 2/2; }
/* ActionList.module.css:136-164 hover/active (data-has-subitem branch not applicable in Autocomplete) */
@media (hover: hover) {
  .autocomplete-menu__item:not([data-is-disabled]):hover, .autocomplete-menu__item:not([data-is-disabled]):active { cursor: pointer; }
  .autocomplete-menu__item:not([data-is-disabled]):hover { background-color: var(--control-transparent-bgColor-hover, #818b981a); }
}
.autocomplete-menu__item:not([data-is-disabled]):active { background-color: var(--control-transparent-bgColor-active, #818b9826); }
/* ActionList.module.css:176-214 danger variant */
.autocomplete-menu__item[data-variant='danger']:not([data-is-disabled]) .autocomplete-menu__leading-action,
.autocomplete-menu__item[data-variant='danger']:not([data-is-disabled]) .autocomplete-menu__leading-visual,
.autocomplete-menu__item[data-variant='danger']:not([data-is-disabled]) .autocomplete-menu__label { color: var(--control-danger-fgColor-rest, #d1242f); }
@media (hover: hover) {
  .autocomplete-menu__item[data-variant='danger']:not([data-is-disabled]):hover { background: var(--control-danger-bgColor-hover, #ffebe9); }
}
.autocomplete-menu__item[data-variant='danger']:not([data-is-disabled]):active { background: var(--control-danger-bgColor-active, #ffebe966); }
/* ActionList.module.css:217-266 [data-active] / [data-is-active-descendant] —— selected background token */
.autocomplete-menu__item[data-active], .autocomplete-menu__item[data-is-active-descendant] { background: var(--control-transparent-bgColor-selected, #818b9826); outline: 2px solid transparent; }
.autocomplete-menu__item[data-active] .autocomplete-menu__label { font-weight: var(--base-text-weight-semibold, 600); color: var(--control-fgColor-rest, #25292e); }
@media (hover: hover) {
  .autocomplete-menu__item[data-active]:hover { background-color: var(--control-transparent-bgColor-hover, #818b981a); }
}
.autocomplete-menu__item[data-active]::after, .autocomplete-menu__item[data-is-active-descendant]::after { position: absolute; top: var(--base-size-4, 0.25rem); left: calc(-1 * var(--base-size-8, 0.5rem)); width: var(--base-size-4, 0.25rem); height: calc(100% - var(--base-size-8, 0.5rem)); content: ''; background: var(--borderColor-accent-emphasis, #0969da); border-radius: var(--borderRadius-medium, 0.375rem); }
/* ActionList.module.css:269-289 inactive */
.autocomplete-menu__item[data-inactive='true'] *:not(.autocomplete-menu__inactive-warning) { color: var(--fgColor-muted, #59636e); }
@media (hover: hover) {
  .autocomplete-menu__item[data-inactive='true']:hover { cursor: not-allowed; background-color: transparent; }
}
.autocomplete-menu__item[data-inactive='true']:active { background: transparent; }
/* ActionList.module.css:291-301 loading */
.autocomplete-menu__item[data-loading='true'] .autocomplete-menu__label,
.autocomplete-menu__item[data-loading='true'] .autocomplete-menu__leading-visual,
.autocomplete-menu__item[data-loading='true'] .autocomplete-menu__trailing-visual,
.autocomplete-menu__item[data-loading='true'] .autocomplete-menu__leading-action,
.autocomplete-menu__item[data-loading='true'] .autocomplete-menu__visual-wrap { color: var(--fgColor-muted, #59636e); }
/* ActionList.module.css:344-383 disabled */
.autocomplete-menu__item[data-is-disabled] .autocomplete-menu__content * { color: var(--control-fgColor-disabled, #818b98); }
@media (hover: hover) {
  .autocomplete-menu__item[data-is-disabled] .autocomplete-menu__content:hover { cursor: not-allowed; background-color: transparent; }
  .autocomplete-menu__item[data-is-disabled]:hover { background-color: transparent; }
}
.autocomplete-menu__item[data-is-disabled] .autocomplete-menu__multi-select-checkbox { background-color: var(--control-bgColor-disabled, #eff2f5); border-color: var(--control-borderColor-disabled, #818b981a); }
.autocomplete-menu__item[data-is-disabled][aria-selected='true'] .autocomplete-menu__multi-select-checkbox { background-color: var(--control-checked-bgColor-disabled, #818b98); border-color: var(--control-checked-bgColor-disabled, #818b98); }
.autocomplete-menu__item[data-is-disabled][aria-selected='true'] .autocomplete-menu__multi-select-checkbox::before { background-color: var(--control-checked-fgColor-disabled, #ffffff); }
/* ActionList.module.css:407-448 .MultiSelectCheckbox */
.autocomplete-menu__multi-select-checkbox { position: relative; display: grid; width: var(--base-size-16, 1rem); height: var(--base-size-16, 1rem); margin: 0; cursor: pointer; background-color: var(--bgColor-default, #ffffff); border: var(--borderWidth-thin, 0.0625rem) solid var(--control-borderColor-emphasis, #818b98); border-radius: var(--borderRadius-small, 0.1875rem); transition: background-color, border-color 80ms cubic-bezier(0.33, 1, 0.68, 1); place-content: center; }
.autocomplete-menu__multi-select-checkbox::before { width: var(--base-size-16, 1rem); height: var(--base-size-16, 1rem); content: ''; background-color: var(--control-checked-fgColor-rest, #ffffff); transition: visibility 0s linear 230ms; clip-path: inset(var(--base-size-16, 1rem) 0 0 0); mask-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTEuNzgwMyAwLjIxOTYyNUMxMS45MjEgMC4zNjA0MjcgMTIgMC41NTEzMDUgMTIgMC43NTAzMTNDMTIgMC45NDkzMjEgMTEuOTIxIDEuMTQwMTkgMTEuNzgwMyAxLjI4MUw0LjUxODYgOC41NDA0MkM0LjM3Nzc1IDguNjgxIDQuMTg2ODIgOC43NiAzLjk4Nzc0IDguNzZDMy43ODg2NyA4Ljc2IDMuNTk3NzMgOC42ODEgMy40NTY4OSA4LjU0MDQyTDAuMjAxNjIyIDUuMjg2MkMwLjA2ODkyNzcgNS4xNDM4MyAtMC4wMDMzMDkwNSA0Ljk1NTU1IDAuMDAwMTE2NDkzIDQuNzYwOThDMC4wMDM1NTIwNSA0LjU2NjQzIDAuMDgyMzg5NCA0LjM4MDgxIDAuMjIwMDMyIDQuMjQzMjFDMC4zNTc2NjUgNC4xMDU2MiAwLjU0MzM1NSA0LjAyNjgxIDAuNzM3OTcgNC4wMjMzOEMwLjkzMjU4NCA0LjAxOTk0IDEuMTIwOTMgNC4wOTIxNyAxLjI2MzM0IDQuMjI0ODJMMy45ODc3NCA2Ljk0ODM1TDEwLjcxODYgMC4yMTk2MjVDMTAuODU5NSAwLjA3ODk5MjMgMTEuMDUwNCAwIDExLjI0OTUgMEMxMS40NDg1IDAgMTEuNjM5NSAwLjA3ODk5MjMgMTEuNzgwMyAwLjIxOTYyNVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg=='); mask-size: 75%; mask-repeat: no-repeat; mask-position: center; animation: autocomplete-checkmark-out 80ms cubic-bezier(0.65, 0, 0.35, 1); }
.autocomplete-menu__item[aria-selected='true'] .autocomplete-menu__multi-select-checkbox { background-color: var(--control-checked-bgColor-rest, #0969da); border-color: var(--control-checked-borderColor-rest, #0969da); transition: background-color, border-color 80ms cubic-bezier(0.32, 0, 0.67, 0) 0ms; }
.autocomplete-menu__item[aria-selected='true'] .autocomplete-menu__multi-select-checkbox::before { visibility: visible; transition: visibility 0s linear 0s; animation: autocomplete-checkmark-in 80ms cubic-bezier(0.65, 0, 0.35, 1) forwards 80ms; }
.autocomplete-menu__item[aria-selected='false'] .autocomplete-menu__multi-select-checkbox::before { visibility: hidden; }
/* ActionList.module.css:494-496 + 474-476 + 479-491 SingleSelectCheckmark (single variant never has aria-selected='true', source dead rule kept) */
.autocomplete-menu__single-select-checkmark { visibility: hidden; }
.autocomplete-menu__item[aria-selected='true'] .autocomplete-menu__single-select-checkmark { visibility: visible; }
.autocomplete-menu__item[aria-selected='false'] .autocomplete-menu__single-select-checkmark { visibility: hidden; }
/* ActionList.module.css:796-813 */
@keyframes autocomplete-checkmark-in { from { clip-path: inset(var(--base-size-16, 1rem) 0 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes autocomplete-checkmark-out { from { clip-path: inset(0 0 0 0); } to { clip-path: inset(var(--base-size-16, 1rem) 0 0 0); } }
</style>
