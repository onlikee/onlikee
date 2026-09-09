<template>
  <div class="demo-block">
    <div class="demo-content">
      <slot />
    </div>
    <div class="demo-actions">
      <Tooltip
        :content="codeCopied ? copiedLabel : copyLabel"
        placement="bottom"
      >
        <CopyButton @click="copyCode" />
      </Tooltip>
      <Tooltip
        :content="codeVisible ? hideCodeLabel : showCodeLabel"
        placement="bottom"
      >
        <button
          class="action-btn"
          @click="codeVisible = !codeVisible"
        >
          <CodeIcon />
        </button>
      </Tooltip>
    </div>
    <transition name="code-expand">
      <div
        v-if="codeVisible"
        class="demo-code"
      >
        <!-- eslint-disable vue/no-v-html -->
        <div
          class="code-content"
          v-html="highlightedCode"
        />
        <!-- eslint-enable vue/no-v-html -->
        <div class="code-footer">
          <button
            class="hide-code-btn"
            @click="codeVisible = false"
          >
            {{ hideSourceLabel }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Tooltip } from '@/components/primer-vue/Tooltip'
import { CodeIcon } from '@/components/octicons-vue3/index.ts'
import { CopyButton } from '@/components/primer-vue/CopyButton'

const props = defineProps<{ code: string }>()

const copyLabel = '复制代码'
const copiedLabel = '已复制'
const showCodeLabel = '查看代码'
const hideCodeLabel = '隐藏代码'
const hideSourceLabel = '隐藏源代码'

const codeVisible = ref(false)
const codeCopied = ref(false)

import { codeToHtml } from 'shiki'
const highlightedCode = ref('')
onMounted(async () => {
  highlightedCode.value = await codeToHtml(props.code, {
    lang: 'vue',
    theme: 'github-light',
  })
})

const copyCode = () => {
  navigator.clipboard.writeText(props.code).then(() => {
    codeCopied.value = true
    window.setTimeout(() => {
      codeCopied.value = false
    }, 2000)
  })
}
</script>

<style scoped>
.demo-block {
  border: 1px solid var(--borderColor-default);
  border-radius: 4px;
}

.demo-content {
  box-sizing: border-box;
  min-height: 160px;
  padding: 2rem;
  display: flex;
  align-items: center;
}

.demo-actions {
  display: flex;
  gap: 0;
  border-top: 1px solid var(--borderColor-default);
  justify-content: flex-end;
  padding: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  color: var(--fgColor-muted);
  cursor: pointer;
  border-radius: 4px;
  background-color: transparent;
}

.action-btn:hover {
  color: var(--fgColor-default);
}

.demo-code {
  background: var(--bgColor-muted);
  border-radius: 0 0 6px 6px;
  overflow: hidden;
}

.code-expand-enter-active,
.code-expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 1000px;
}

.code-expand-enter-from,
.code-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.code-footer {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  border-top: 1px solid var(--borderColor-default);
  background: var(--bgColor-default);
  border-radius: 0 0 6px 6px;
}

.hide-code-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--bgColor-transparent);
  border: none;
  color: var(--fgColor-muted);
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.hide-code-btn:hover {
  color: var(--fgColor-link);
}

.code-content :deep(pre.shiki) {
  margin: 0;
  overflow-x: auto;
  background: var(--bgColor-transparent) !important;
}

.code-content :deep(pre.shiki code) {
  display: inline-block;
  min-width: 100%;
  box-sizing: border-box;
  padding: 1.5rem;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--fgColor-default);
  white-space: pre;
  background: var(--bgColor-transparent);
}

@media (max-width: 768px) {
  .demo-content {
    padding: 1.25rem;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }

  .code-content :deep(pre.shiki) {
    padding: 0;
  }

  .code-content :deep(pre.shiki code) {
    padding: 1rem;
    font-size: 0.75rem;
    line-height: 1.5;
  }

  .code-footer {
    padding: 0.625rem;
  }

  .hide-code-btn {
    font-size: 0.8125rem;
  }
}
</style>
