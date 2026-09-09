<template>
  <div
    class="select"
    :class="{ disabled, open }"
    :data-size="size"
    tabindex="0"
    @keydown.stop.prevent="onKeydown"
  >
    <button
      class="select-trigger"
      :disabled="disabled"
      type="button"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-haspopup="'listbox'"
      @click="toggle"
    >
      <span class="select-value">{{ selectedLabel || placeholder }}</span>
      <span
        class="select-arrow"
        :class="{ rotate: open }"
      >
        <svg
          aria-hidden="true"
          height="16"
          viewBox="0 0 16 16"
          width="16"
          fill="currentColor"
        >
          <path
            d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"
          />
        </svg>
      </span>
    </button>
    <transition name="select-fade">
      <div
        v-if="open"
        class="select-dropdown"
        role="listbox"
        :aria-activedescendant="activeId"
      >
        <div
          ref="listEl"
          class="select-options"
        >
          <div
            v-for="(option, idx) in selectOptions"
            :id="idBase + '-' + option.value"
            :key="option.value"
            class="select-option"
            :class="{
              selected: option.value === modelValue,
              active: idx === highlightedIndex,
            }"
            role="option"
            :aria-selected="option.value === modelValue ? 'true' : 'false'"
            @click="select(option.value)"
            @mousemove="setHighlight(idx)"
          >
            <span class="label">{{ option.label }}</span>
            <span v-if="option.value === modelValue"><svg
              class="check"
              width="24"
              height="24"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M43 11L16.875 37L5 25.1818"
              stroke="#333"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg></span>
          </div>
        </div>
      </div>
    </transition>
    <div
      class="select-option-registry"
      aria-hidden="true"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { provideSelectContext, type SelectOptionData } from './context'

type Option = SelectOptionData

type SelectSize = 'small' | 'medium' | 'large'

const props = withDefaults(defineProps<{
    modelValue?: string
    options?: Option[]
    placeholder?: string
    disabled?: boolean
    size?: SelectSize
}>(), {
    modelValue: '',
    options: () => [],
    placeholder: '',
    disabled: false,
    size: 'medium'
})
const emit = defineEmits<{
    'update:modelValue': [value: string]
    open: []
    close: []
}>()

const open = ref(false)
const highlightedIndex = ref(-1)
const listEl = ref<HTMLDivElement | null>(null)
const slotOptions = ref<Option[]>([])
const optionMap = new Map<symbol, Option>()
const idBase = `select-${Math.random().toString(36).slice(2)}`
// 用于区分不同实例，实现互斥展开
const instanceId = `select-inst-${Math.random().toString(36).slice(2)}`
const selectOptions = computed(() => slotOptions.value.length ? slotOptions.value : props.options)

function syncSlotOptions() {
    slotOptions.value = Array.from(optionMap.values())
}

provideSelectContext({
    registerOption(id, option) {
        optionMap.set(id, option)
        syncSlotOptions()
    },
    updateOption(id, option) {
        optionMap.set(id, option)
        syncSlotOptions()
    },
    unregisterOption(id) {
        optionMap.delete(id)
        syncSlotOptions()
    }
})

const activeId = computed(() => {
    if (highlightedIndex.value < 0) return undefined
    const opt = selectOptions.value[highlightedIndex.value]
    return opt ? idBase + '-' + opt.value : undefined
})
const selectedLabel = computed(() => {
    const found = selectOptions.value.find(opt => opt.value === props.modelValue)
    return found ? found.label : ''
})

function toggle() {
    if (props.disabled) return
    open.value = !open.value
    if (open.value) {
        emit('open')
    // 通知其他选择框关闭
    window.dispatchEvent(new CustomEvent('select-open', { detail: { id: instanceId } }))
        initHighlight()
        nextTick(() => scrollHighlightedIntoView())
    } else emit('close')
}
function select(val: string) {
    emit('update:modelValue', val)
    open.value = false
    emit('close')
}
function initHighlight() {
    const idx = selectOptions.value.findIndex(o => o.value === props.modelValue)
    highlightedIndex.value = idx >= 0 ? idx : 0
}
function setHighlight(i: number) {
    highlightedIndex.value = i
}
function move(delta: number) {
    if (!open.value) {
        toggle();
        return
    }
    const len = selectOptions.value.length
    if (!len) return
    highlightedIndex.value = ((highlightedIndex.value + delta) + len) % len
    nextTick(() => scrollHighlightedIntoView())
}
function scrollHighlightedIntoView() {
    if (!listEl.value) return
    const li = listEl.value.children[highlightedIndex.value] as HTMLElement | undefined
    if (li) {
        const parent = listEl.value
        const top = li.offsetTop
        const bottom = top + li.offsetHeight
        if (top < parent.scrollTop) parent.scrollTop = top
        else if (bottom > parent.scrollTop + parent.clientHeight) parent.scrollTop = bottom - parent.clientHeight
    }
}
function onKeydown(e: KeyboardEvent) {
    if (props.disabled) return
    switch (e.key) {
        case 'ArrowDown': move(1); break
        case 'ArrowUp': move(-1); break
        case 'Enter':
        case ' ': // space
            if (!open.value) {
                toggle()
            } else if (highlightedIndex.value >= 0) {
                const option = selectOptions.value[highlightedIndex.value]
                if (option) select(option.value)
            }
            break
        case 'Escape':
            if (open.value) { open.value = false; emit('close') }
            break
        case 'Tab':
            open.value = false; emit('close')
            break
    }
}
function handleClickOutside(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('.select')) {
        if (open.value) emit('close')
        open.value = false
    }
}
onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
    // 监听其它实例打开事件
    window.addEventListener('select-open', handleOtherOpen as EventListener)
})
onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside)
    window.removeEventListener('select-open', handleOtherOpen as EventListener)
})
watch(() => props.disabled, (v) => { if (v) open.value = false })

function handleOtherOpen(e: Event) {
    const ce = e as CustomEvent<{ id: string }>
    if (!open.value) return
    if (ce.detail && ce.detail.id !== instanceId) {
        open.value = false
        emit('close')
    }
}
</script>

<style scoped>
.select {
    position: relative;
    min-width: 0px !important;
}

.select:focus {
    outline: none;
}

.select-option-registry {
    display: none;
}

.select-trigger {
    width: 100%;
    height: 32px;
    box-sizing: border-box;
    /* 由内容撑开 */
    padding: 0.42rem 0.75rem;
    border: 1px solid var(--control-borderColor-rest, #d0d7de);
    border-radius: 6px;
    background: var(--bgColor-default, #fff);
    color: var(--fgColor-default, #1f2328);
    box-shadow: var(--shadow-inset, inset 0px 1px 0px 0px #1f23280a);
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    display: inline-flex;
    /* inline-flex 以便宽度随内容 */
    align-items: center;
    justify-content: space-between;
    gap: .5rem;
    transition: border-color .15s, background-color .15s, box-shadow .15s;
    white-space: nowrap;
    /* 不换行 */
}

.select[data-size='small'] .select-trigger {
    height: 29.6px;
    padding: 0.3rem 0.5rem;
    font-size: 12px;
}

.select[data-size='large'] .select-trigger {
    height: 40px;
    padding: 0.55rem 1rem;
    font-size: 14px;
}

.select.open:not(.disabled) .select-trigger,
.select-trigger:hover:not(:disabled) {
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: -1px;
}


.select-trigger:disabled {
    cursor: not-allowed;
    background: var(--bgColor-muted, #f6f8fa);
}

.select-value {
    flex: 0 0 auto;
    /* 不强制拉伸 */
    white-space: nowrap;
}

.select-arrow {
    margin-left: auto;
    color: var(--fgColor-muted, #59636e);
    display: inline-flex;
}

.select-arrow.rotate {
    transform: rotate(180deg);
}

.select-dropdown {
    position: absolute;
    left: 0;
    top: calc(100% + 4px);
    min-width: 100%;
    /* 与触发器一致 */
    width: max-content;
    /* 允许宽度跟随最长选项，但不小于触发器 */
    background: var(--bgColor-default, #fff);
    border: 1px solid var(--borderColor-default, #d1d9e0);
    border-radius: 8px;
    box-shadow: 0 6px 18px color-mix(in srgb, var(--fgColor-default, #1f2328) 8%, var(--bgColor-transparent, #ffffff00));
    z-index: 20;
    overflow: hidden;
}

.select-options {
    margin: 0;
    padding: 8px;
    max-height: 220px;
    overflow-y: auto;
    scrollbar-width: thin;
    display: grid;
    gap: 4px;
}

.select-option {
    position: relative;
    padding: 0.5em 1em;
    cursor: pointer;
    font-size: 14px;
    color: var(--fgColor-default, #1f2328);
    display: flex;
    align-items: center;
    gap: .5rem;
    transition: background .12s, color .12s;
    white-space: nowrap;
    border-radius: 4px;
}

.select[data-size='small'] .select-option {
    font-size: 12px;
}

.select[data-size='large'] .select-option {
    font-size: 14px;
}

.select-option.active:not(.selected) {
    background: var(--control-bgColor-hover, #eff2f5);
}

.select-option.selected {
    background: var(--control-bgColor-hover, #eff2f5);
    color: var(--fgColor-default, #1f2328);
}

.select-option.selected .check {
    margin-left: auto;
    font-size: .8rem;
}

.check {
    width: 12px;
    height: 12px;
}

.select-option:hover {
    background: var(--control-bgColor-hover, #eff2f5);
}

.select.disabled .select-trigger {
    cursor: not-allowed;
    background: var(--bgColor-muted, #f6f8fa);
}

/* 过渡 */
.select-fade-enter-active,
.select-fade-leave-active {
    transform-origin: top;
}

.select-fade-enter-from,
.select-fade-leave-to {
    opacity: 0;
    transform: scale(.98);
}

.select-fade-enter-to,
.select-fade-leave-from {
    opacity: 1;
    transform: scale(1);
}
</style>
