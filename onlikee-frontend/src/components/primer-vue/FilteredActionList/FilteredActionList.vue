<script setup lang="ts">
import { computed, getCurrentInstance, h, isVNode, nextTick, onBeforeUnmount, shallowRef, useAttrs, useId, watch, type Component, type VNodeChild } from 'vue'
import { scrollIntoView, FocusKeys } from '@primer/behaviors'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { useFocusZone } from '../composables/useFocusZone'
import { useFeatureFlag } from '../FeatureFlags'
import { Spinner } from '../Spinner'
import { Checkbox } from '../Checkbox'
import { Radio } from '../Radio'
import CheckIcon from '../../octicons-vue3/icons/check.vue'
import { assignElementRef } from '../internal/assignElementRef'
import { normalizeReactStyle } from '../internal/style'
import FilteredActionListInput from './FilteredActionListInput.vue'
import BodyLoader from './FilteredActionListBodyLoader.vue'
import { FilteredActionListLoadingTypes, type FilteredActionListProps, type ItemInput, type Visual } from './types'
defineOptions({ name: 'FilteredActionList', inheritAttrs: false })
const props = withDefaults(defineProps<FilteredActionListProps>(), {
  loading: false, loadingType: () => FilteredActionListLoadingTypes.bodySpinner, filterValue: undefined,
  variant: 'inset', focusOutBehavior: 'wrap', _PrivateFocusManagement: 'active-descendant',
  announcementsEnabled: true, disableSelectOnHover: false, setInitialFocus: false, virtualized: false,
  fullScreenOnNarrow: false, showSelectAll: undefined, focusPrependedElements: false
})
const emit = defineEmits<{
  'update:filterValue': [value: string]
  'filter-change': [value: string, event: Event | null]
  'select-all-change': [checked: boolean]
  'active-descendant-changed': [current: HTMLElement | undefined, previous: HTMLElement | undefined, directlyActivated: boolean]
}>()
// Keep ref callbacks as reactive props: declaring them as emits makes Vue skip
// updates when only these listeners change. The instance still emits native events.
const emitRefChanged = getCurrentInstance()!.emit
const attrs = useAttrs()
const root = shallowRef<HTMLDivElement | null>(null)
const list = shallowRef<HTMLElement | null>(null)
const input = shallowRef<HTMLInputElement | null>(null)
const scrollContainer = shallowRef<HTMLDivElement | null>(null)
const ownFilterValue = shallowRef('')
const value = computed(() => props.filterValue ?? ownFilterValue.value)
const generatedId = useId()
const listId = computed(() => props.actionListProps?.id ?? `${generatedId}-list`)
const listLabel = computed(() => props.actionListProps && 'aria-label' in props.actionListProps ? props.actionListProps['aria-label'] : props['aria-label'] ?? attrs['aria-label'] as string | undefined)
const descriptionId = `${generatedId}-description`
const active = shallowRef<HTMLElement>()
const focused = shallowRef(false)
const usingRoving = computed(() => props._PrivateFocusManagement === 'roving-tabindex')
const virtualized = computed(() => props.virtualized && !props.groupMetadata?.length)
const selectionVariant = computed(() => {
  const variant = props.actionListProps && 'selectionVariant' in props.actionListProps ? props.actionListProps.selectionVariant : props.selectionVariant
  return usingRoving.value ? variant || props.selectionVariant : variant
})
const listVariant = computed(() => props.actionListProps && 'variant' in props.actionListProps ? props.actionListProps.variant ?? 'inset' : props.variant)
const mergedRefs = useFeatureFlag('primer_react_merged_forwarded_refs')
const mixedDescriptions = computed(() => (usingRoving.value || mergedRefs.value) && props.items.some(item => item.description) && props.items.some(item => !item.description))
const selectableItems = computed(() => props.groupMetadata?.length
  ? props.groupMetadata.flatMap(group => props.items.filter(item => item.groupId === group.groupId)) : props.items)
const virtualizer = useVirtualizer(computed(() => ({
  count: props.items.length, getScrollElement: () => scrollContainer.value, estimateSize: () => 32,
  overscan: 10, enabled: virtualized.value,
  getItemKey: (index: number) => props.items[index]?.key ?? props.items[index]?.id?.toString() ?? index.toString(),
  measureElement: (element: Element) => (element as HTMLElement).scrollHeight
})))
const entries = computed(() => virtualized.value
  ? virtualizer.value.getVirtualItems().map(entry => ({ item: props.items[entry.index]!, index: entry.index, start: entry.start }))
  : props.items.map((item, index) => ({ item, index, start: undefined })))
const selectAllChecked = computed(() => props.items.length > 0 && props.items.every(item => item.selected))
const selectAllMixed = computed(() => !selectAllChecked.value && props.items.some(item => item.selected))
const showSelectAllControl = computed(() => props.showSelectAll ?? !!props.onSelectAllChange)
watch(() => props.virtualized && !!props.groupMetadata?.length, enabled => {
  if (enabled && import.meta.env.DEV) console.warn('FilteredActionList: `virtualized` has no effect when `groupMetadata` is provided. Grouped lists are rendered without virtualization.')
}, { immediate: true })
function setInput(element: HTMLInputElement | null) {
  input.value = element
  assignElementRef(props.inputRef, element)
  emitRefChanged('input-ref-changed', element)
}
watch(scrollContainer, element => assignElementRef(props.scrollContainerRef, element))
watch(list, element => { if (!usingRoving.value) emitRefChanged('list-container-ref-changed', element) }, { flush: 'post' })
watch(() => props.onInputRefChanged, () => emitRefChanged('input-ref-changed', input.value), { flush: 'post' })
watch(() => props.onListContainerRefChanged, (_next, previous) => {
  if (usingRoving.value) return
  previous?.(null)
  emitRefChanged('list-container-ref-changed', list.value)
}, { flush: 'post' })
onBeforeUnmount(() => {
  setInput(null)
  assignElementRef(props.scrollContainerRef, null)
  if (!usingRoving.value) emitRefChanged('list-container-ref-changed', null)
})
function onFilter(event: Event) {
  const text = (event.target as HTMLInputElement).value
  ownFilterValue.value = text
  emit('filter-change', text, event)
  emit('update:filterValue', text)
  void nextTick(() => { if (input.value && input.value.value !== value.value) input.value.value = value.value })
}
function getInputLabel() {
  const element = input.value
  if (!element) return undefined
  const ids = element.getAttribute('aria-labelledby')?.split(/\s+/)
  const labelledBy = ids?.map(id => element.ownerDocument.getElementById(id)?.textContent?.trim()).filter(Boolean).join(' ')
  return labelledBy || element.getAttribute('aria-label') || Array.from(element.labels ?? []).map(label => label.textContent?.trim()).filter(Boolean).join(' ') || undefined
}
async function announceText(text: string, region: Element | null | undefined, enabled: boolean) {
  if (!enabled) return
  const { announce } = await import('@primer/live-region-element')
  await announce(text, { delayMs: 500, from: region as HTMLElement | undefined })
}
function announceResults(onFocus = false) {
  const region = document.querySelector('live-region')
  const items = props.items
  const enabled = props.announcementsEnabled
  if (!onFocus) region?.clear()
  if (!onFocus && !props.items.length && !props.loading) {
    void announceText(`${props.messageText?.title}. ${props.messageText?.description}`, undefined, enabled)
  } else if (usingRoving.value) {
    void announceText(`${items.length} item${items.length > 1 ? 's' : ''} available, ${items.filter(item => item.selected).length} selected.`, region, enabled)
  } else {
    const announceActive = () => {
      const element = list.value?.querySelector('[data-is-active-descendant]')
      if (!element?.textContent || !list.value) return
      const index = Array.from(list.value.querySelectorAll('[role="option"]')).indexOf(element)
      const item = items[index]
      const label = getInputLabel()
      const prefix = onFocus ? label ? `${label}, filter text box and list of items` : 'Focus on filter text box and list of items' : 'List updated'
      void announceText([prefix, `Focused item: ${item?.text}`, item?.selected ? 'selected' : 'not selected', `${index + 1} of ${items.length}`].join(', '), region, enabled)
    }
    if (onFocus) setTimeout(announceActive)
    else requestAnimationFrame(announceActive)
  }
}
watch(() => JSON.stringify({ items: props.items.map((item, index) => [item.id ?? item.text ?? index, item.text, item.selected]), loading: props.loading, message: props.messageText, filterValue: value.value }), () => announceResults(), { flush: 'post' })
function onActive(current: HTMLElement | undefined, previous: HTMLElement | undefined, directlyActivated: boolean) {
  active.value = current
  if (!usingRoving.value && virtualized.value && current) {
    const index = current.getAttribute('data-index')
    const range = virtualizer.value.range
    if (index !== null && range && (Number(index) < range.startIndex || Number(index) >= range.endIndex)) {
      virtualizer.value.scrollToIndex(Number(index), { align: 'auto' })
    }
  }
  if (current && scrollContainer.value && (directlyActivated || props.focusPrependedElements)) {
    scrollIntoView(current, scrollContainer.value, { startMargin: 0, endMargin: 8, behavior: props.scrollBehavior })
  }
  if (!usingRoving.value) emit('active-descendant-changed', current, previous, directlyActivated)
}
useFocusZone(() => ({
  containerRef: list, activeDescendantFocus: usingRoving.value ? false : input,
  bindKeys: FocusKeys.ArrowVertical | FocusKeys.PageUpDown | (usingRoving.value ? FocusKeys.HomeAndEnd : 0),
  focusOutBehavior: usingRoving.value ? 'wrap' : virtualized.value ? 'stop' : props.focusOutBehavior,
  focusableElementFilter: element => !(element instanceof HTMLInputElement),
  onActiveDescendantChanged: onActive, focusInStrategy: usingRoving.value ? 'previous' : props.setInitialFocus ? 'initial' : 'previous',
  ignoreHoverEvents: props.disableSelectOnHover, focusPrependedElements: usingRoving.value ? false : props.focusPrependedElements
}))
watch(() => [props.items, props.scrollBehavior] as const, () => {
  if (active.value && scrollContainer.value) {
    scrollIntoView(active.value, scrollContainer.value, { startMargin: 0, endMargin: 8, behavior: props.scrollBehavior })
  }
}, { flush: 'post' })
function activate(item: ItemInput | undefined, event: MouseEvent | KeyboardEvent) {
  if (!item || item.disabled || item.inactiveText || item.loading) return
  item.onAction?.(item, event)
}
function inputFocus() {
  focused.value = usingRoving.value
  announceResults(true)
}
function inputKeydown(event: KeyboardEvent) {
  if (!usingRoving.value) return
  if (event.key === 'Enter') {
    // Like the source, this bypasses ActionList.Item's disabled/loading checks.
    const item = selectableItems.value[0]!
    if (item.onAction) { item.onAction(item, event); event.preventDefault() }
  } else if (event.key === 'ArrowDown' && list.value) {
    list.value.querySelector<HTMLElement>('[role="option"]')?.focus()
    event.preventDefault()
  }
}
function inputKeypress(event: KeyboardEvent) {
  if (event.key !== 'Enter' || !active.value) return
  event.preventDefault()
  event.stopImmediatePropagation()
  active.value.dispatchEvent(new KeyboardEvent(event.type, event))
}
function renderVisual(value: Visual | undefined): VNodeChild {
  if (value === undefined) return null
  return typeof value === 'function' || (typeof value === 'object' && value !== null && !isVNode(value) && !Array.isArray(value))
    ? h(value as Component) : value as VNodeChild
}
function renderItem(item: ItemInput, index: number, start?: number): VNodeChild {
  const id = `${listId.value}-item-${item.id ?? index}`
  const labelId = `${id}--label`
  const descriptionId = item.description ? `${id}--${item.descriptionVariant ?? 'inline'}-description` : undefined
  const inactiveId = item.inactiveText ? `${id}--warning-message` : undefined
  const trailing = item.trailingVisual ?? (item.trailingIcon || item.trailingText ? [item.trailingText, renderVisual(item.trailingIcon)] : undefined)
  const trailingId = trailing ? `${id}--trailing-visual` : undefined
  const style = normalizeReactStyle('style' in item ? item.style : start === undefined ? undefined :
    { position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${start}px)` })
  const { key: _key, ...itemProps } = item
  const mapped = {
    className: ['filtered-action-list__item', 'className' in item ? item.className : undefined].filter(Boolean).join(' ') || undefined,
    'data-input-focused': focused.value ? '' : undefined,
    'data-first-child': index === 0 ? '' : undefined,
    ...(start !== undefined ? { 'data-index': index, style } : {}),
    ...itemProps, renderItem: props.renderItem
  }
  const { id: _consumedId, style: _consumedStyle, ...consumerProps } = itemProps
  const common = {
    onClick: (event: MouseEvent) => activate(mapped, event),
    onKeypress: (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') { activate(mapped, event); if (event.key === ' ') event.preventDefault() }
    },
    'aria-disabled': item.disabled || undefined,
    'data-inactive': Boolean(item.inactiveText) || undefined,
    'data-loading': item.loading && !item.inactiveText || undefined,
    tabindex: 0,
    'aria-labelledby': [labelId, trailingId].filter(Boolean).join(' '),
    'aria-describedby': [descriptionId, inactiveId].filter(Boolean).join(' ') || undefined,
    'aria-selected': item.selected,
    role: item.role ?? 'option',
    id,
    // FAL 显式属性层（{...item} 之前）：
    'data-input-focused': focused.value ? '' : undefined,
    'data-first-child': index === 0 ? '' : undefined,
    'data-index': virtualized.value ? index : undefined,
    'data-id': item.id,
    style,
    // 消费者 item 属性（后置获胜）：
    ...consumerProps,
    // li 显式属性层（恒胜）：
    'data-component': 'ActionList.Item',
    'data-is-disabled': item.disabled || undefined,
    'data-has-description': Boolean(item.description),
    class: ['filtered-action-list__item', mapped.className],
    onFocus: () => {
      if (usingRoving.value) focused.value = false
    },
  }
  // MappedActionListItem receives renderItem after spreading each item. Group
  // renderers and item renderers are therefore replaced, even by undefined.
  if (props.renderItem) return props.renderItem(mapped)
  const { text: _text, description: _description, descriptionVariant: _descriptionVariant,
    leadingVisual: _leadingVisual, trailingVisual: _trailingVisual, trailingIcon: _trailingIcon,
    trailingText: _trailingText, children: _children, renderItem: _renderItem, onAction: _onAction,
    groupId: _groupId, selected: _selected, disabled: _disabled, inactiveText: _inactiveText, loading: _loading, size: _size, item: _item, className: _className,
    variant: itemVariant,
    ...domProps } = common
  const children: VNodeChild[] = [h('span', { class: 'filtered-action-list__spacer' })]
  if (selectionVariant.value) children.push(h('span', { 'data-component': 'ActionList.Selection', class: 'filtered-action-list__selection filtered-action-list__visual' }, [
    selectionVariant.value === 'radio' ? h(Radio, { checked: item.selected, value: 'unused', ariaHidden: true, 'aria-hidden': 'true', tabindex: -1 })
      : selectionVariant.value === 'multiple' ? h('div', { class: 'filtered-action-list__checkbox' })
      : h(CheckIcon, { class: 'filtered-action-list__checkmark', 'data-component': 'Octicon' })
  ]))
  else if (item.selected && import.meta.env.DEV) console.warn('FilteredActionList: For Item to be selected, ActionList or ActionList.Group should have a selectionVariant defined.')
  if (item.leadingVisual) children.push(h('span', { class: 'filtered-action-list__visual filtered-action-list__leading', 'data-component': 'ActionList.LeadingVisual' }, [
    item.loading ? h(Spinner, { size: 'small' }) : renderVisual(item.leadingVisual)
  ]))
  const content: VNodeChild[] = []
  const label = h('span', { id: labelId, class: 'filtered-action-list__label', 'data-component': 'ActionList.Item.Label' }, [item.children, item.text, item.loading === true && !item.inactiveText ? h('span', { class: 'filtered-action-list__loading-label' }, 'Loading') : null])
  content.push(item.description ? h('div', { class: 'filtered-action-list__description-wrap', 'data-description-variant': item.descriptionVariant ?? 'inline' }, [
    label, h('span', { id: descriptionId, class: 'filtered-action-list__description', 'data-component': 'ActionList.Description' }, item.description)
  ]) : label)
  if (item.loading && !item.leadingVisual || trailing) content.push(h('span', { id: trailingId, class: 'filtered-action-list__trailing filtered-action-list__visual', 'data-component': 'ActionList.TrailingVisual' }, [
    item.loading && !item.leadingVisual ? h(Spinner, { size: 'small' }) : renderVisual(trailing)
  ]))
  if (inactiveId) content.push(h('span', { id: inactiveId, class: 'filtered-action-list__inactive' }, item.inactiveText))
  children.push(h('span', { class: 'filtered-action-list__content', 'data-component': 'ActionList.Item--DividerContainer' }, content))
  return h('li', { ...domProps, key: item.key ?? item.id ?? index, 'data-variant': itemVariant === 'danger' ? itemVariant : undefined,
    ref: virtualized.value ? (element: unknown) => { if (element instanceof HTMLElement) virtualizer.value.measureElement(element) } : undefined
  }, [h('div', { class: 'filtered-action-list__row', 'data-size': item.size ?? 'medium' }, children)])
}
const RenderItems = () => {
  if (props.groupMetadata?.length) return props.groupMetadata.map((group, index) => {
    const children = props.items.filter(item => item.groupId === group.groupId).map(item => renderItem(item, selectableItems.value.indexOf(item)))
    const title = group.header?.title
    const ariaLabel = title ? (typeof title === 'string' ? title : '[object Object]') : `Group ${group.groupId}`
    return h('li', { role: 'none', 'data-component': 'ActionList.Group', key: index, class: 'filtered-action-list__group' }, [
      h('div', { role: 'presentation', 'aria-hidden': 'true', class: 'filtered-action-list__group-heading', 'data-component': 'GroupHeadingWrap', 'data-variant': group.header?.variant ?? 'subtle' }, [h('span', { class: 'filtered-action-list__group-heading-title', id: `${listId.value}-group-${group.groupId}` }, [title || `Group ${group.groupId}`])]),
      h('ul', { role: 'group', class: 'filtered-action-list__group-list', 'aria-label': ariaLabel }, children)
    ])
  })
  return entries.value.map(({ item, index, start }) => renderItem(item, index, start))
}
const RenderMessage = () => props.message
const listRestProps = computed(() => {
  const { as: _as, variant: _variant, selectionVariant: _selectionVariant, showDividers: _showDividers,
    role: _role, disableFocusZone: _disableFocusZone, disableItemGap: _disableItemGap, className: _className,
    ...rest } = (props.actionListProps ?? {}) as Record<string, unknown>
  return rest
})
defineExpose({ element: root, input, list, scrollContainer, focus: () => input.value?.focus() })
</script>
<template>
  <div
    ref="root"
    :class="[className, 'filtered-action-list']"
    data-component="FilteredActionList"
    data-testid="filtered-action-list"
  >
    <FilteredActionListInput
      :value="value"
      :input-ref="setInput"
      :placeholder-text="placeholderText"
      :list-id="listId"
      :input-description-text-id="descriptionId"
      :loading="loading && !loadingType.appearsInBody"
      :full-screen-on-narrow="fullScreenOnNarrow"
      v-bind="textInputProps"
      @input-change="onFilter"
      @input-key-down="inputKeydown"
      @input-key-press="inputKeypress"
      @input-focus="inputFocus"
      @blur="focused = false"
    />
    <span
      :id="descriptionId"
      class="filtered-action-list__visually-hidden"
    >Items will be filtered as you type</span>
    <div
      v-if="showSelectAllControl"
      class="filtered-action-list__select-all"
      data-component="FilteredActionList.SelectAll"
    >
      <Checkbox
        id="select-all-checkbox"
        class="filtered-action-list__select-all-checkbox"
        data-component="FilteredActionList.SelectAllCheckbox"
        :checked="selectAllChecked"
        :indeterminate="selectAllMixed"
        :aria-checked="selectAllMixed ? 'mixed' : selectAllChecked"
        @change="emit('select-all-change', ($event.target as HTMLInputElement).checked)"
      /><label
        class="filtered-action-list__select-all-label"
        for="select-all-checkbox"
        data-component="FilteredActionList.SelectAllLabel"
      >{{ selectAllChecked ? 'Deselect all' : 'Select all' }}</label>
    </div>
    <div
      ref="scrollContainer"
      class="filtered-action-list__scroll"
      data-component="FilteredActionList.ScrollContainer"
    >
      <BodyLoader
        v-if="loading && scrollContainer && loadingType.appearsInBody"
        :loading-type="loadingType"
        :height="scrollContainer?.clientHeight ?? 0"
      />
      <RenderMessage v-else-if="message" />
      <ul
        v-else
        v-bind="{ ...attrs, ...listRestProps }"
        :id="listId"
        ref="list"
        :class="['filtered-action-list__list', actionListProps?.className]"
        :data-variant="listVariant"
        :data-dividers="(actionListProps && 'showDividers' in actionListProps ? actionListProps.showDividers : showItemDividers) ? 'true' : 'false'"
        :data-mixed-descriptions="mixedDescriptions || undefined"
        data-component="ActionList"
        role="listbox"
        :aria-label="listLabel"
        :style="virtualized ? [normalizeReactStyle(actionListProps?.style), { height: `${virtualizer.getTotalSize()}px`, position: 'relative' }] : normalizeReactStyle(actionListProps?.style)"
      >
        <RenderItems />
      </ul>
    </div>
  </div>
</template>
<style src="./FilteredActionList.css" />
