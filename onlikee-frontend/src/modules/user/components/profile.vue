<template>
  <div class="profile-markdown" v-if="profileMarkdown !== undefined">
    <div class="markdown-header">
      <div>{{ profile.nickname }} / README.md</div>
      <Button
        v-if="isOwn && profileMarkdown !== undefined && profileMarkdown !== null"
        variant="link"
        @click="openMarkdownDialog"
      >
        编辑
      </Button>
    </div>
    <div class="markdown-content">
      <!-- eslint-disable vue/no-v-html -->
      <div
        v-if="typeof profileMarkdown === 'string' && profileMarkdown !== ''"
        class="markdown-body profile-readme"
        v-html="renderedProfileMarkdown"
      />
      <!-- eslint-enable vue/no-v-html -->
      <Blankslate
        v-else-if="profileMarkdown !== undefined"
        narrow
      >
        <Blankslate.Visual>
          <RepoTemplateIcon />
        </Blankslate.Visual>
        <Blankslate.Heading>
          {{ isOwn ? '编写你的 README' : '' }}
        </Blankslate.Heading>
        <Blankslate.Description>
          {{ isOwn ? '用 Markdown 介绍你自己、项目和正在做的事情。让所有人认识你。' : '空空如也' }}
        </Blankslate.Description>
        <Blankslate.PrimaryAction
          v-if="isOwn"
          @click="openMarkdownDialog"
        >
          现在开始
        </Blankslate.PrimaryAction>
      </Blankslate>
    </div>
  </div>
  <Dialog
    v-model:open="markdownDialogOpen"
    title="编辑 README"
    subtitle="使用 Markdown 编写你的个人资料内容。"
    size="xlarge"
  >
    <Dialog.Body>
      <div class="markdown-editor">
        <div class="markdown-editor__toolbar">
          <Button
            :variant="markdownMode === 'edit' ? 'primary' : 'default'"
            size="small"
            @click="markdownMode = 'edit'"
          >
            编辑
          </Button>
          <Button
            :variant="markdownMode === 'preview' ? 'primary' : 'default'"
            size="small"
            @click="markdownMode = 'preview'"
          >
            预览
          </Button>
          <span
            class="markdown-editor__count"
            :data-invalid="markdownDraft.length > 20000"
          >
            {{ markdownDraft.length }} / 20000 字符
          </span>
        </div>
        <Textarea
          v-if="markdownMode === 'edit'"
          v-model="markdownDraft"
          class="markdown-editor__textarea"
          rows="16"
          :maxlength="20000"
          placeholder="用 Markdown 介绍你自己、项目和正在做的事情。"
          autofocus
        />
        <div
          v-else
          class="markdown-editor__preview"
        >
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="markdownDraft"
            class="markdown-body markdown-editor__preview-body"
            v-html="renderedDraftMarkdown"
          />
          <!-- eslint-enable vue/no-v-html -->
          <div
            v-else
            class="markdown-editor__empty"
          >
            暂无可预览内容。
          </div>
        </div>
      </div>
    </Dialog.Body>
    <Dialog.Footer>
      <Button
        @click="markdownDialogOpen = false"
      >
        取消
      </Button>
      <Button
        :variant="'primary'"
        :loading="markdownSaving"
        :disabled="markdownDraft.length > 20000"
        @click="saveMarkdown"
      >
        保存
      </Button>
    </Dialog.Footer>
  </Dialog>
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { computed, onMounted, ref } from 'vue'
import 'github-markdown-css/github-markdown-light.css'
import { Blankslate } from '@/components/z-ui/Blankslate'
import { Banner } from '@/components/z-ui/Banner'
import { Button } from '@/components/z-ui/Button'
import { Dialog } from '@/components/z-ui/Dialog'
import { Textarea } from '@/components/z-ui/Textarea'
import { RepoTemplateIcon } from '@/components/octicons-vue3'
import { getPublicUserMarkdown, saveCurrentUserMarkdown, type UserProfile } from '../api/user'

const props = defineProps<{
  profile: UserProfile
  isOwn: boolean
}>()

const profileMarkdown = ref<string | null | undefined>(undefined)
const markdownDialogOpen = ref(false)
const markdownDraft = ref('')
const markdownMode = ref<'edit' | 'preview'>('edit')
const markdownSaving = ref(false)

const fetchProfileMarkdown = async () => {
  try {
    const response = await getPublicUserMarkdown(props.profile.nickname)
    profileMarkdown.value = response.markdown
  } catch {
    profileMarkdown.value = null
  }
}

const renderMarkdown = (content: string) => {
  const html = marked.parse(content, {
    gfm: true,
    breaks: false,
    async: false
  })
  return DOMPurify.sanitize(html)
}

const renderedProfileMarkdown = computed(() => {
  return renderMarkdown(profileMarkdown.value ?? '')
})

const renderedDraftMarkdown = computed(() => {
  return renderMarkdown(markdownDraft.value)
})

const openMarkdownDialog = () => {
  markdownDraft.value = profileMarkdown.value ?? ''
  markdownMode.value = 'edit'
  markdownDialogOpen.value = true
}

const saveMarkdown = async () => {
  if (markdownSaving.value) {
    return
  }

  if (markdownDraft.value.length > 20000) {
    Banner.warning('README 不得超过20000个字符。')
    return
  }

  markdownSaving.value = true
  try {
    await saveCurrentUserMarkdown({ content: markdownDraft.value })
    profileMarkdown.value = markdownDraft.value
    markdownDialogOpen.value = false
    Banner.success('保存成功。')
  } finally {
    markdownSaving.value = false
  }
}

onMounted(async () => {
  await fetchProfileMarkdown()
})
</script>

<style scoped>
.profile-markdown {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
  background: var(--bgColor-default);
}

.markdown-header {
  display: flex;
  margin-bottom: 16px;
  color: var(--fgColor-default);
  font-size: 12px;
  justify-content: space-between;
  align-items: center;
  line-height: 20px;
}

.markdown-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.profile-readme {
  align-self: stretch;
  min-width: 0;
  width: 100%;
}

.markdown-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.markdown-editor__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.markdown-editor__count {
  margin-left: auto;
  color: var(--fgColor-muted);
  font-size: 12px;
  white-space: nowrap;
}

.markdown-editor__count[data-invalid='true'] {
  color: var(--fgColor-danger);
}

.markdown-editor__textarea {
  width: 100%;
  min-height: 360px;
  resize: vertical;
}

.markdown-editor__preview {
  box-sizing: border-box;
  height: 360px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 12px;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
  background: var(--bgColor-default);
  scrollbar-color: var(--fgColor-muted, #59636e) transparent;
}

.markdown-editor__preview-body {
  min-width: 0;
}

.markdown-editor__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  color: var(--fgColor-muted);
  font-size: 14px;
}
</style>
