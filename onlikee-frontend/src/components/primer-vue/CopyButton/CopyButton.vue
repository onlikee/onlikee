<template>
  <button
    class="copy-button"
    :data-size="size"
    @click="handleClick"
  >
    <svg
      v-if="!copied"
      aria-hidden="true"
      focusable="false"
      data-octicon="copy"
      viewBox="0 0 16 16"
      fill="currentColor"
      :data-size="size"
    >
      <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
      <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
    </svg>
    <svg
      v-else
      aria-hidden="true"
      focusable="false"
      data-octicon="check"
      viewBox="0 0 16 16"
      fill="var(--fgColor-success, #1a7f37)"
      :data-size="size"
    >
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
    </svg>
  </button>
</template>
<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  size?: 'small' | 'medium' | 'large'
}>(), {
  size: 'medium',
})

const copied = ref(false)

function handleClick() {
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<style scoped>
.copy-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  color: var(--fgColor-muted, #59636e);
  cursor: pointer;
  border-radius: 4px;
  background-color: transparent;
}

.copy-button[data-size='small'] {
  width: 28px;
  height: 28px;
}

.copy-button[data-size='medium'] {
  width: 32px;
  height: 32px;
}

.copy-button[data-size='large'] {
  width: 40px;
  height: 40px;
}

.copy-button svg[data-size='small'],
.copy-button svg[data-size='medium'] {
  width: 16px;
  height: 16px;
}

.copy-button svg[data-size='large'] {
  width: 20px;
  height: 20px;
}

.copy-button:hover {
  color: var(--fgColor-default, #1f2328);
}
</style>