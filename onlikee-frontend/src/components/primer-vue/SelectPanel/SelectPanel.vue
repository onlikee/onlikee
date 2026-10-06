<script setup lang="ts">
import { computed, getCurrentInstance, h, nextTick, onBeforeUnmount, onMounted, shallowRef, toRaw, useAttrs, useId, useSlots, watch, type ComponentPublicInstance, type VNodeChild } from 'vue'
import Button from './SelectPanelButton.vue'
import { useFormControlContext } from '../FormControl/context'
import { useFeatureFlag } from '../FeatureFlags'
import FilteredActionList from '../FilteredActionList/FilteredActionList.vue'
import { FilteredActionListLoadingTypes, type ItemInput } from '../FilteredActionList/types'
import AnchoredOverlay from '../internal/components/AnchoredOverlay.vue'
import Message from './SelectPanelMessage.vue'
import type { SelectPanelComponentProps, SelectPanelGesture } from './types'
import type { AnchorRenderProps } from '../internal/components/overlayTypes'
import { renderNode } from '../internal/renderNode'
import TriangleDownIcon from '../../octicons-vue3/icons/triangle-down.vue'
import SearchIcon from '../../octicons-vue3/icons/search.vue'
import XIcon from '../../octicons-vue3/icons/x.vue'
import InfoIcon from '../../octicons-vue3/icons/info.vue'
import AlertIcon from '../../octicons-vue3/icons/alert.vue'
import StopIcon from '../../octicons-vue3/icons/stop.vue'
defineOptions({ name: 'SelectPanel', inheritAttrs: false, __SLOT__: Symbol('SelectPanel') })
const props = withDefaults(defineProps<SelectPanelComponentProps>(), {
  selected: undefined, title: undefined, subtitle: undefined, placeholderText: 'Filter items', inputLabel: undefined,
  filterValue: undefined, loading: undefined, variant: 'anchored', initialLoadingType: 'spinner',
  renderAnchor: undefined, showSelectedOptionsFirst: true, disableFullscreenOnNarrow: false,
  secondaryAction: undefined, footer: undefined,
  showSelectAll: false, disabled: undefined, required: undefined, width: undefined, height: undefined
})
const emit = defineEmits<{
  'update:open': [open: boolean]
  'open-change': [open: boolean, gesture: SelectPanelGesture]
  'update:selected': [selected: ItemInput | ItemInput[] | undefined]
  'selected-change': [selected: ItemInput | ItemInput[] | undefined]
  'update:filterValue': [value: string]
  'filter-change': [value: string, event: Event | null]
  cancel: []
  'active-descendant-changed': [current: HTMLElement | undefined, previous: HTMLElement | undefined, directlyActivated: boolean]
}>()
// Keep ref callbacks as reactive props: declaring them as emits makes Vue skip
// updates when only these listeners change. The instance still emits native events.
const emitRefChanged = getCurrentInstance()!.emit
const attrs = useAttrs()
const slots = useSlots()
const formControl = useFormControlContext()
const generatedId = useId()
const id = computed(() => props.id)
const titleId = `${generatedId}-title`
const noticeTitleId = `${generatedId}-notice-title`
const subtitleId = `${generatedId}-subtitle`
const multi = computed(() => Array.isArray(props.selected))
const singleModal = computed(() => !multi.value && props.variant === 'modal')
const title = computed(() => props.title === undefined ? (multi.value ? 'Select items' : 'Select an item') : props.title)
const innerFilter = shallowRef('')
const filter = computed(() => props.filterValue ?? innerFilter.value)
const intermediate = shallowRef<ItemInput>()
const sortSelection = shallowRef<ItemInput[]>([])
const input = shallowRef<HTMLInputElement | null>(null)
const list = shallowRef<HTMLElement | null>(null)
const ownAnchor = shallowRef<HTMLElement | null>(null)
const anchor = computed(() => props.anchorRef ?? ownAnchor)
const anchorSettings = computed(() => ({ anchorRef: anchor.value }))
const focusTrapSettings = { initialFocusRef: input }
const focusZoneSettings = { disabled: true }
const overlay = shallowRef<ComponentPublicInstance<{ element: HTMLElement | null }> | null>(null)
const filteredList = shallowRef<ComponentPublicInstance<{ input: HTMLInputElement | null; list: HTMLElement | null }> | null>(null)
const dataLoaded = shallowRef(false)
const internalLoading = shallowRef(false)
const mounted = shallowRef(false)
const noticeElement = shallowRef<HTMLElement | null>(null)
const narrow = shallowRef(false)
const availableHeight = shallowRef<number>()
const fullscreenFlag = useFeatureFlag('primer_react_select_panel_fullscreen_on_narrow')
const selectedFirstFlag = useFeatureFlag('primer_react_select_panel_order_selected_at_top')
const fullscreenEnabled = computed(() => fullscreenFlag.value && !props.disableFullscreenOnNarrow)
const fullscreen = computed(() => fullscreenEnabled.value && narrow.value)
const loading = computed(() => Boolean(props.loading || (internalLoading.value && !props.message)))
const loadingType = computed(() => dataLoaded.value ? FilteredActionListLoadingTypes.input : props.initialLoadingType === 'skeleton' ? FilteredActionListLoadingTypes.bodySkeleton : FilteredActionListLoadingTypes.bodySpinner)
const selectedItems = computed(() => Array.isArray(props.selected) ? props.selected : props.selected ? [props.selected] : [])
const sameReference = (first: ItemInput | undefined, second: ItemInput | undefined) => toRaw(first) === toRaw(second)
const equal = (first: ItemInput | undefined, second: ItemInput | undefined) => first?.id !== undefined ? first.id === second?.id : sameReference(first, second)
const includes = (items: ItemInput[], item: ItemInput) => items.some(selected => equal(selected, item))
const itemKey = (item: ItemInput) => item.id === undefined ? toRaw(item) : item.id
const selectedSet = computed(() => new Set(multi.value ? selectedItems.value.map(itemKey) : []))
const itemsInView = computed(() => new Set(props.items.map(itemKey)))
function resetSort() { sortSelection.value = [...selectedItems.value] }
function selectedChange(value: ItemInput | ItemInput[] | undefined) { emit('selected-change', value); emit('update:selected', value) }
function openChange(open: boolean, gesture: SelectPanelGesture) { emit('open-change', open, gesture); emit('update:open', open) }
function requestClose(gesture: SelectPanelGesture | 'close') {
  if (gesture === 'close' || (props.variant === 'modal' && gesture === 'click-outside')) emit('cancel')
  openChange(false, gesture === 'close' ? 'cancel' : gesture)
}
function cancel() { emit('cancel'); openChange(false, 'cancel') }
function save() {
  if (singleModal.value) selectedChange(intermediate.value)
  requestClose(props.variant === 'modal' ? 'selection' : 'click-outside')
}
const items = computed(() => {
  const sortSet = new Set(sortSelection.value.map(itemKey))
  return props.items.map(item => ({
    ...item, role: 'option',
    selected: 'selected' in item && item.selected === undefined ? undefined : multi.value
      ? selectedSet.value.has(itemKey(item)) : equal(singleModal.value ? intermediate.value : props.selected as ItemInput | undefined, item),
    onAction: (passed: ItemInput, event: MouseEvent | KeyboardEvent) => {
      item.onAction?.(passed, event)
      if (event.defaultPrevented) return
      if (multi.value) {
        const rest = selectedItems.value.filter(selected => !equal(selected, item))
        selectedChange(includes(selectedItems.value, item) ? rest : [...rest, item])
      } else if (singleModal.value) intermediate.value = intermediate.value?.id === item.id ? undefined : item
      else { selectedChange(sameReference(props.selected as ItemInput | undefined, item) ? undefined : item); requestClose('selection') }
    }
  })).sort((first, second) => selectedFirstFlag.value && props.showSelectedOptionsFirst
    ? Number(sortSet.has(itemKey(second))) - Number(sortSet.has(itemKey(first))) : 0)
})
let loadingTimer: ReturnType<typeof setTimeout> | undefined
const timers = new Set<ReturnType<typeof setTimeout>>()
function safeTimeout(callback: () => void, delay: number) {
  const timer = setTimeout(callback, delay)
  timers.add(timer)
  return timer
}
function clearLoadingTimer() {
  if (loadingTimer !== undefined) { clearTimeout(loadingTimer); timers.delete(loadingTimer) }
}
async function announceLoading() {
  const { announce } = await import('@primer/live-region-element')
  const region = document.querySelector('live-region')
  region?.clear()
  await announce('Loading.', { delayMs: 500, from: region ?? undefined })
}
function filterChange(value: string, event: Event | null) {
  if (props.loading === undefined) {
    clearLoadingTimer()
    if (dataLoaded.value) {
      loadingTimer = safeTimeout(() => { internalLoading.value = true; void announceLoading() }, 1000)
    } else {
      if (!props.items.length) internalLoading.value = true
      loadingTimer = safeTimeout(() => { void announceLoading() }, 1000)
    }
  }
  emit('filter-change', value, event)
  emit('update:filterValue', value)
  innerFilter.value = value
  if (!value) resetSort()
}
function selectAll(checked: boolean) {
  if (!multi.value) return
  const outsideView = selectedItems.value.filter(selected => !itemsInView.value.has(itemKey(selected)))
  selectedChange(checked ? [...outsideView, ...props.items] : outsideView)
}
function inputChanged(element: HTMLInputElement | null) {
  if (props.onInputRefChanged === undefined) input.value = element
  emitRefChanged('input-ref-changed', element)
}
function listChanged(element: HTMLElement | null) {
  if (props.onListContainerRefChanged === undefined) list.value = element
  emitRefChanged('list-container-ref-changed', element)
}
watch(() => props.onInputRefChanged, () => {
  if (filteredList.value) inputChanged(filteredList.value.input)
}, { flush: 'post' })
watch(() => props.onListContainerRefChanged, (_next, previous) => {
  if (!filteredList.value || props._PrivateFocusManagement === 'roving-tabindex') return
  if (previous) previous(null)
  else list.value = null
  listChanged(filteredList.value.list)
}, { flush: 'post' })
const message = computed(() => props.message ?? (!props.items.length ? { variant: 'empty' as const, title: 'No items available', body: '' } : undefined))
const autoLabel = computed(() => formControl?.isReferenced.value === false && Boolean(formControl.labelId.value) && Boolean(id.value))
const selectedValue = computed(() => selectedItems.value.length ? selectedItems.value.map(item => item.text).join(', ') : props.placeholder)
const RenderAnchor = (anchorProps: AnchorRenderProps): VNodeChild => {
  const children = autoLabel.value ? h('span', { id: `${id.value}-selected-value` }, selectedValue.value) : selectedValue.value
  const wired = { ...anchorProps,
    ...(autoLabel.value ? { 'aria-labelledby': `${formControl?.labelId.value} ${id.value}-selected-value` } : {}),
    children }
  if (props.renderAnchor) return props.renderAnchor(wired)
  const { children: _children, ...buttonProps } = wired
  return h(Button, { ...buttonProps, type: 'button', trailingAction: TriangleDownIcon }, { default: () => children })
}
const RenderTitle = () => renderNode(title.value)
const SearchVisual = () => h(SearchIcon, { 'data-component': 'Octicon' })
const RenderSubtitle = () => renderNode(props.subtitle)
const RenderFooter = () => renderNode(props.footer)
const RenderSecondary = () => renderNode(props.secondaryAction)
const RenderNotice = () => renderNode(props.notice?.text)
const RenderMessage = () => message.value ? h(Message, { title: message.value.title, variant: message.value.variant, icon: message.value.icon, action: message.value.action, body: message.value.body }) : null
const extendedOverlay = computed(() => ({
  role: 'dialog', 'aria-labelledby': titleId, 'aria-describedby': (props.subtitle !== undefined ? props.subtitle : slots.subtitle) ? subtitleId : undefined,
  ...props.overlayProps,
  ...(props.variant === 'modal' ? { top: '50vh', left: '50vw', anchorSide: undefined } : {}),
  onKeydown: keydown,
  style: { transform: props.variant === 'modal' ? 'translate(-50%, -50%)' : undefined,
    ...(availableHeight.value !== undefined ? { maxHeight: `${availableHeight.value}px` } : {}) }
}))
const showResponsiveButtons = computed(() => fullscreenEnabled.value && multi.value)
const hasSecondary = computed(() => props.secondaryAction !== undefined || Boolean(slots.secondaryAction))
const showFooter = computed(() => hasSecondary.value || props.variant === 'modal' || showResponsiveButtons.value)
const stretchSecondary = computed(() => showResponsiveButtons.value && props.variant === 'anchored' ? 'only-big' : props.variant === 'modal' ? 'never' : 'always')
const stretchSave = computed(() => props.variant !== 'modal' && showResponsiveButtons.value && props.onCancel === undefined && !hasSecondary.value ? 'only-small' : 'never')
const noticeIcon = computed(() => props.notice?.variant === 'error' ? StopIcon : props.notice?.variant === 'warning' ? AlertIcon : InfoIcon)
function keydown(event: KeyboardEvent) {
  props.overlayProps?.onKeydown?.(event)
  if (event.ctrlKey || event.altKey || event.metaKey || /^(INPUT|TEXTAREA)$/.test((document.activeElement as HTMLElement)?.tagName)) return
  if (event.key === '/' || /^[a-z\d]$/i.test(event.key)) event.stopPropagation()
}
watch([() => props.open, () => props.selected, singleModal], () => { intermediate.value = singleModal.value ? props.selected as ItemInput | undefined : undefined }, { immediate: true })
function itemsChanged() {
  if (props.loading !== undefined) {
    if (props.items.length) dataLoaded.value = true
    return
  }
  if (props.items.length || internalLoading.value) { internalLoading.value = false; dataLoaded.value = true }
  clearLoadingTimer()
}
watch(() => props.items, (next, previous) => {
  itemsChanged()
  if (!previous.length && next.length) resetSort()
})
watch(() => props.open, () => resetSort())
watch([input, () => props.open], ([element, open]) => {
  if (open && element) void nextTick(() => element.focus())
})
watch([internalLoading, () => props.loading !== undefined], ([value, external]) => {
  // The source intentionally watches internal isLoading, not the loading prop.
  if (!external) return
  if (value) loadingTimer = safeTimeout(() => { void announceLoading() }, 1000)
  else clearLoadingTimer()
})
watch([mounted, () => props.open, dataLoaded, filter, () => props.items, () => props.loading === undefined, list, () => props.selected, () => props.onFilterChange], () => {
  if (mounted.value && props.loading === undefined && !dataLoaded.value && props.open && !props.items.length) filterChange(filter.value, null)
}, { flush: 'post' })
watch([mounted, () => props.open, () => props.notice], async () => {
  if (!mounted.value || !props.open || !props.notice) return
  await nextTick()
  if (!noticeElement.value) return
  const { announceFromElement } = await import('@primer/live-region-element')
  const region = document.querySelector('live-region')
  region?.clear()
  await announceFromElement(noticeElement.value, { from: region ?? undefined })
}, { flush: 'post' })
watch([() => props.open, fullscreen, () => props.variant], ([open, full, variant], _previous, onCleanup) => {
  if (typeof document === 'undefined' || !open || (!full && variant !== 'modal') || document.body.style.overflow === 'hidden') return
  const previous = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  onCleanup(() => { document.body.style.overflow = previous })
}, { immediate: true })
const media = typeof window === 'undefined' ? undefined : window.matchMedia?.('(max-width: calc(768px - 0.02px))')
const updateMedia = () => { narrow.value = media?.matches ?? false }
let viewportBaseline = 0
let viewportScale = 1
watch([() => props.open, narrow], ([open, isNarrow], _previous, onCleanup) => {
  if (typeof window === 'undefined' || !open || !isNarrow || !window.visualViewport) return
  const viewport = window.visualViewport
  viewportBaseline = viewport.height
  viewportScale = viewport.scale
  let timer: ReturnType<typeof setTimeout> | undefined
  const updateViewport = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (viewport.scale !== viewportScale) return
      availableHeight.value = viewportBaseline - viewport.height > 10 ? viewport.height : undefined
    }, 100)
  }
  viewport.addEventListener('resize', updateViewport)
  viewport.addEventListener('scroll', updateViewport)
  onCleanup(() => { clearTimeout(timer); viewport.removeEventListener('resize', updateViewport); viewport.removeEventListener('scroll', updateViewport) })
}, { immediate: true })
onMounted(() => {
  itemsChanged()
  mounted.value = true
  updateMedia()
  media?.addEventListener('change', updateMedia)
})
onBeforeUnmount(() => {
  for (const timer of timers) clearTimeout(timer)
  media?.removeEventListener('change', updateMedia)
})
defineExpose({ element: computed(() => overlay.value?.element ?? null), anchor: computed(() => anchor.value.value), input, list, focus: () => anchor.value.value?.focus() })
</script>
<template>
  <AnchoredOverlay
    ref="overlay"
    class-name="select-panel__overlay"
    :open="open"
    :render-anchor="renderAnchor === null ? null : ($slots.anchor && renderAnchor === undefined ? undefined : RenderAnchor)"
    :anchor-id="id"
    v-bind="anchorSettings"
    :align="align"
    :width="width"
    :height="height"
    :overlay-props="extendedOverlay"
    :focus-trap-settings="focusTrapSettings"
    :focus-zone-settings="focusZoneSettings"
    :display-in-viewport="displayInViewport"
    :pin-position="!height"
    :variant="fullscreenEnabled ? { narrow: 'fullscreen', regular: 'anchored' } : undefined"
    :display-close-button="fullscreenEnabled && (!multi || !!onCancel)"
    :close-button-props="{ 'aria-label': 'Cancel and close' }"
    :css-anchor-positioning-settings="{ ...cssAnchorPositioningSettings, disable: variant === 'modal' || cssAnchorPositioningSettings?.disable }"
    @open="gesture => openChange(true, gesture)"
    @close="requestClose"
  >
    <template
      v-if="$slots.anchor && renderAnchor === undefined"
      #anchor="slotProps"
    >
      <slot
        name="anchor"
        v-bind="slotProps"
      />
    </template>
    <div
      class="select-panel"
      :data-variant="variant"
      data-component="SelectPanel"
    >
      <div
        class="select-panel__header"
        :data-variant="fullscreenEnabled ? (fullscreen ? 'fullscreen' : 'anchored') : undefined"
        data-component="SelectPanel.Header"
      >
        <div>
          <h1
            :id="titleId"
            class="select-panel__title"
            data-component="SelectPanel.Title"
          >
            <RenderTitle v-if="props.title !== undefined" />
            <slot
              v-else
              name="title"
            >
              <RenderTitle />
            </slot>
          </h1>
          <div
            v-if="subtitle !== undefined ? !!subtitle : !!$slots.subtitle"
            :id="subtitleId"
            class="select-panel__subtitle"
            data-component="SelectPanel.Subtitle"
          >
            <RenderSubtitle v-if="subtitle !== undefined" />
            <slot
              v-else
              name="subtitle"
            >
              <RenderSubtitle />
            </slot>
          </div>
        </div>
        <Button
          v-if="variant === 'modal' && !narrow"
          class="select-panel__close"
          variant="invisible"
          :icon="XIcon"
          type="button"
          aria-label="Cancel and close"
          data-component="SelectPanel.CloseButton"
          @click="cancel"
        />
      </div>
      <div
        v-if="notice"
        ref="noticeElement"
        data-component="SelectPanel.Notice"
      >
        <section
          class="select-panel__notice"
          :data-variant="notice.variant === 'error' ? 'critical' : notice.variant"
          :aria-labelledby="noticeTitleId"
          data-component="Banner"
          data-title-hidden=""
          data-actions-layout="default"
          data-layout="compact"
          layout="compact"
          tabindex="-1"
        >
          <div
            class="select-panel__notice-icon"
            data-component="Banner.Icon"
          >
            <component
              :is="noticeIcon"
              :size="16"
              data-component="Octicon"
            />
          </div>
          <div class="select-panel__notice-container">
            <div
              class="select-panel__notice-content"
              data-component="Banner.Content"
            >
              <span class="select-panel__visually-hidden"><h2
                :id="noticeTitleId"
                class="select-panel__banner-title"
                data-component="Banner.Title"
                data-banner-title=""
              >Notice</h2></span>
              <div
                v-if="notice.text !== undefined ? !!notice.text : !!$slots.notice"
                data-component="Banner.Description"
              >
                <RenderNotice v-if="notice.text !== undefined" />
                <slot
                  v-else
                  name="notice"
                >
                  <RenderNotice />
                </slot>
              </div>
            </div>
          </div>
        </section>
      </div>
      <FilteredActionList
        ref="filteredList"
        v-bind="{ ...attrs, disabled, required, validationStatus, groupMetadata, renderItem, renderGroup, showItemDividers, announcementsEnabled, actionListProps, focusOutBehavior, _PrivateFocusManagement, disableSelectOnHover, setInitialFocus, focusPrependedElements, scrollBehavior, virtualized, inputRef, scrollContainerRef }"
        :items="items"
        :filter-value="filter"
        :placeholder-text="placeholderText"
        :variant="groupMetadata?.length ? 'horizontal-inset' : 'inset'"
        role="listbox"
        :aria-labelledby="props['aria-label'] ? undefined : titleId"
        :aria-label="props['aria-label']"
        :aria-multiselectable="multi ? 'true' : 'false'"
        :selection-variant="singleModal ? 'radio' : multi ? 'multiple' : 'single'"
        :text-input-props="{ className: 'select-panel__filter', contrast: true, leadingVisual: SearchVisual, 'aria-label': inputLabel ?? placeholderText, ...textInputProps }"
        :loading="loading"
        :loading-type="loadingType"
        :message="message ? h(RenderMessage) : undefined"
        :message-text="{ title: message?.title || 'No items available', description: typeof message?.body === 'string' ? message.body : '' }"
        :show-select-all="showSelectAll"
        :full-screen-on-narrow="fullscreenEnabled"
        :class-name="['select-panel__list', className].filter(Boolean).join(' ')"
        @filter-change="filterChange"
        @select-all-change="selectAll"
        @input-ref-changed="inputChanged"
        @list-container-ref-changed="listChanged"
        @active-descendant-changed="(current, previous, directlyActivated) => emit('active-descendant-changed', current, previous, directlyActivated)"
      />
      <div
        v-if="footer !== undefined ? !!footer : !!$slots.footer"
        class="select-panel__footer"
        data-component="SelectPanel.Footer"
      >
        <RenderFooter v-if="footer !== undefined" />
        <slot
          v-else
          name="footer"
        >
          <RenderFooter />
        </slot>
      </div>
      <div
        v-else-if="showFooter || $slots.secondaryAction"
        class="select-panel__footer select-panel__responsive-footer"
        :data-display-footer="hasSecondary || variant === 'modal' ? 'always' : 'only-small'"
        :data-stretch-secondary-action="stretchSecondary"
        :data-stretch-save-button="stretchSave"
        data-component="SelectPanel.Footer"
      >
        <div
          class="select-panel__secondary"
          :data-stretch-secondary-action="stretchSecondary"
          data-component="SelectPanel.SecondaryAction"
        >
          <RenderSecondary v-if="secondaryAction !== undefined" />
          <slot
            v-else
            name="secondaryAction"
          >
            <RenderSecondary />
          </slot>
        </div>
        <div
          v-if="variant === 'modal' || showResponsiveButtons"
          :class="[variant === 'modal' || onCancel ? 'select-panel__buttons' : undefined, { 'select-panel__responsive-save-button': variant !== 'modal' }]"
          :data-stretch-save-button="stretchSave"
        >
          <Button
            v-if="variant === 'modal' || onCancel"
            data-component="SelectPanel.CancelButton"
            @click="cancel"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            :block="!onCancel"
            :data-component="variant === 'modal' || onCancel ? 'SelectPanel.SaveButton' : 'SelectPanel.SaveAndCloseButton'"
            @click="save"
          >
            {{ variant === 'modal' || onCancel ? 'Save' : 'Save and close' }}
          </Button>
        </div>
      </div>
    </div>
  </AnchoredOverlay>
  <div
    v-if="open && variant === 'modal'"
    class="select-panel__backdrop"
    data-component="SelectPanel.Backdrop"
  />
</template>
<style src="./SelectPanel.css" />
<style scoped>
.select-panel__title { margin-block: 0; font-weight: var(--base-text-weight-semibold, 600); }
.select-panel :deep(svg[data-octicon]) { display: inline-block; vertical-align: text-bottom; }
</style>
