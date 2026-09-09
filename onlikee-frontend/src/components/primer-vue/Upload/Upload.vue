<template>
  <div class="upload">
    <div
      class="upload-drop"
      :class="{ 'upload-drop--over': dragging }"
      @dragover.prevent="dragging = true"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop"
      @click="openFileDialog"
    >
      <slot>
        <svg
          class="upload-icon"
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" />
          <path d="M11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.811V9.5a.75.75 0 0 1-1.5 0V3.811L5.28 5.78a.749.749 0 1 1-1.06-1.06l3.25-3.25a.749.749 0 0 1 1.06 0l3.25 3.25Z" />
        </svg>
        <p class="upload-text">
          {{ dropzoneText }}
        </p>
      </slot>
      <p
        v-if="hint"
        class="upload-hint"
      >
        {{ hint }}
      </p>
      <input
        ref="inputRef"
        type="file"
        :accept="accept"
        v-bind="inputAttrs"
        hidden
        @change="onFileChange"
      >
    </div>

    <div
      v-if="selectedFiles.length"
      class="upload-file"
    >
      <div class="upload-file-meta">
        <span class="upload-file-name">{{ selectedFileLabel }}</span>
        <span class="upload-file-size">{{ selectedFileSizeLabel }}</span>
      </div>
      <button
        class="upload-file-remove"
        type="button"
        @click="clearFiles"
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        ><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" /></svg>
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
  hint?: string
  directory?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  accept: '',
  hint: '',
  directory: false
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
    multiple: true
  }
})

const dropzoneText = computed(() => {
  return props.directory
    ? '拖拽文件夹到此处，或点击选择文件夹'
    : '拖拽文件到此处，或点击选择'
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
      directory: props.directory
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
      directory: props.directory
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

<style scoped>
.upload {
	display: grid;
}

.upload-drop {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 3rem 2rem;
	border: 2px dashed var(--borderColor-default);
	border-radius: 6px;
	background: var(--bgColor-muted);
	cursor: pointer;
	transition: border-color 0.2s, background 0.2s;
}

.upload-drop:hover,
.upload-drop--over {
	border-color: var(--borderColor-accent-emphasis);
	background: color-mix(in srgb, var(--bgColor-accent-emphasis) 6%, var(--bgColor-muted));
}

.upload-icon {
	width: 32px;
	height: 32px;
	color: var(--fgColor-muted);
}

.upload-text {
	margin: 0;
	font-size: 1rem;
	color: var(--fgColor-default);
}

.upload-hint {
	margin: 0;
	font-size: 0.85rem;
	color: var(--fgColor-muted);
}

.upload-file {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-top: 12px;
	padding: 6px 6px 6px 14px;
	border: 1px solid var(--borderColor-default);
	border-radius: 6px;
	background: var(--bgColor-muted);
}

.upload-file-meta {
	display: grid;
	flex: 1 1 0%;
	gap: 2px;
	min-width: 0;
}

.upload-file-name {
	font-size: 0.8rem;
	color: var(--fgColor-default);
}

.upload-file-size {
	font-size: 0.8rem;
	color: var(--fgColor-muted);
}

.upload-file-remove {
	margin-left: auto;
	display: grid;
	place-items: center;
	width: 32px;
	height: 32px;
	appearance: none;
	border: none;
	border-radius: 6px;
	background: none;
	cursor: pointer;
	color: var(--fgColor-muted);
}

.upload-file-remove:hover {
	background: var(--control-transparent-bgColor-hover, #818b981a);
	color: var(--fgColor-danger);
}

.upload-file-remove:active {
	background: var(--control-transparent-bgColor-active, #818b9826);
}

@media (max-width: 768px) {
	.upload-drop {
		padding: 2rem 1.25rem;
	}

	.upload-file-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}
</style>
