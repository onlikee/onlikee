<template>
  <textarea
    class="textarea"
    :value="modelValue"
    @input="onInput"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isComposing = ref(false)

function onCompositionStart() {
  isComposing.value = true
}

function onCompositionEnd(event: CompositionEvent) {
  isComposing.value = false
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

function onInput(event: Event) {
  if (isComposing.value) return
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<style scoped>
.textarea {
  color: var(--fgColor-default, #1f2328);
  vertical-align: middle;
  background-color: var(--bgColor-default, #fff);
  border: 1px solid var(--control-borderColor-rest, #d0d7de);
  box-shadow: var(--shadow-inset, inset 0px 1px 0px 0px #1f23280a);
  background-position: right 8px center;
  background-repeat: no-repeat;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 14px;
  line-height: 20px;
  resize: vertical;
  overflow: auto;
  scrollbar-color: var(--fgColor-muted, #59636e) transparent;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.textarea:focus {
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: -1px;
}

.textarea:disabled {
  cursor: not-allowed;
  background: var(--bgColor-muted, #f6f8fa);
}
</style>
