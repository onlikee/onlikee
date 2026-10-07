<script setup lang="ts">
import { cloneVNode, computed, Fragment, onBeforeUnmount, onMounted, onUpdated, provide, shallowRef, useAttrs, useId, useSlots, type VNode } from 'vue'
import UnderlinePanelsTab from './UnderlinePanelsTab.vue'
import UnderlinePanelsPanel from './UnderlinePanelsPanel.vue'
import { underlinePanelsKey } from './context'
import type { UnderlinePanelsProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<UnderlinePanelsProps>(), {
  value: undefined,
  defaultValue: undefined,
  activationMode: 'automatic',
  id: undefined,
  loadingCounters: false,
  as: 'div'
})

const emit = defineEmits<{
  change: [selection: { value: string }]
  'update:value': [value: string]
}>()

const attrs = useAttrs()
const ariaLabel = computed(() => attrs['aria-label'] as string | undefined)
const ariaLabelledBy = computed(() => attrs['aria-labelledby'] as string | undefined)
const wrapperAttrs = computed(() => Object.fromEntries(Object.entries(attrs)
  .filter(([name]) => name !== 'aria-label' && name !== 'aria-labelledby')))
const slots = useSlots()
const generatedId = useId()
const id = computed(() => props.id ?? generatedId)
const uncontrolledValue = shallowRef(props.defaultValue ?? '0')
const initialized = shallowRef(false)
const focusedValue = shallowRef<string>()
const iconsVisible = shallowRef(true)
const wrapperRef = shallowRef<HTMLElement>()
const listRef = shallowRef<HTMLUListElement>()
let listWidth = 0
let previousSelectedFromProps: string | undefined
let listObserver: ResizeObserver | undefined
let wrapperObserver: ResizeObserver | undefined

const RenderNodes = (props: { nodes: VNode[] }) => props.nodes

function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap(node => node.type === Fragment && Array.isArray(node.children)
    ? flatten(node.children as VNode[])
    : [node])
}

const children = computed(() => {
  const tabs: VNode[] = []
  const panels: VNode[] = []
  let tabIndex = 0
  let panelIndex = 0
  let selectedFromProps: string | undefined
  let selectedCount = 0

  for (const node of flatten(slots.default?.() ?? [])) {
    if (node.type === UnderlinePanelsTab) {
      const value = String(node.props?.value ?? tabIndex)
      tabIndex++
      if (node.props?.['aria-selected'] === true || node.props?.['aria-selected'] === 'true') {
        selectedFromProps = value
        selectedCount++
      }
      tabs.push(cloneVNode(node, { value }))
    } else if (node.type === UnderlinePanelsPanel) {
      panels.push(cloneVNode(node, { value: String(node.props?.value ?? panelIndex) }))
      panelIndex++
    }
  }

  if (import.meta.env.DEV) {
    const tabValues = tabs.map(tab => String(tab.props?.value))
    const panelValues = panels.map(panel => String(panel.props?.value))
    if (selectedCount > 1) throw new Error('Only one UnderlinePanels.Tab can be selected at a time.')
    if (tabs.length !== panels.length) throw new Error(`UnderlinePanels requires equal numbers of tabs and panels. Got ${tabs.length} tabs and ${panels.length} panels.`)
    if (new Set(tabValues).size !== tabValues.length) throw new Error('Every UnderlinePanels.Tab must have a unique value.')
    if (new Set(panelValues).size !== panelValues.length) throw new Error('Every UnderlinePanels.Panel must have a unique value.')
    const unmatched = tabValues.find(value => !panelValues.includes(value))
    if (unmatched !== undefined) throw new Error(`UnderlinePanels.Tab value "${unmatched}" has no matching panel.`)
  }

  return { tabs, panels, selectedFromProps }
})

const selectedValue = computed(() => {
  const selected = props.value ?? (initialized.value
    ? uncontrolledValue.value
    : props.defaultValue ?? children.value.selectedFromProps ?? '0')
  const values = children.value.tabs.map(tab => String(tab.props?.value))
  return values.includes(selected) ? selected : values[0] ?? selected
})

function selectTab(value: string) {
  focusedValue.value = undefined
  if (value === selectedValue.value) return
  if (props.value === undefined) {
    uncontrolledValue.value = value
    initialized.value = true
  }
  emit('update:value', value)
  emit('change', { value })
}

provide(underlinePanelsKey, {
  id,
  selectedValue,
  focusedValue,
  activationMode: computed(() => props.activationMode),
  loadingCounters: computed(() => props.loadingCounters),
  selectTab,
  focusTab: value => { focusedValue.value = value }
})

const tabsHaveIcons = computed(() => children.value.tabs.some(tab => Boolean(tab.props?.leadingVisual)))

function updateIconsVisibility() {
  if (!tabsHaveIcons.value || !wrapperRef.value || !listRef.value) {
    iconsVisible.value = true
    return
  }
  if (iconsVisible.value) listWidth = listRef.value.getBoundingClientRect().width
  iconsVisible.value = wrapperRef.value.clientWidth > listWidth
}

onMounted(() => {
  previousSelectedFromProps = children.value.selectedFromProps
  if (!initialized.value) {
    uncontrolledValue.value = props.defaultValue ?? previousSelectedFromProps ?? '0'
    initialized.value = true
  }
  updateIconsVisibility()
  if (typeof ResizeObserver === 'undefined') return
  listObserver = new ResizeObserver(() => {
    if (iconsVisible.value) updateIconsVisibility()
  })
  wrapperObserver = new ResizeObserver(updateIconsVisibility)
  if (listRef.value) listObserver.observe(listRef.value)
  if (wrapperRef.value) wrapperObserver.observe(wrapperRef.value)
})

onBeforeUnmount(() => {
  listObserver?.disconnect()
  wrapperObserver?.disconnect()
})

onUpdated(() => {
  const nextSelectedFromProps = children.value.selectedFromProps
  if (props.value === undefined && nextSelectedFromProps !== previousSelectedFromProps && nextSelectedFromProps !== undefined) {
    uncontrolledValue.value = nextSelectedFromProps
  }
  previousSelectedFromProps = nextSelectedFromProps
  updateIconsVisibility()
})

function handleKeydown(event: KeyboardEvent) {
  if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
  const tabs = Array.from(listRef.value?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([aria-disabled="true"])') ?? [])
  if (!tabs.length) return
  const activeIndex = tabs.indexOf(document.activeElement as HTMLButtonElement)
  const currentIndex = activeIndex >= 0 ? activeIndex : tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true')
  if (currentIndex < 0) return

  event.preventDefault()
  event.stopPropagation()
  const nextIndex = event.key === 'Home' ? 0
    : event.key === 'End' ? tabs.length - 1
      : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
  tabs[nextIndex]?.focus()
}
</script>

<template>
  <div :class="[$style['underline-panels-group']]">
    <component
      :is="as"
      v-bind="wrapperAttrs"
      :id="props.id"
      ref="wrapperRef"
      :class="[$style['underline-panels']]"
      :data-icons-visible="iconsVisible"
    >
      <ul
        ref="listRef"
        :class="[$style['underline-panels__list']]"
        role="tablist"
        aria-orientation="horizontal"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledBy"
        @keydown="handleKeydown"
      >
        <RenderNodes :nodes="children.tabs" />
      </ul>
    </component>
    <RenderNodes :nodes="children.panels" />
  </div>
</template>

<style module src="./UnderlinePanels.module.css"></style>
