<template>
  <div :class="[$style['upload']]">
    <button
      :class="[$style['upload-drop']]"
      data-component="Upload.Drop"
      type="button"
      :style="{ width, height }"
      :data-dragging="dragging"
      :aria-label="directory ? '选择文件夹' : '选择文件'"
      @click="openFileDialog"
      @dragover.prevent="dragging = true"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop"
    >
      <slot>
        <svg
          :class="[$style['upload-icon']]"
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"
          />
          <path
            d="M11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.811V9.5a.75.75 0 0 1-1.5 0V3.811L5.28 5.78a.749.749 0 1 1-1.06-1.06l3.25-3.25a.749.749 0 0 1 1.06 0l3.25 3.25Z"
          />
        </svg>
        <span v-if="text" :class="[$style['upload-text']]">
          {{ text }}
        </span>
      </slot>
      <span v-if="hint" :class="[$style['upload-hint']]">
        {{ hint }}
      </span>
    </button>
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      v-bind="inputAttrs"
      hidden
      @change="onFileChange"
    />

    <div v-if="selectedFiles.length" :class="[$style['upload-file']]">
      <div :class="[$style['upload-file-meta']]">
        <span :class="[$style['upload-file-name']]">{{ selectedFileLabel }}</span>
        <span :class="[$style['upload-file-size']]">{{ selectedFileSizeLabel }}</span>
      </div>
      <button :class="[$style['upload-file-remove']]" type="button" @click="clearFiles">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UploadFile } from './types'
import { collectFilesFromDrop, collectFilesFromInput } from './fileSelection'

interface Props {
  modelValue?: UploadFile[]
  accept?: string
  text?: string
  hint?: string
  width?: string
  height?: string
  directory?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  accept: '',
  text: '',
  hint: '',
  width: '',
  height: '',
  directory: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: UploadFile[]]
}>()

const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)

const selectedFiles = computed(() => props.modelValue)

const inputAttrs = computed(() => {
  if (!props.directory) {
    return {}
  }

  return {
    directory: '',
    webkitdirectory: '',
    multiple: true,
  }
})

const selectedFileLabel = computed(() => {
  if (selectedFiles.value.length === 1) {
    return selectedFiles.value[0].file.name
  }

  return `已选择 ${selectedFiles.value.length} 个文件`
})

const selectedFileSizeLabel = computed(() => {
  const totalSize = selectedFiles.value.reduce((sum, file) => sum + file.file.size, 0)
  return formatFileSize(totalSize)
})

function openFileDialog() {
  inputRef.value?.click()
}

function clearFiles() {
  emit('update:modelValue', [])
  resetInput()
}

async function onDrop(event: DragEvent) {
  dragging.value = false

  try {
    const files = await collectFilesFromDrop(event.dataTransfer, {
      accept: props.accept,
      directory: props.directory,
    })
    emit('update:modelValue', files)
  } catch (error) {
    console.error('Failed to collect dropped files.', error)
    emit('update:modelValue', [])
  }
}

function onDragLeave() {
  dragging.value = false
}

async function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement

  try {
    const files = collectFilesFromInput(target.files, {
      accept: props.accept,
      directory: props.directory,
    })
    emit('update:modelValue', files)
  } finally {
    resetInput()
  }
}

function resetInput() {
  if (inputRef.value) {
    inputRef.value.value = ''
  }
}

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
</script>

<style module src="./Upload.module.css"></style>
