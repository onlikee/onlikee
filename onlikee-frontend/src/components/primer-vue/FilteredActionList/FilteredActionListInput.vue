<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, useAttrs, watchEffect, type ComponentPublicInstance } from 'vue'
import TextInput from '../TextInput/TextInput.vue'
import type { FilteredActionListProps } from './types'
import { assignElementRef } from '../internal/assignElementRef'
defineOptions({ name: 'FilteredActionListInput', inheritAttrs: false })
const props = withDefaults(defineProps<{
  value?: string; placeholderText?: string; listId: string; inputDescriptionTextId: string;
  loading?: boolean; fullScreenOnNarrow?: boolean; inputRef?: FilteredActionListProps['inputRef']
}>(), { value: '', loading: false, fullScreenOnNarrow: false, placeholderText: undefined, inputRef: undefined })
const emit = defineEmits<{ 'update:value': [value: string]; 'input-change': [event: Event]; 'input-focus': [event: FocusEvent]; 'input-key-down': [event: KeyboardEvent]; 'input-key-press': [event: KeyboardEvent] }>()
const attrs = useAttrs()
function textInputBindings() {
  const { onFocus, className, ...rest } = attrs
  return {
    block: true, width: 'auto', color: 'fg.default', value: props.value, placeholder: props.placeholderText,
    role: 'combobox', 'aria-expanded': 'true', 'aria-autocomplete': 'list',
    'aria-controls': props.listId, 'aria-label': props.placeholderText,
    'aria-describedby': props.inputDescriptionTextId,
    loaderPosition: 'leading' as const, loading: props.loading,
    /* 源：className={clsx(className, {[classes.FullScreenTextInput]: fullScreenOnNarrow})}
       —— 全屏字号类挂在 TextInput 根（wrapper）上，经 UnstyledTextInput 的 font-size: inherit 生效。 */
    className: [className, props.fullScreenOnNarrow ? 'filtered-action-list__fullscreen-input' : undefined].filter(Boolean).join(' ') || undefined,
    onChange: (event: Event) => emit('input-change', event),
    onKeydown: (event: KeyboardEvent) => emit('input-key-down', event),
    onKeypress: (event: KeyboardEvent) => emit('input-key-press', event),
    ...rest,
    onFocus: (event: FocusEvent) => {
      emit('input-focus', event)
      if (typeof onFocus === 'function') onFocus(event)
      else if (Array.isArray(onFocus)) for (const callback of onFocus) callback(event)
    }
  }
}
const control = shallowRef<ComponentPublicInstance<{ input: HTMLInputElement | null; element: HTMLInputElement | null }> | null>(null)
const input = computed(() => control.value?.input ?? control.value?.element ?? null)
watchEffect(() => assignElementRef(props.inputRef, input.value))
onBeforeUnmount(() => assignElementRef(props.inputRef, null))
defineExpose({ input, element: input, focus: () => input.value?.focus() })
</script>
<template>
  <div
    class="filtered-action-list__header"
    data-component="FilteredActionList.Header"
  >
    <TextInput
      ref="control"
      v-bind="textInputBindings()"
      @update:value="emit('update:value', $event)"
    />
  </div>
</template>
<style scoped>
/* 严格对齐轮：TextInput/TextInputWrapper/InputValidation 已按源移植后，
   此处原对 .TextInput-icon、background-position、input flex/padding/line-height 与
   .text-input-hidden 的 :deep 补偿全部移除；保留源 Header 的 box-shadow/z-index。 */
.filtered-action-list__header { box-shadow: 0 1px 0 var(--borderColor-default, #d1d9e0); z-index: 1; }
/* 源 FilteredActionList.module.css .FullScreenTextInput：类挂在 TextInput 根上。TextInput 为
   多根片段（wrapper + 游离计数节点），父 scope attr 不会落到其根元素——直接类选择器是死规则
   （审计 G7 HIGH），须经 :deep 从本组件自有根 .filtered-action-list__header 下钻。
   narrow = calc(768px - 0.02px)（项目断点换算惯例，源 calc(48rem - 0.02px)）。
   Ensures inputs don't zoom on mobile iPhone but are body-font size on iPad. */
@media screen and (max-width: calc(768px - 0.02px)) { @supports (-webkit-touch-callout: none) { .filtered-action-list__header :deep(.filtered-action-list__fullscreen-input) { font-size: var(--text-title-size-small, 16px); } } }
</style>
