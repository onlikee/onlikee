<script setup lang="ts">
import { computed, nextTick, shallowRef, useId, useTemplateRef, watch } from 'vue'
import type { ImageUploadFile } from './types'
import { cropImage, getImageAccept, isImageAccepted, moveCrop, resizeCrop, type CropCorner, type CropRect } from './image'

const props = withDefaults(defineProps<{
  modelValue?: ImageUploadFile[]
  previewUrl?: string
  accept?: string
  text?: string
  hint?: string
  width?: string
  disabled?: boolean
  circle?: boolean
  crop?: boolean
}>(), {
  modelValue: () => [],
  previewUrl: '',
  accept: '',
  text: '',
  hint: '',
  width: '',
  disabled: false,
  circle: false,
  crop: false
})

const emit = defineEmits<{
  'update:modelValue': [value: ImageUploadFile[]]
}>()

const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const imageRef = useTemplateRef<HTMLImageElement>('image')
const stageRef = useTemplateRef<HTMLDivElement>('stage')
const selectedFiles = shallowRef<ImageUploadFile[]>([])
const pendingFile = shallowRef<File | null>(null)
const localPreviewUrl = shallowRef('')
const previewUrl = computed(() => localPreviewUrl.value || props.previewUrl)
const sourceUrl = shallowRef('')
const dragging = shallowRef(false)
const saving = shallowRef(false)
const cropError = shallowRef('')
const dimensions = shallowRef({ width: 0, height: 0 })
const cropRect = shallowRef<CropRect>({ x: 0, y: 0, size: 0 })
const id = useId()
const inputAccept = computed(() => getImageAccept(props.accept))
const corners: { corner: CropCorner; label: string }[] = [
  { corner: 'nw', label: '左上' }, { corner: 'ne', label: '右上' },
  { corner: 'sw', label: '左下' }, { corner: 'se', label: '右下' }
]
let generation = 0
let backdropPointerDown = false
let drag: {
  pointerId: number
  corner?: CropCorner
  x: number
  y: number
  crop: CropRect
  scale: number
} | null = null

const selectionStyle = computed(() => ({
  left: `${cropRect.value.x / dimensions.value.width * 100}%`,
  top: `${cropRect.value.y / dimensions.value.height * 100}%`,
  width: `${cropRect.value.size / dimensions.value.width * 100}%`,
  height: `${cropRect.value.size / dimensions.value.height * 100}%`
}))

watch(() => props.modelValue.slice(0, 1), value => {
  cancelCrop()
  selectedFiles.value = value
}, { immediate: true })

watch(() => selectedFiles.value[0]?.file, (file, _previous, onCleanup) => {
  localPreviewUrl.value = file ? URL.createObjectURL(file) : ''
  const url = localPreviewUrl.value
  onCleanup(() => { if (url) URL.revokeObjectURL(url) })
}, { immediate: true })

watch(() => props.disabled, disabled => {
  if (disabled) {
    dragging.value = false
    cancelCrop()
  }
})

watch(() => props.crop, enabled => {
  if (!enabled) cancelCrop()
})

watch(pendingFile, async (file, _previous, onCleanup) => {
  generation += 1
  const currentGeneration = generation
  drag = null
  dimensions.value = { width: 0, height: 0 }
  cropRect.value = { x: 0, y: 0, size: 0 }
  saving.value = false
  cropError.value = ''
  sourceUrl.value = file ? URL.createObjectURL(file) : ''
  const url = sourceUrl.value
  onCleanup(() => {
    generation += 1
    if (url) URL.revokeObjectURL(url)
  })
  if (!file) return
  await nextTick()
  if (generation === currentGeneration) dialogRef.value?.showModal()
})

function openFileDialog() {
  if (!props.disabled && !pendingFile.value) inputRef.value?.click()
}

function selectImage(file: File | undefined) {
  if (!file || props.disabled || pendingFile.value) return
  if (!isImageAccepted(file, props.accept)) return
  if (props.crop) {
    pendingFile.value = file
  } else {
    commitImage(file)
  }
}

function commitImage(file: File) {
  selectedFiles.value = [{ file, relativePath: file.name }]
  emit('update:modelValue', selectedFiles.value)
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectImage(input.files?.[0])
  input.value = ''
}

function onDrop(event: DragEvent) {
  dragging.value = false
  selectImage(event.dataTransfer?.files[0])
}

function onDragLeave(event: DragEvent) {
  if (!(event.relatedTarget instanceof Node) || !(event.currentTarget as HTMLElement).contains(event.relatedTarget)) {
    dragging.value = false
  }
}

function cancelCrop() {
  generation += 1
  pendingFile.value = null
  dialogRef.value?.close()
}

function onImageLoad() {
  const image = imageRef.value
  if (!image) return
  const { naturalWidth: width, naturalHeight: height } = image
  dimensions.value = { width, height }
  const size = Math.min(width, height)
  cropRect.value = { x: (width - size) / 2, y: (height - size) / 2, size }
}

function startDrag(event: PointerEvent, corner?: CropCorner) {
  if (saving.value || event.button !== 0 || !stageRef.value) return
  event.preventDefault()
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  drag = {
    pointerId: event.pointerId, corner, x: event.clientX, y: event.clientY,
    crop: { ...cropRect.value }, scale: dimensions.value.width / stageRef.value.getBoundingClientRect().width
  }
}

function onPointerMove(event: PointerEvent) {
  if (!drag || drag.pointerId !== event.pointerId) return
  const dx = (event.clientX - drag.x) * drag.scale
  const dy = (event.clientY - drag.y) * drag.scale
  const { width, height } = dimensions.value
  cropRect.value = drag.corner
    ? resizeCrop(drag.crop, drag.corner, dx, dy, width, height)
    : moveCrop(drag.crop, dx, dy, width, height)
}

function endDrag(event: PointerEvent) {
  if (drag?.pointerId === event.pointerId) drag = null
}

function onCropKeydown(event: KeyboardEvent, corner?: CropCorner) {
  if (saving.value || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
  event.preventDefault()
  const step = event.shiftKey ? 10 : 1
  const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0
  const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0
  const { width, height } = dimensions.value
  cropRect.value = corner
    ? resizeCrop(cropRect.value, corner, dx * 2, dy * 2, width, height)
    : moveCrop(cropRect.value, dx, dy, width, height)
}

function isOutsideDialog(event: PointerEvent) {
  const dialog = dialogRef.value
  if (!dialog || event.target !== dialog) return false
  const rect = dialog.getBoundingClientRect()
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
}

function onDialogPointerUp(event: PointerEvent) {
  if (backdropPointerDown && isOutsideDialog(event)) cancelCrop()
  backdropPointerDown = false
}

function onDialogPointerDown(event: PointerEvent) {
  backdropPointerDown = isOutsideDialog(event)
}

async function confirmCrop() {
  const image = imageRef.value
  const file = pendingFile.value
  if (!image || !file || !cropRect.value.size || saving.value) return
  saving.value = true
  cropError.value = ''
  const currentGeneration = generation
  try {
    const result = await cropImage(image, { ...cropRect.value }, file)
    if (currentGeneration !== generation) return
    cancelCrop()
    commitImage(result)
  } catch (cause) {
    if (currentGeneration === generation) {
      cropError.value = cause instanceof Error ? cause.message : '图片裁剪失败，请重试。'
    }
  } finally {
    if (currentGeneration === generation) saving.value = false
  }
}
</script>

<template>
  <div
    :class="$style['image-upload']"
    :data-disabled="disabled"
  >
    <button
      :class="$style['upload-drop']"
      type="button"
      :style="{ width }"
      :data-circle="circle"
      :data-dragging="dragging"
      :data-preview="Boolean(previewUrl)"
      :disabled="disabled"
      :aria-label="previewUrl ? '更换图片' : '选择图片'"
      @click="openFileDialog"
      @dragover.prevent="dragging = !disabled"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop"
    >
      <img
        v-if="previewUrl"
        :class="$style['image-upload-preview']"
        :src="previewUrl"
        :alt="selectedFiles[0]?.file.name || '图片预览'"
      >
      <span
        v-else
        :class="$style['image-upload-placeholder']"
      >
        <slot>
          <svg
            :class="$style['upload-icon']"
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z" />
            <path d="M11.78 4.72a.749.749 0 1 1-1.06 1.06L8.75 3.811V9.5a.75.75 0 0 1-1.5 0V3.811L5.28 5.78a.749.749 0 1 1-1.06-1.06l3.25-3.25a.749.749 0 0 1 1.06 0l3.25 3.25Z" />
          </svg>
          <span
            v-if="text"
            :class="$style['upload-text']"
          >
            {{ text }}
          </span>
        </slot>
        <span
          v-if="hint"
          :class="$style['upload-hint']"
        >
          {{ hint }}
        </span>
      </span>
    </button>
    <input
      ref="inputRef"
      type="file"
      :accept="inputAccept || 'application/x-image-upload-unavailable'"
      :disabled="disabled"
      hidden
      @change="onFileChange"
    >
    <Teleport to="body">
      <dialog
        ref="dialog"
        :class="$style['avatar-cropper-dialog']"
        :aria-labelledby="`${id}-title`"
        @cancel.prevent="cancelCrop"
        @pointerdown="onDialogPointerDown"
        @pointerup="onDialogPointerUp"
      >
        <header :class="$style['avatar-cropper-header']">
          <div :class="$style['avatar-cropper-header-content']">
            <h2
              :id="`${id}-title`"
              :class="$style['avatar-cropper-title']"
            >
              裁剪图片
            </h2>
          </div>
          <button
            :class="$style['avatar-cropper-close']"
            type="button"
            aria-label="关闭裁剪弹窗"
            autofocus
            @click="cancelCrop"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
            ><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" /></svg>
          </button>
        </header>
        <div :class="$style['avatar-cropper-body']">
          <div :class="$style['avatar-cropper']">
            <div
              v-if="sourceUrl"
              ref="stage"
              :class="$style['avatar-cropper-stage']"
              :data-saving="saving"
            >
              <img
                :key="sourceUrl"
                ref="image"
                :class="$style['avatar-cropper-image']"
                :src="sourceUrl"
                alt="待裁剪图片"
                draggable="false"
                @load="onImageLoad"
                @error="cropError = '无法读取这张图片，请选择有效的图片文件。'"
              >
              <div
                v-if="cropRect.size"
                :class="$style['avatar-cropper-selection']"
                :style="selectionStyle"
                @pointermove="onPointerMove"
                @pointerup="endDrag"
                @pointercancel="endDrag"
                @lostpointercapture="endDrag"
              >
                <button
                  :class="$style['avatar-cropper-move']"
                  type="button"
                  aria-label="移动裁剪区域"
                  :disabled="saving"
                  @pointerdown="startDrag($event)"
                  @keydown="onCropKeydown($event)"
                />
                <button
                  v-for="{ corner, label } in corners"
                  :key="corner"
                  :class="$style['avatar-cropper-handle']"
                  type="button"
                  :data-corner="corner"
                  :aria-label="`${label}角调整裁剪大小`"
                  :disabled="saving"
                  @pointerdown.stop="startDrag($event, corner)"
                  @keydown="onCropKeydown($event, corner)"
                />
              </div>
            </div>
          </div>
          <p
            v-if="cropError"
            :class="$style['image-upload-error']"
            role="alert"
          >
            {{ cropError }}
          </p>
        </div>
        <footer :class="$style['avatar-cropper-footer']">
          <button
            :class="$style['avatar-cropper-confirm']"
            type="button"
            :disabled="!cropRect.size || saving"
            :aria-busy="saving ? 'true' : undefined"
            :data-loading="saving"
            data-size="medium"
            data-variant="primary"
            data-icon-button="false"
            @click="confirmCrop"
          >
            <span :class="$style['avatar-cropper-confirm__content']">
              <span :class="$style['avatar-cropper-confirm__content-row']">
                <span :class="$style['avatar-cropper-confirm__label']">确认裁剪</span>
              </span>
              <svg
                v-if="saving"
                aria-hidden="true"
                focusable="false"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                :class="$style['avatar-cropper-confirm__spinner']"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  fill="none"
                  stroke="currentColor"
                  stroke-opacity="0.25"
                  stroke-width="2"
                  vector-effect="non-scaling-stroke"
                />
                <path
                  d="M15 8a7.002 7.002 0 0 0-7-7"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="2"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
            </span>
          </button>
        </footer>
      </dialog>
    </Teleport>
  </div>
</template>
<style module src="./ImageUpload.module.css" />
