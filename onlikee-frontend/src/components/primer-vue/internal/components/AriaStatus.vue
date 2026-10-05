<template>
  <component
    :is="as"
    ref="element"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
type AnnounceFromElement = typeof import('@primer/live-region-element').announceFromElement

defineOptions({ name: 'AriaStatus' })
/* 源 AriaStatus.tsx:31：`<Announce {...props} announceOnShow={...} politeness="polite" />` ——
   politeness 在 spread 之后被强制为 'polite'，消费者传 assertive 无效。prop 声明保留
   （镜像 Announce 的 prop 面、吸收属性不落 DOM），但公告恒用 polite。
   clearExisting 为 Vue 自创（React 的清空在 useAnnouncements 独立实现）——已删除。 */
const props = withDefaults(defineProps<{
  as?: string
  announceOnShow?: boolean
  hidden?: boolean
  delayMs?: number
  politeness?: 'assertive' | 'polite'
}>(), { as: 'div', announceOnShow: false, hidden: false, delayMs: undefined, politeness: 'polite' })
const element = ref<HTMLElement | null>(null)
let observer: MutationObserver | undefined
let pending: ReturnType<AnnounceFromElement> | undefined
let previousText: string | undefined
let disposed = false
let generation = 0

async function announce() {
  const node = element.value
  if (!node || props.hidden) return
  const text = (node.getAttribute('aria-label') ?? node.textContent ?? '').trim()
  if (!text || text === previousText) return
  if (typeof node.checkVisibility === 'function') {
    if (!node.checkVisibility({ visibilityProperty: true, checkVisibilityCSS: true })) return
  } else {
    const style = getComputedStyle(node)
    if (style.display === 'none' || style.visibility === 'hidden') return
  }
  pending?.cancel()
  const currentGeneration = ++generation
  previousText = text
  // The library registers a DOM custom element. Load it only after mounting,
  // keeping SSR free of custom-element globals and canceled announcements.
  const { announceFromElement } = await import('@primer/live-region-element')
  if (disposed || props.hidden || currentGeneration !== generation) return
  pending = announceFromElement(node, { politeness: 'polite', delayMs: props.delayMs })
}

onMounted(() => {
  if (props.announceOnShow) void nextTick().then(() => { if (!disposed) return announce() })
  if (!element.value) return
  observer = new MutationObserver(announce)
  observer.observe(element.value, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label'] })
})
watch(() => props.hidden, hidden => {
  // hidden 时主动 cancel 为 L25 登记微差；解除 hidden 永不触发公告
  // （源 Announce 的 useEffectOnce 只在挂载运行，无补公告逻辑）。
  if (hidden) { generation++; pending?.cancel() }
}, { flush: 'post' })
onBeforeUnmount(() => { disposed = true; generation++; observer?.disconnect(); pending?.cancel() })
defineExpose({ element })
</script>
