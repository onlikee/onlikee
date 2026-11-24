<template>
  <div class="second-step">
    <div class="step-panel" :class="{ 'step-panel--invalid': invalid }">
      <HtmlMonacoEditor
        v-if="selectedFramework === 'HTML'"
        :model-value="htmlSource"
        @update:model-value="updateHtmlSource"
      />

      <Upload
        v-else
        height="160px"
        :model-value="files"
        directory
        hint="请上传包含 index.html 的静态构建产物文件夹"
        @update:model-value="updateFiles"
      />
    </div>
    <p v-if="invalid && validation">
      <FormControlValidation variant="error">
        {{ validation }}
      </FormControlValidation>
    </p>
  </div>
</template>

<script setup lang="ts">
import { HtmlMonacoEditor } from '@/components/monaco-editor'
import { Upload } from '@/components/primer-vue/Upload'
import type { UploadFile } from '@/components/primer-vue/Upload'
import { FormControlValidation } from '@/components/primer-vue/FormControl'

interface Props {
  selectedFramework: string
  files: UploadFile[]
  htmlSource: string
  invalid?: boolean
  validation?: string
}

withDefaults(defineProps<Props>(), {
  invalid: false,
  validation: '',
})

const emit = defineEmits<{
  'update:files': [value: UploadFile[]]
  'update:html-source': [value: string]
}>()

function updateFiles(value: UploadFile[]) {
  emit('update:files', value)
}

function updateHtmlSource(value: string) {
  emit('update:html-source', value)
}
</script>

<style scoped>
.second-step {
  display: grid;
  gap: 8px;
}

.step-panel--invalid :deep(.html-editor-wrapper),
.step-panel--invalid :deep([data-component='Upload.Drop']) {
  border-color: var(--borderColor-danger-emphasis, #cf222e);
}

.step-panel--invalid :deep(.html-editor-wrapper:focus-within) {
  outline-color: var(--borderColor-danger-emphasis, #cf222e);
}

.icon-svg {
  margin-top: 2px;
  margin-right: 4px;
  flex-shrink: 0;
}
</style>
