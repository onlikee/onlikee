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
    class="image-upload"
    :data-disabled="disabled"
  >
    <button
      class="upload-drop"
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
        class="image-upload-preview"
        :src="previewUrl"
        :alt="selectedFiles[0]?.file.name || '图片预览'"
      >
      <span
        v-else
        class="image-upload-placeholder"
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
          <span
            v-if="text"
            class="upload-text"
          >
            {{ text }}
          </span>
        </slot>
        <span
          v-if="hint"
          class="upload-hint"
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
        class="avatar-cropper-dialog"
        :aria-labelledby="`${id}-title`"
        @cancel.prevent="cancelCrop"
        @pointerdown="onDialogPointerDown"
        @pointerup="onDialogPointerUp"
      >
        <header class="avatar-cropper-header">
          <div class="avatar-cropper-header-content">
            <h2
              :id="`${id}-title`"
              class="avatar-cropper-title"
            >
              裁剪图片
            </h2>
          </div>
          <button
            class="avatar-cropper-close"
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
        <div class="avatar-cropper-body">
          <div class="avatar-cropper">
            <div
              v-if="sourceUrl"
              ref="stage"
              class="avatar-cropper-stage"
              :data-saving="saving"
            >
              <img
                :key="sourceUrl"
                ref="image"
                class="avatar-cropper-image"
                :src="sourceUrl"
                alt="待裁剪图片"
                draggable="false"
                @load="onImageLoad"
                @error="cropError = '无法读取这张图片，请选择有效的图片文件。'"
              >
              <div
                v-if="cropRect.size"
                class="avatar-cropper-selection"
                :style="selectionStyle"
                @pointermove="onPointerMove"
                @pointerup="endDrag"
                @pointercancel="endDrag"
                @lostpointercapture="endDrag"
              >
                <button
                  class="avatar-cropper-move"
                  type="button"
                  aria-label="移动裁剪区域"
                  :disabled="saving"
                  @pointerdown="startDrag($event)"
                  @keydown="onCropKeydown($event)"
                />
                <button
                  v-for="{ corner, label } in corners"
                  :key="corner"
                  class="avatar-cropper-handle"
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
            class="image-upload-error"
            role="alert"
          >
            {{ cropError }}
          </p>
        </div>
        <footer class="avatar-cropper-footer">
          <button
            class="avatar-cropper-confirm"
            type="button"
            :disabled="!cropRect.size || saving"
            :aria-busy="saving ? 'true' : undefined"
            :data-loading="saving"
            data-size="medium"
            data-variant="primary"
            data-icon-button="false"
            @click="confirmCrop"
          >
            <span class="avatar-cropper-confirm__content">
              <span class="avatar-cropper-confirm__content-row">
                <span class="avatar-cropper-confirm__label">确认裁剪</span>
              </span>
              <svg
                v-if="saving"
                aria-hidden="true"
                focusable="false"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                class="avatar-cropper-confirm__spinner"
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

<style scoped>
.image-upload {
  display: block;
  width: 100%;
  min-width: 0;
}

.upload-drop {
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 0;
  aspect-ratio: 1;
  padding: 0;
  overflow: hidden;
  border: 2px dashed var(--borderColor-default, #d1d9e0);
  border-radius: 6px;
  background: var(--bgColor-muted, #f6f8fa);
  color: var(--fgColor-default, #1f2328);
  font: inherit;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.upload-drop[data-circle='true'] {
  border-radius: 50%;
}

.upload-drop:hover:not(:disabled),
.upload-drop[data-dragging='true'] {
  border-color: var(--borderColor-accent-emphasis, #0969da);
  background: color-mix(in srgb, var(--bgColor-accent-emphasis, #0969da) 6%, var(--bgColor-muted, #f6f8fa));
}

.upload-drop[data-preview='true'] {
  border-color: var(--bgColor-transparent, #ffffff00);
}

.image-upload-preview,
.image-upload-placeholder {
  grid-area: 1 / 1;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.image-upload-preview {
  display: block;
  object-fit: cover;
}

.image-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  gap: 8px;
  overflow-wrap: anywhere;
}

.upload-icon {
  width: 24px;
  height: 24px;
  color: var(--fgColor-muted, #59636e);
}

.upload-text { 
  font-size: 14px; 
}

.upload-hint {
  font-size: 0.85rem;
  color: var(--fgColor-muted, #59636e);
}

.image-upload-error { margin: 0; color: var(--fgColor-danger, #d1242f); font-size: 0.85rem; }
.image-upload[data-disabled='true'] { opacity: 0.6; }
.image-upload button:disabled { cursor: not-allowed; }

.avatar-cropper-dialog {
  background: var(--overlay-bgColor, var(--bgColor-default, #ffffff));
  border-radius: var(--borderRadius-large, 0.75rem);
  box-shadow: var(--shadow-floating-small, 0 0 0 1px #d1d9e080,0 6px 12px -3px #25292e0a,0 6px 18px 0 #25292e1f);
  color: var(--fgColor-default, #1f2328);

  flex-direction: column;
  height: fit-content;
  max-height: calc(100dvh - 64px);
  min-height: 0;
  outline: none;
  overflow: hidden;
  transform-origin: center;
  width: 480px;
  min-width: 296px;
  max-width: calc(100dvw - 64px);
  margin: auto;
  padding: 0;
  border: 0;
}

.avatar-cropper-dialog[open] {
  display: flex;
}

.avatar-cropper-dialog::backdrop { background: var(--overlay-backdrop-bgColor, rgba(140, 149, 159, 0.32)); }

.avatar-cropper-header {
  align-items: start;
  border-bottom: 1px solid var(--borderColor-default, #d1d9e0);
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 0.5rem;
}

.avatar-cropper-header-content {
  display: grid;
  gap: 0.25rem;
  padding: 6px 8px;
  min-width: 0;
}

.avatar-cropper-title {
  color: var(--fgColor-default, #1f2328);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  overflow-wrap: anywhere;
  margin: 0;
}

.avatar-cropper-close {
  align-items: center;
  appearance: none;
  background: var(--button-invisible-bgColor-rest, transparent);
  border: 1px solid var(--button-invisible-borderColor-rest, transparent);
  border-radius: var(--borderRadius-medium, 0.375rem);
  color: var(--fgColor-muted, #59636e);
  cursor: pointer;
  display: inline-flex;
  height: var(--control-medium-size, 2rem);
  justify-content: center;
  padding: 0;
  width: var(--control-medium-size, 2rem);
}

.avatar-cropper-close:hover {
  background: var(--button-invisible-bgColor-hover, var(--control-transparent-bgColor-hover, #818b981a));
  color: var(--fgColor-default, #1f2328);
}
.avatar-cropper-close:active {
  background: var(--button-invisible-bgColor-active, var(--control-transparent-bgColor-active, #818b9826));
}
.avatar-cropper-body {
  color: var(--fgColor-default, #1f2328);
  flex: 1 1 auto;
  font-size: 0.875rem;
  line-height: 1.5;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 1rem;
}
.avatar-cropper { display: flex; justify-content: center; }

.avatar-cropper-stage {
  position: relative;
  overflow: clip;
  line-height: 0;
  user-select: none;
  touch-action: none;
  background: var(--bgColor-muted, #f6f8fa);
}

.avatar-cropper-image {
  display: block;
  max-width: 100%;
  width: auto;
  height: auto;
}

.avatar-cropper-selection { position: absolute; box-shadow: 0 0 0 9999px #0006; }

.avatar-cropper-move {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: 1px solid #ffffffb3;
  background: transparent;
  cursor: move;
  touch-action: none;
}

.avatar-cropper-move::after {
  position: absolute;
  inset: 0;
  border: 1px dashed #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 999px #0002;
  content: '';
  pointer-events: none;
}

.avatar-cropper-handle {
  position: absolute;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  touch-action: none;
}

.avatar-cropper-handle::after {
  position: absolute;
  inset: 7px;
  border: 1px solid #59636e;
  border-radius: 50%;
  background: #fff;
  content: '';
}

.avatar-cropper-handle[data-corner='nw'] { top: -12px; left: -12px; cursor: nwse-resize; }
.avatar-cropper-handle[data-corner='ne'] { top: -12px; right: -12px; cursor: nesw-resize; }
.avatar-cropper-handle[data-corner='sw'] { bottom: -12px; left: -12px; cursor: nesw-resize; }
.avatar-cropper-handle[data-corner='se'] { bottom: -12px; right: -12px; cursor: nwse-resize; }
.image-upload button:focus-visible,
.avatar-cropper-dialog button:focus-visible { outline: 2px solid var(--focus-outlineColor, #0969da); outline-offset: -3px; }
.avatar-cropper-dialog .avatar-cropper-handle:focus-visible {
  outline: none;
}

.avatar-cropper-handle:focus-visible::after {
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: 2px;
}

.avatar-cropper-stage[data-saving='true'] { pointer-events: none; opacity: 0.6; }
.avatar-cropper-footer {
  align-items: center;
  background: var(--bgColor-default, #ffffff);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 1rem;
}

.avatar-cropper-confirm {
  align-items: center;
  appearance: none;
  background-color: transparent;
  border: var(--borderWidth-thin, 0.0625rem) solid transparent;
  border-radius: var(--borderRadius-medium, 0.375rem);
  color: var(--button-default-fgColor-rest, var(--control-fgColor-rest, #1f2328));
  cursor: pointer;
  display: inline-flex;
  font-size: var(--text-body-size-medium, 0.875rem);
  font-weight: var(--base-text-weight-medium, 500);
  height: var(--control-medium-size, 2rem);
  min-width: max-content;
  padding: 0 var(--control-medium-paddingInline-normal, 0.75rem);
  text-align: center;
  text-decoration: none;
  transition: 80ms cubic-bezier(0.65, 0, 0.35, 1);
  transition-property: color, background-color, border-color, box-shadow;
  user-select: none;
  vertical-align: middle;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 100%;
}

.avatar-cropper-confirm:focus-visible {
  box-shadow: none;
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: -2px;
}

.avatar-cropper-confirm:disabled {
  box-shadow: none;
  cursor: not-allowed;
}

.avatar-cropper-confirm__content {
  display: grid;
  flex: 1 0 auto;
  grid-template-areas: 'stack';
  place-items: center;
  width: 100%;
  justify-content: center;
}

.avatar-cropper-confirm__content-row,
.avatar-cropper-confirm__spinner {
  grid-area: stack;
}

.avatar-cropper-confirm__content-row {
  align-items: center;
  display: inline-flex;
  gap: 0.5rem;
  max-width: 100%;
}

.avatar-cropper-confirm__label {
  line-height: var(--text-body-lineHeight-medium, 1.5);
  white-space: nowrap;
}

.avatar-cropper-confirm__spinner {
  grid-area: stack;
}

.avatar-cropper-confirm[data-loading='true'] .avatar-cropper-confirm__content-row {
  visibility: hidden;
}

.avatar-cropper-confirm[data-variant='primary'] {
  background-color: var(--button-primary-bgColor-rest, var(--bgColor-success-emphasis, #1f883d));
  border-color: var(--button-primary-borderColor-rest, var(--borderColor-translucent, #1f232826));
  box-shadow: var(--shadow-resting-small, var(--button-default-shadow-resting, 0 1px 0 0 #1f23280a));
  color: var(--button-primary-fgColor-rest, var(--fgColor-white, #ffffff));
}

.avatar-cropper-confirm[data-variant='primary']:hover:not(:disabled) {
  background-color: var(--button-primary-bgColor-hover, #1c8139);
  border-color: var(--button-primary-borderColor-hover, var(--button-primary-borderColor-rest, #1f232826));
}

.avatar-cropper-confirm[data-variant='primary']:active:not(:disabled) {
  background-color: var(--button-primary-bgColor-active, #197935);
  border-color: var(--button-primary-borderColor-active, var(--button-primary-borderColor-rest, #1f232826));
  box-shadow: var(--button-primary-shadow-selected, var(--shadow-resting-small, 0 1px 0 0 #1f23280a));
}

.avatar-cropper-confirm[data-variant='primary']:focus-visible {
  box-shadow: inset 0 0 0 3px var(--fgColor-onEmphasis, #ffffff);
}

.avatar-cropper-confirm[data-variant='primary']:disabled {
  background-color: var(--button-primary-bgColor-disabled, #95d8a6);
  border-color: var(--button-primary-borderColor-disabled, var(--button-primary-bgColor-disabled, #95d8a6));
  color: var(--button-primary-fgColor-disabled, rgba(255, 255, 255, 0.8));
}

.avatar-cropper-dialog .avatar-cropper-confirm:focus-visible {
  outline-offset: -2px;
}

@keyframes avatar-cropper-confirm-spin {
  to {
    transform: rotate(360deg);
  }
}

.avatar-cropper-dialog .avatar-cropper-close:focus-visible {
  outline-offset: -2px;
}

@media (max-width: 480px) {
  .avatar-cropper-footer {
    align-items: stretch;
    flex-direction: column-reverse;
  }
}

@media (max-width: 767px) and (max-height: 280px) {
  .avatar-cropper-dialog {
    max-height: calc(100dvh - 12px);
    max-width: calc(100dvw - 12px);
  }
}

@media (max-width: 768px) {
  .image-upload-placeholder { padding: 1.25rem; }
}
</style>
