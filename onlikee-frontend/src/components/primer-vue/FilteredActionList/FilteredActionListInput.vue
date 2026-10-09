<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  shallowRef,
  useAttrs,
  watchEffect,
  type ComponentPublicInstance,
} from 'vue'
import TextInput from '../TextInput/TextInput.vue'
import type { FilteredActionListProps } from './types'
import { assignElementRef } from '../internal/assignElementRef'
defineOptions({ name: 'FilteredActionListInput', inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    value?: string
    placeholderText?: string
    listId: string
    inputDescriptionTextId: string
    loading?: boolean
    fullScreenOnNarrow?: boolean
    inputRef?: FilteredActionListProps['inputRef']
  }>(),
  {
    value: '',
    loading: false,
    fullScreenOnNarrow: false,
    placeholderText: undefined,
    inputRef: undefined,
  },
)
const emit = defineEmits<{
  'update:value': [value: string]
  'input-change': [event: Event]
  'input-focus': [event: FocusEvent]
  'input-key-down': [event: KeyboardEvent]
  'input-key-press': [event: KeyboardEvent]
}>()
const attrs = useAttrs()
function textInputBindings() {
  const { onFocus, className, ...rest } = attrs
  return {
    block: true,
    width: 'auto',
    color: 'fg.default',
    value: props.value,
    placeholder: props.placeholderText,
    role: 'combobox',
    'aria-expanded': 'true',
    'aria-autocomplete': 'list',
    'aria-controls': props.listId,
    'aria-label': props.placeholderText,
    'aria-describedby': props.inputDescriptionTextId,
    loaderPosition: 'leading' as const,
    loading: props.loading,
    className: typeof className === 'string' ? className : undefined,
    onChange: (event: Event) => emit('input-change', event),
    onKeydown: (event: KeyboardEvent) => emit('input-key-down', event),
    onKeypress: (event: KeyboardEvent) => emit('input-key-press', event),
    ...rest,
    onFocus: (event: FocusEvent) => {
      emit('input-focus', event)
      if (typeof onFocus === 'function') onFocus(event)
      else if (Array.isArray(onFocus)) for (const callback of onFocus) callback(event)
    },
  }
}
const control = shallowRef<ComponentPublicInstance<{
  input: HTMLInputElement | null
  element: HTMLInputElement | null
}> | null>(null)
const input = computed(() => control.value?.input ?? control.value?.element ?? null)
watchEffect(() => assignElementRef(props.inputRef, input.value))
onBeforeUnmount(() => assignElementRef(props.inputRef, null))
defineExpose({ input, element: input, focus: () => input.value?.focus() })
</script>
<template>
  <div
    :class="$style['filtered-action-list__header']"
    :data-full-screen-on-narrow="fullScreenOnNarrow ? 'true' : undefined"
    data-component="FilteredActionList.Header"
  >
    <TextInput
      ref="control"
      v-bind="textInputBindings()"
      @update:value="emit('update:value', $event)"
    />
  </div>
</template>
<style module src="./FilteredActionListInput.module.css" />
