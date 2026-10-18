<script setup lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  isVNode,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  shallowRef,
  useAttrs,
  useId,
  watch,
  type Component,
  type VNodeChild,
  useCssModule,
} from 'vue'
import { focusZone, scrollIntoView, FocusKeys } from '@primer/behaviors'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { useFocusZone, type FocusZoneHookSettings } from '../composables/useFocusZone'
import { useFeatureFlag } from '../FeatureFlags'
import { Checkbox } from '../Checkbox'
import { ActionList } from '../ActionList'
import { ActionListContainerContext } from '../ActionList/context'
import { assignElementRef } from '../internal/assignElementRef'
import { normalizeReactStyle } from '../internal/style'
import FilteredActionListInput from './FilteredActionListInput.vue'
import BodyLoader from './FilteredActionListBodyLoader.vue'
import {
  FilteredActionListLoadingTypes,
  type FilteredActionListProps,
  type ItemInput,
  type Visual,
} from './types'
defineOptions({ name: 'FilteredActionList', inheritAttrs: false })
const styles = useCssModule()
const props = withDefaults(defineProps<FilteredActionListProps>(), {
  loading: false,
  loadingType: () => FilteredActionListLoadingTypes.bodySpinner,
  filterValue: undefined,
  variant: 'inset',
  focusOutBehavior: 'wrap',
  _PrivateFocusManagement: 'active-descendant',
  announcementsEnabled: true,
  disableSelectOnHover: false,
  setInitialFocus: false,
  virtualized: false,
  fullScreenOnNarrow: false,
  showSelectAll: undefined,
  focusPrependedElements: false,
})
const emit = defineEmits<{
  'update:filterValue': [value: string]
  'filter-change': [value: string, event: Event | null]
  'select-all-change': [checked: boolean]
  'active-descendant-changed': [
    current: HTMLElement | undefined,
    previous: HTMLElement | undefined,
    directlyActivated: boolean,
  ]
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
const listLabel = computed(() =>
  props.actionListProps && 'aria-label' in props.actionListProps
    ? props.actionListProps['aria-label']
    : (props['aria-label'] ?? (attrs['aria-label'] as string | undefined)),
)
const descriptionId = `${generatedId}-description`
const active = shallowRef<HTMLElement>()
let rememberedVirtualElement: HTMLElement | undefined
let rememberedVirtualKey: string | undefined
const focused = shallowRef(false)
const usingRoving = computed(() => props._PrivateFocusManagement === 'roving-tabindex')
const virtualized = computed(() => props.virtualized && !props.groupMetadata?.length)
const mergedRefs = useFeatureFlag('primer_react_merged_forwarded_refs')
const selectableItems = computed(() =>
  props.groupMetadata?.length
    ? props.groupMetadata.flatMap((group) =>
        props.items.filter((item) => item.groupId === group.groupId),
      )
    : props.items,
)
const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.items.length,
    getScrollElement: () => scrollContainer.value,
    estimateSize: () => 32,
    overscan: 10,
    enabled: virtualized.value,
    getItemKey: (index: number) =>
      props.items[index]?.key ?? props.items[index]?.id?.toString() ?? index.toString(),
    measureElement: (element: Element) => (element as HTMLElement).scrollHeight,
  })),
)
const entries = computed(() =>
  virtualized.value
    ? virtualizer.value.getVirtualItems().map((entry) => ({
        item: props.items[entry.index]!,
        index: entry.index,
        start: entry.start,
      }))
    : props.items.map((item, index) => ({ item, index, start: undefined })),
)
const selectAllChecked = computed(
  () => props.items.length > 0 && props.items.every((item) => item.selected),
)
const selectAllMixed = computed(
  () => !selectAllChecked.value && props.items.some((item) => item.selected),
)
const showSelectAllControl = computed(() => props.showSelectAll ?? !!props.onSelectAllChange)
watch(
  () => props.virtualized && !!props.groupMetadata?.length,
  (enabled) => {
    if (enabled && import.meta.env.DEV)
      console.warn(
        'FilteredActionList: `virtualized` has no effect when `groupMetadata` is provided. Grouped lists are rendered without virtualization.',
      )
  },
  { immediate: true },
)
function setInput(element: HTMLInputElement | null) {
  input.value = element
  assignElementRef(props.inputRef, element)
  emitRefChanged('input-ref-changed', element)
}
watch(scrollContainer, (element) => assignElementRef(props.scrollContainerRef, element))
watch(
  () => props.inputRef,
  (current, previous) => {
    assignElementRef(previous, null)
    assignElementRef(current, input.value)
  },
  { flush: 'post' },
)
watch(
  () => props.scrollContainerRef,
  (current, previous) => {
    assignElementRef(previous, null)
    assignElementRef(current, scrollContainer.value)
  },
  { flush: 'post' },
)
watch(
  list,
  (element) => {
    if (!usingRoving.value) emitRefChanged('list-container-ref-changed', element)
  },
  { flush: 'post' },
)
watch(
  () => props.onInputRefChanged,
  () => emitRefChanged('input-ref-changed', input.value),
  { flush: 'post' },
)
watch(
  () => props.onListContainerRefChanged,
  (_next, previous) => {
    if (usingRoving.value) return
    previous?.(null)
    emitRefChanged('list-container-ref-changed', list.value)
  },
  { flush: 'post' },
)
onBeforeUnmount(() => {
  setInput(null)
  assignElementRef(props.scrollContainerRef, null)
  if (!usingRoving.value) emitRefChanged('list-container-ref-changed', null)
})
function onFilter(event: Event) {
  const text = (event.target as HTMLInputElement).value
  emit('filter-change', text, event)
  ownFilterValue.value = text
  emit('update:filterValue', text)
  void nextTick(() => {
    if (input.value && input.value.value !== value.value) input.value.value = value.value
  })
}
function getInputLabel() {
  const element = input.value
  if (!element) return undefined
  const ids = element.getAttribute('aria-labelledby')?.split(/\s+/)
  const labelledBy = ids
    ?.map((id) => element.ownerDocument.getElementById(id)?.textContent?.trim())
    .filter(Boolean)
    .join(' ')
  return (
    labelledBy ||
    element.getAttribute('aria-label') ||
    Array.from(element.labels ?? [])
      .map((label) => label.textContent?.trim())
      .filter(Boolean)
      .join(' ') ||
    undefined
  )
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
    void announceText(
      `${props.messageText?.title}. ${props.messageText?.description}`,
      undefined,
      enabled,
    )
  } else if (usingRoving.value) {
    void announceText(
      `${items.length} item${items.length > 1 ? 's' : ''} available, ${items.filter((item) => item.selected).length} selected.`,
      region,
      enabled,
    )
  } else {
    const announceActive = () => {
      const element = list.value?.querySelector('[data-is-active-descendant]')
      if (!element?.textContent || !list.value) return
      const index = Array.from(list.value.querySelectorAll('[role="option"]')).indexOf(element)
      const item = items[index]
      const label = getInputLabel()
      const prefix = onFocus
        ? label
          ? `${label}, filter text box and list of items`
          : 'Focus on filter text box and list of items'
        : 'List updated'
      void announceText(
        [
          prefix,
          `Focused item: ${item?.text}`,
          item?.selected ? 'selected' : 'not selected',
          `${index + 1} of ${items.length}`,
        ].join(', '),
        region,
        enabled,
      )
    }
    if (onFocus) setTimeout(announceActive)
    else requestAnimationFrame(announceActive)
  }
}
watch(
  () =>
    JSON.stringify({
      items: props.items.map((item, index) => [
        item.id ?? item.text ?? index,
        item.text,
        item.selected,
      ]),
      loading: props.loading,
      message: props.messageText,
      filterValue: value.value,
    }),
  () => announceResults(),
  { flush: 'post' },
)
function rememberVirtualFocus(element: HTMLElement) {
  const index = element.getAttribute('data-index')
  const item = index === null ? undefined : props.items[Number(index)]
  if (item) {
    rememberedVirtualElement = element
    rememberedVirtualKey = String(item.key ?? item.id ?? index)
  }
}
function onActive(
  current: HTMLElement | undefined,
  previous: HTMLElement | undefined,
  directlyActivated: boolean,
) {
  if (rebuildingVirtualZone) return
  activeWasDirectlyActivated = directlyActivated
  active.value = current
  if (virtualized.value && current) rememberVirtualFocus(current)
  if (!usingRoving.value && virtualized.value && current) {
    const index = current.getAttribute('data-index')
    const range = virtualizer.value.range
    if (
      index !== null &&
      range &&
      (Number(index) < range.startIndex || Number(index) >= range.endIndex)
    ) {
      virtualizer.value.scrollToIndex(Number(index), { align: 'auto' })
    }
  }
  if (current && scrollContainer.value && (directlyActivated || props.focusPrependedElements)) {
    scrollIntoView(current, scrollContainer.value, {
      startMargin: 0,
      endMargin: 8,
      behavior: props.scrollBehavior,
    })
  }
  if (!usingRoving.value) emit('active-descendant-changed', current, previous, directlyActivated)
}
function focusZoneSettings(): FocusZoneHookSettings {
  return {
    containerRef: list,
    activeDescendantFocus: usingRoving.value ? false : input,
    bindKeys:
      FocusKeys.ArrowVertical |
      FocusKeys.PageUpDown |
      (usingRoving.value ? FocusKeys.HomeAndEnd : 0),
    focusOutBehavior: usingRoving.value
      ? 'wrap'
      : virtualized.value
        ? 'stop'
        : props.focusOutBehavior,
    focusableElementFilter: (element) => !(element instanceof HTMLInputElement),
    onActiveDescendantChanged: onActive,
    focusInStrategy: usingRoving.value
      ? 'previous'
      : props.setInitialFocus
        ? 'initial'
        : 'previous',
    ignoreHoverEvents: props.disableSelectOnHover,
    focusPrependedElements: usingRoving.value ? false : props.focusPrependedElements,
  }
}
useFocusZone(() => ({ ...focusZoneSettings(), disabled: usingRoving.value || virtualized.value }))
let rebuildingVirtualZone = false
let activeWasDirectlyActivated = false
watch(
  () => ({
    enabled: virtualized.value,
    list: list.value,
    input: input.value,
    entries: entries.value.map(({ item, index }) => ({
      key: String(item.key ?? item.id ?? index),
      index,
    })),
    settings: focusZoneSettings(),
  }),
  (current, previous, onCleanup) => {
    if (!current.enabled || !current.list || !current.input) {
      rebuildingVirtualZone = false
      return
    }
    const priorAnnounced = usingRoving.value
      ? document.activeElement instanceof HTMLElement &&
        current.list.contains(document.activeElement)
        ? document.activeElement
        : undefined
      : active.value
    const priorActive = priorAnnounced ?? rememberedVirtualElement
    const priorDirect = activeWasDirectlyActivated
    const priorIndex = priorActive?.getAttribute('data-index')
    const priorKey =
      rememberedVirtualKey ??
      previous?.entries.find((entry) => String(entry.index) === priorIndex)?.key
    const keys = new Set(current.entries.map((entry) => entry.key))
    const desiredKey = props.focusPrependedElements
      ? current.entries[0]?.key
      : priorKey && keys.has(priorKey)
        ? priorKey
        : (previous?.entries.find((entry) => keys.has(entry.key))?.key ?? current.entries[0]?.key)
    const desiredIndex = current.entries.find((entry) => entry.key === desiredKey)?.index
    const desired =
      current.list.querySelector<HTMLElement>(`[data-index="${desiredIndex}"]`) ?? undefined
    if (priorActive || !props.setInitialFocus) {
      rememberedVirtualElement = desired
      rememberedVirtualKey = desiredKey
    }
    let restored: HTMLElement | undefined
    rebuildingVirtualZone = true
    // Vue inserts keyed additions in reverse mutation order. Re-read the completed
    // DOM instead of giving behaviors an unsorted batch of added elements. Preserve
    // its remove-before-add choice of the active item when a window changes.
    const controller = focusZone(current.list, {
      ...current.settings,
      activeDescendantControl: usingRoving.value ? undefined : current.input,
      focusInStrategy: priorActive
        ? () => {
            const remembered = rememberedVirtualElement
            return remembered && current.list!.contains(remembered) ? remembered : desired
          }
        : current.settings.focusInStrategy,
      onActiveDescendantChanged: (element, previous, directlyActivated) => {
        if (rebuildingVirtualZone) restored = element
        else onActive(element, previous, directlyActivated)
      },
    })
    rebuildingVirtualZone = false
    if (!usingRoving.value) {
      if (restored === priorAnnounced && restored && priorDirect) {
        restored.setAttribute('data-is-active-descendant', 'activated-directly')
      } else if (restored !== priorAnnounced) onActive(restored, priorAnnounced, false)
    }
    onCleanup(() => {
      rebuildingVirtualZone = true
      controller.abort()
    })
  },
  { flush: 'post' },
)

watch(
  () => [props.items, props.scrollBehavior] as const,
  () => {
    if (active.value && scrollContainer.value) {
      scrollIntoView(active.value, scrollContainer.value, {
        startMargin: 0,
        endMargin: 8,
        behavior: props.scrollBehavior,
      })
    }
  },
  { flush: 'post' },
)
function focusIn(event: FocusEvent) {
  if (
    virtualized.value &&
    event.target instanceof HTMLElement &&
    list.value?.contains(event.target)
  )
    rememberVirtualFocus(event.target)
  if (
    usingRoving.value &&
    (event.target === input.value || list.value?.contains(event.target as Node))
  )
    focused.value = document.activeElement === input.value
}
watch(
  () => [props.loading, usingRoving.value],
  () => {
    if (usingRoving.value && !props.loading) focused.value = document.activeElement === input.value
  },
  { flush: 'post' },
)
function inputFocus() {
  focused.value = usingRoving.value
  announceResults(true)
}
function inputKeydown(event: KeyboardEvent) {
  if (!usingRoving.value) return
  if (event.key === 'Enter') {
    // Like the source, this bypasses ActionList.Item's disabled/loading checks.
    const item = selectableItems.value[0]!
    if (item.onAction) {
      item.onAction(item, event)
      event.preventDefault()
    }
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
  return typeof value === 'function' ||
    (typeof value === 'object' && value !== null && !isVNode(value) && !Array.isArray(value))
    ? h(value as Component)
    : (value as VNodeChild)
}
function renderChildren(children: VNodeChild): VNodeChild[] {
  return Array.isArray(children) ? children.flatMap(renderChildren) : [children]
}
function renderItem(item: ItemInput, index: number, start?: number): VNodeChild {
  const { key, ...itemProps } = item
  const mapped = {
    className: [styles['filtered-action-list__item'], item.className].filter(Boolean).join(' '),
    'data-input-focused': focused.value ? '' : undefined,
    'data-first-child': index === 0 ? '' : undefined,
    ...(start === undefined
      ? {}
      : {
          'data-index': index,
          style: {
            position: 'absolute' as const,
            left: 0,
            right: 0,
            top: 0,
            transform: `translateY(${start}px)`,
          },
        }),
    ...itemProps,
    renderItem: props.renderItem,
  }
  if (props.renderItem) return props.renderItem(mapped)
  const {
    id,
    description,
    descriptionVariant,
    text,
    trailingVisual,
    leadingVisual,
    trailingText,
    trailingIcon,
    onAction,
    children,
    ...rest
  } = mapped
  return h(
    ActionList.Item as Component,
    {
      role: 'option',
      onSelect: (event: MouseEvent | KeyboardEvent) => onAction?.(mapped, event),
      'data-id': id,
      ...rest,
      key: key ?? id ?? index,
      ref: virtualized.value
        ? (node: unknown) => {
            const element = (node as { element?: HTMLElement } | null)?.element
            if (element) virtualizer.value.measureElement(element)
          }
        : undefined,
    },
    {
      default: () => [
        leadingVisual
          ? h(ActionList.LeadingVisual, null, { default: () => renderVisual(leadingVisual) })
          : null,
        ...renderChildren(children),
        text,
        description
          ? h(
              ActionList.Description,
              { variant: descriptionVariant },
              { default: () => description },
            )
          : null,
        trailingVisual
          ? h(ActionList.TrailingVisual, null, { default: () => renderVisual(trailingVisual) })
          : trailingIcon || trailingText
            ? h(ActionList.TrailingVisual, null, {
                default: () => [trailingText, renderVisual(trailingIcon)],
              })
            : null,
      ],
    },
  )
}
function renderItems() {
  if (props.groupMetadata?.length)
    return props.groupMetadata.map((group, index) =>
      h(
        ActionList.Group,
        { key: index },
        {
          default: () => [
            h(
              ActionList.GroupHeading,
              { variant: group.header?.variant },
              {
                default: () => group.header?.title || `Group ${group.groupId}`,
              },
            ),
            ...props.items
              .filter((item) => item.groupId === group.groupId)
              .map((item) => renderItem(item, selectableItems.value.indexOf(item))),
          ],
        },
      ),
    )
  return entries.value.map(({ item, index, start }) => renderItem(item, index, start))
}
function setList(node: unknown) {
  list.value = (node as { element?: HTMLElement | null } | null)?.element ?? null
}
function syncSourceRefBehavior() {
  // With its callback ref, the source's legacy List cannot read its own DOM ref.
  if (!usingRoving.value && !mergedRefs.value)
    list.value?.removeAttribute('data-mixed-descriptions')
}
const ListContext = defineComponent({
  name: 'FilteredActionListContext',
  setup(_props, { slots }) {
    if (usingRoving.value)
      provide(
        ActionListContainerContext,
        reactive({
          container: 'FilteredActionList',
          listRole: 'listbox' as const,
          selectionAttribute: 'aria-selected' as const,
          get selectionVariant() {
            return props.selectionVariant
          },
          get enableFocusZone() {
            return !virtualized.value
          },
        }),
      )
    return () => slots.default?.()
  },
})
const RenderList = () =>
  h(
    ActionList as Component,
    {
      showDividers: props.showItemDividers,
      selectionVariant: props.selectionVariant,
      ...attrs,
      variant: props.variant,
      'aria-label': listLabel.value,
      ...props.actionListProps,
      role: 'listbox',
      id: listId.value,
      ref: setList,
      disableFocusZone: !usingRoving.value || props.actionListProps?.disableFocusZone,
      className: [styles['filtered-action-list__list'], props.actionListProps?.className]
        .filter(Boolean)
        .join(' '),
      style: virtualized.value
        ? [
            normalizeReactStyle(props.actionListProps?.style),
            { height: `${virtualizer.value.getTotalSize()}px`, position: 'relative' },
          ]
        : normalizeReactStyle(props.actionListProps?.style),
      onVnodeMounted: syncSourceRefBehavior,
      onVnodeUpdated: syncSourceRefBehavior,
    },
    { default: renderItems },
  )
const RenderMessage = () => props.message
onMounted(() => {
  const element = scrollContainer.value
  if (!element) return
  const frame = requestAnimationFrame(() => {
    const current = element.scrollTop
    element.scrollTop = current < 1 ? current + 1 : current - 1
    element.scrollTop = current
  })
  onBeforeUnmount(() => cancelAnimationFrame(frame))
})
defineExpose({ element: root, input, list, scrollContainer, focus: () => input.value?.focus() })
</script>
<template>
  <div
    ref="root"
    :class="[className, $style['filtered-action-list']]"
    data-component="FilteredActionList"
    data-testid="filtered-action-list"
    @focusin="focusIn"
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
    />
    <span :id="descriptionId" :class="$style['filtered-action-list__visually-hidden']"
      >Items will be filtered as you type</span
    >
    <div
      v-if="showSelectAllControl"
      :class="$style['filtered-action-list__select-all']"
      data-component="FilteredActionList.SelectAll"
    >
      <Checkbox
        id="select-all-checkbox"
        :class="$style['filtered-action-list__select-all-checkbox']"
        data-component="FilteredActionList.SelectAllCheckbox"
        :checked="selectAllChecked"
        :indeterminate="selectAllMixed"
        :aria-checked="selectAllMixed ? 'mixed' : selectAllChecked"
        @change="emit('select-all-change', ($event.target as HTMLInputElement).checked)"
      /><label
        :class="$style['filtered-action-list__select-all-label']"
        for="select-all-checkbox"
        data-component="FilteredActionList.SelectAllLabel"
        >{{ selectAllChecked ? 'Deselect all' : 'Select all' }}</label
      >
    </div>
    <div
      ref="scrollContainer"
      :class="$style['filtered-action-list__scroll']"
      data-component="FilteredActionList.ScrollContainer"
    >
      <BodyLoader
        v-if="loading && scrollContainer && loadingType.appearsInBody"
        :loading-type="loadingType"
        :height="scrollContainer?.clientHeight ?? 0"
      />
      <RenderMessage v-else-if="message" />
      <ListContext v-else :key="_PrivateFocusManagement"><RenderList /></ListContext>
    </div>
  </div>
</template>
<style module src="./FilteredActionList.module.css" />
