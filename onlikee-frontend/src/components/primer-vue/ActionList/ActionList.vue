<template>
  <!-- List.tsx:109-127 —— Component=ul；className/role/aria-labelledby/ref 后接显式 data-*（:118-121），
       {...restProps} 最后（:122，Vue 的 fallthrough attrs 同样后获胜）。
       源不渲染 data-selection-variant（selectionVariant 仅进 ListContext :108）；
       data-item-gap（:121）需 container==='NavList'（:55-56），端口无容器上下文 → 恒缺席。 -->
  <ul
    ref="listRef"
    class="action-list"
    :role="role"
    data-component="ActionList"
    :data-dividers="showDividers"
    :data-variant="variant"
    @keydown="handleKeydown"
  >
    <slot />
  </ul>
</template>

<script setup lang="ts">
import { computed, onMounted, onUpdated, ref } from 'vue'
import {
  createContext,
  provideContext,
  type ActionListSelectionVariant,
  type ActionListVariant
} from './context'

const props = withDefaults(
  defineProps<{
    variant?: ActionListVariant
    selectionVariant?: ActionListSelectionVariant
    showDividers?: boolean
    role?: string
  }>(),
  {
    variant: 'inset',
    selectionVariant: undefined,
    showDividers: false,
    role: undefined
  }
)

const listRef = ref<HTMLUListElement>()
const selectionVariant = computed(() => props.selectionVariant)
const listRole = computed(() => props.role)

// 源 zone 过滤器（@primer/behaviors dist/utils/iterate-focusable-elements.js:36-45 isFocusable）只排除
// 输入类元素（hidden input、disabled 表单控件、.sentinel、隐藏元素），不排除 aria-disabled；
// ActionList 条目从不设 DOM disabled（Item.tsx:251 仅 aria-disabled）→ 禁用条目留在 zone 中可高亮，
// 激活拦截由 Item 的 click/keypress guard 完成（Item.tsx:186-208）。
const focusableSelector = [
  '[data-action-list-control]',
  ':not(input)'
].join('')

function getFocusableItems() {
  const list = listRef.value
  if (!list) return []

  return Array.from(list.querySelectorAll<HTMLElement>(focusableSelector))
    .filter(item => item.closest('.action-list') === list)
}

// List.tsx:65 —— bindKeys: ArrowVertical | HomeAndEnd | PageUpDown；
// @primer/behaviors dist/cjs/focus-zone.js:64-65 —— PageUp→'start'、PageDown→'end'（与 Home/End 同向）
function handleKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) return

  const items = getFocusableItems()
  if (!items.length) return

  const activeIndex = items.indexOf(document.activeElement as HTMLElement)
  if (activeIndex === -1) return

  event.preventDefault()

  if (event.key === 'Home' || event.key === 'PageUp') {
    items[0]?.focus()
    return
  }

  if (event.key === 'End' || event.key === 'PageDown') {
    items[items.length - 1]?.focus()
    return
  }

  const offset = event.key === 'ArrowDown' ? 1 : -1
  const nextIndex = (activeIndex + offset + items.length) % items.length
  items[nextIndex]?.focus()
}

// List.tsx:95-107 —— useIsomorphicLayoutEffect 每次渲染后执行：两次 querySelector（替代 CSS :has()）
// 检测同列表中同时存在 data-has-description="true" 与 "false" 的条目 → 写入/移除
// data-mixed-descriptions="true"（List.module.css:102-106 将 label 字重还原 normal）。
// Vue 等价钩子：onMounted + onUpdated（命令式读写，与源一致）。
function syncMixedDescriptions() {
  const list = listRef.value
  if (!list) return
  const hasMixed =
    list.querySelector('[data-has-description="true"]') !== null &&
    list.querySelector('[data-has-description="false"]') !== null
  const current = list.getAttribute('data-mixed-descriptions')
  if (hasMixed && current !== 'true') {
    list.setAttribute('data-mixed-descriptions', 'true')
  } else if (!hasMixed && current !== null) {
    list.removeAttribute('data-mixed-descriptions')
  }
}
onMounted(syncMixedDescriptions)
onUpdated(syncMixedDescriptions)

provideContext(createContext({
  selectionVariant,
  listRole
}))
</script>

<style scoped>
.action-list {
  --action-list-inset: 8px;
  --action-list-gap: 8px;
  --action-list-item-radius: var(--borderRadius-medium, 0.375rem); /* primitives 11.5.1 radius.css:7 */
  --action-list-item-padding-block: 6px;
  --action-list-item-padding-inline: 8px;
  --action-list-row-height: 20px;

  box-sizing: border-box;
  width: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
}

.action-list[data-variant='inset'] {
  padding: var(--action-list-inset);
}

.action-list[data-variant='horizontal-inset'] {
  padding-block-end: var(--action-list-inset);
}

.action-list[data-variant='horizontal-inset'] :deep(.action-list-item) {
  margin-inline: var(--action-list-inset);
}

.action-list :deep(.action-list-list) {
  padding: 0;
  margin: 0;
  list-style: none;
}

.action-list[data-dividers='true'] :deep(.action-list-item:not(:first-child) .action-list-sub-content::before) {
  position: absolute;
  top: -7px;
  display: block;
  width: 100%;
  height: 1px;
  content: '';
  background: var(--borderColor-muted, #d1d9e0b3);
}

.action-list[data-dividers='true'] :deep(.action-list-divider + .action-list-item .action-list-sub-content::before),
.action-list[data-dividers='true'] :deep(.action-list-group + .action-list-item .action-list-sub-content::before) {
  visibility: hidden;
}
</style>
