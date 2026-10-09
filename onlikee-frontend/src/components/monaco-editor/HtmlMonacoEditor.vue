<template>
  <div class="html-editor-wrapper">
    <VueMonacoEditor
      :value="editorValue"
      language="html"
      height="360px"
      class-name="html-editor"
      :options="editorOptions"
      @update:value="updateEditorValue"
    >
      <template #default />
      <template #failure />
    </VueMonacoEditor>
  </div>
</template>

<script setup lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorValue = computed(() => props.modelValue)

const editorOptions = {
  automaticLayout: true,
  fontSize: 14,
  lineNumbersMinChars: 3,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  tabSize: 2,
}

function updateEditorValue(value: string | undefined) {
  emit('update:modelValue', value ?? '')
}
</script>

<style scoped>
.html-editor-wrapper {
  overflow: hidden;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
}

.html-editor-wrapper:focus-within {
  outline: 2px solid var(--borderColor-accent-emphasis);
  outline-offset: -1px;
}

.html-editor-wrapper :deep(.html-editor) {
  width: 100%;
  height: 100%;
}
</style>
