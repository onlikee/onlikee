<template>
  <span
    v-if="leadingText || trailingText"
    class="input-wrapper"
    :class="$attrs.class"
    :data-size="size"
    :data-disabled="isDisabled() ? 'true' : undefined"
    :style="$attrs.style"
  >
    <span
      v-if="leadingText"
      class="leading-text"
    >{{ leadingText }}</span>
    <input
      v-bind="getWrappedInputAttrs()"
      class="input"
      :data-size="size"
      :value="modelValue"
      @input="onInput"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
    >
    <span
      v-if="trailingText"
      class="trailing-text"
    >{{ trailingText }}</span>
  </span>
  <input
    v-else
    v-bind="$attrs"
    class="input"
    :data-size="size"
    :value="modelValue"
    @input="onInput"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
  >
</template>

<script setup lang="ts">
import { ref, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

interface Props {
  modelValue?: string
  size?: 'small' | 'medium' | 'large'
  leadingText?: string
  trailingText?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  size: 'medium',
  leadingText: '',
  trailingText: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const attrs = useAttrs()
const isComposing = ref(false)

function getWrappedInputAttrs() {
  const inputAttrs = { ...attrs }

  delete inputAttrs.class
  delete inputAttrs.style

  return inputAttrs
}

function isDisabled() {
  const disabled = attrs.disabled

  return disabled === '' || disabled === true || disabled === 'true'
}

function onCompositionStart() {
  isComposing.value = true
}

function onCompositionEnd(event: CompositionEvent) {
  isComposing.value = false
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onInput(event: Event) {
  if (isComposing.value) return
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<style scoped>
.input {
  color: var(--fgColor-default, #1f2328);
  vertical-align: middle;
  background-color: var(--bgColor-default, #fff);
  border: 1px solid var(--control-borderColor-rest, #d0d7de);
  box-shadow: var(--shadow-inset, inset 0px 1px 0px 0px #1f23280a);
  background-position: right 8px center;
  background-repeat: no-repeat;
  border-radius: 6px;
  padding: 5px 12px;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 20px;
}

.input[data-size="small"] {
  font-size: 12px;
  height: 29.6px;
  line-height: 18px;
  padding-top: 4.8px;
  padding-bottom: 4.8px;
}

.input[data-size="medium"] {
  font-size: 14px;
  height: 32px;
}

.input[data-size="large"] {
  font-size: 14px;
  height: 40px;
  padding-top: 9px;
  padding-bottom: 9px;
}

.input:focus {
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: -1px;
}

.input:disabled {
  cursor: not-allowed;
  background: var(--bgColor-muted, #f6f8fa);
}

.input-wrapper {
  display: inline-flex;
  align-items: stretch;
  vertical-align: middle;
  background-color: var(--bgColor-default, #fff);
  border: 1px solid var(--control-borderColor-rest, #d0d7de);
  box-shadow: var(--shadow-inset, inset 0px 1px 0px 0px #1f23280a);
  border-radius: 6px;
  box-sizing: border-box;
  overflow: hidden;
}

.input-wrapper[data-size="small"] {
  font-size: 12px;
  height: 29.6px;
}

.input-wrapper[data-size="medium"] {
  font-size: 14px;
  height: 32px;
}

.input-wrapper[data-size="large"] {
  font-size: 14px;
  height: 40px;
}

.input-wrapper .input {
  border: none;
  background: transparent;
  box-shadow: none;
  outline: none;
  flex: 1;
  width: 100%;
  height: 100%;
  padding-top: 0;
  padding-bottom: 0;
  font-size: inherit;
}

.input-wrapper:focus-within {
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: -1px;
}

.input-wrapper[data-disabled="true"] {
  background: var(--bgColor-muted, #f6f8fa);
}

.input-wrapper[data-disabled="true"],
.input-wrapper[data-disabled="true"] .input {
  cursor: not-allowed;
}

.leading-text,
.trailing-text {
  display: flex;
  align-items: center;
  color: var(--fgColor-muted, #656d76);
  font-size: inherit;
  padding: 0 12px;
  user-select: none;
  background-color: var(--bgColor-muted, #f6f8fa);
}

.leading-text {
  border-right: 1px solid var(--control-borderColor-rest, #d0d7de);
}

.trailing-text {
  border-left: 1px solid var(--control-borderColor-rest, #d0d7de);
}
</style>
