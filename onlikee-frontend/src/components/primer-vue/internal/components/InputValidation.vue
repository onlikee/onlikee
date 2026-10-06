<template>
  <span
    v-bind="attrs"
    class="input-validation"
    :class="className"
    :style="normalizeReactStyle(attrs.style)"
    :data-validation-status="validationStatus"
  >
    <span
      v-if="validationStatus === 'error' || validationStatus === 'success'"
      aria-hidden="true"
      class="input-validation__icon"
      style="--inputValidation-iconSize: 16"
    >
      <svg
        v-if="validationStatus === 'error'"
        data-component="Octicon"
        aria-hidden="true"
        focusable="false"
        class="octicon octicon-alert-fill"
        viewBox="0 0 12 12"
        width="12"
        height="12"
        fill="currentColor"
        display="inline-block"
        overflow="visible"
        style="vertical-align: text-bottom"
      >
        <path d="M4.855.708c.5-.896 1.79-.896 2.29 0l4.675 8.351a1.312 1.312 0 0 1-1.146 1.954H1.33A1.313 1.313 0 0 1 .183 9.058ZM7 7V3H5v4Zm-1 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
      <svg
        v-else-if="validationStatus === 'success'"
        data-component="Octicon"
        aria-hidden="true"
        focusable="false"
        class="octicon octicon-check-circle-fill"
        viewBox="0 0 12 12"
        width="12"
        height="12"
        fill="currentColor"
        display="inline-block"
        overflow="visible"
        style="vertical-align: text-bottom"
      >
        <path d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0Zm-.705 8.737L9.63 4.403 8.392 3.166 5.295 6.263l-1.7-1.702L2.356 5.8l2.938 2.938Z" />
      </svg>
    </span>
    <!-- captionLineHeight = 16 / 12；数字自定义属性序列化为 "1.3333333333333333"。 -->
    <span
      :id="id"
      class="input-validation__text"
      style="--inputValidation-lineHeight: 1.3333333333333333"
    ><slot /></span>
  </span>
</template>
<script setup lang="ts">
import { useAttrs } from 'vue'
import { normalizeReactStyle } from '../style'
defineOptions({ inheritAttrs: false })
defineProps<{ id: string; validationStatus?: 'error' | 'success'; className?: string }>()
const attrs = useAttrs()
</script>
<style scoped>
.input-validation { display: flex; font-size: var(--text-body-size-small, 12px); font-weight: var(--base-text-weight-semibold, 600); color: var(--inputValidation-fgColor, currentColor); }
.input-validation :deep(a) { color: currentColor; text-decoration: underline; }
.input-validation[data-validation-status='success'] { --inputValidation-fgColor: var(--fgColor-success, #1a7f37); }
.input-validation[data-validation-status='error'] { --inputValidation-fgColor: var(--fgColor-danger, #d1242f); }
.input-validation__icon { display: flex; margin-top: var(--base-size-2, 2px); margin-inline-end: var(--base-size-4, 4px); min-height: var(--inputValidation-iconSize, 16px); }
.input-validation__text { line-height: var(--inputValidation-lineHeight, 1.3333333333333333); }
</style>
