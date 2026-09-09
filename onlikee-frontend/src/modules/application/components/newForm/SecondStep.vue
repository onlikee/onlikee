<template>
  <div class="second-step">
    <div
      v-if="selectedFramework === null"
      class="upload-tip"
    >
      <LightBulbIcon />
      请先选择一个框架
    </div>

    <div
      v-else
      class="step-panel"
      :class="{ 'step-panel--invalid': invalid }"
    >
      <HtmlMonacoEditor
        v-if="selectedFramework === 'html'"
        :model-value="htmlSource"
        @update:model-value="updateHtmlSource"
      />

      <Upload
        v-if="selectedFramework === 'vue' || selectedFramework === 'react'"
        :model-value="files"
        directory
        hint="请上传dist构建包文件夹"
        @update:model-value="updateFiles"
      />
    </div>
    <p
      v-if="invalid && validation"
    >
      <FormControlValidation variant="error">
        {{ validation }}
      </FormControlValidation>
    </p>
  </div>
</template>

<script setup lang="ts">
import { HtmlMonacoEditor } from '@/components/monaco-editor'
import LightBulbIcon from '@/components/octicons-vue3/icons/light-bulb.vue'
import { Upload } from '@/components/primer-vue/Upload'
import type { UploadFile } from '@/components/primer-vue/Upload'
import type { FrameworkValue } from './useCreateApplicationForm'
import { FormControlValidation } from '@/components/primer-vue/FormControl'

interface Props {
  selectedFramework: FrameworkValue | null
  files: UploadFile[]
  htmlSource: string
  invalid?: boolean
  validation?: string
}

withDefaults(defineProps<Props>(), {
  invalid: false,
  validation: ''
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
.step-panel--invalid :deep(.upload-drop) {
  border-color: var(--borderColor-danger-emphasis, #cf222e);
}

.step-panel--invalid :deep(.html-editor-wrapper:focus-within) {
  outline-color: var(--borderColor-danger-emphasis, #cf222e);
}

.upload-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 100px;
  color: var(--fgColor-muted);
  font-size: 14px;
  line-height: 1.6;
}

.icon-svg {
  margin-top: 2px;
  margin-right: 4px;
  flex-shrink: 0;
}
</style>
