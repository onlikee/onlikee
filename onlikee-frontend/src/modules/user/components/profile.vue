<template>
  <div v-if="profileMarkdown !== undefined" class="profile-markdown">
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
      <Blankslate v-else-if="profileMarkdown !== undefined" narrow>
        <Blankslate.Visual>
          <RepoTemplateIcon aria-hidden="true" />
        </Blankslate.Visual>
        <Blankslate.Heading>
          {{ isOwn ? '编写你的 README' : '' }}
        </Blankslate.Heading>
        <Blankslate.Description>
          {{ isOwn ? '用 Markdown 介绍你自己、项目和正在做的事情。让所有人认识你。' : '空空如也' }}
        </Blankslate.Description>
        <Blankslate.PrimaryAction v-if="isOwn" @click="openMarkdownDialog">
          现在开始
        </Blankslate.PrimaryAction>
      </Blankslate>
    </div>
  </div>
  <VisuallyHidden role="status">{{ markdownStatus }}</VisuallyHidden>
  <Dialog
    v-if="markdownDialogOpen"
    :on-close="() => (markdownDialogOpen = false)"
    title="编辑 README"
    subtitle="使用 Markdown 编写你的个人资料内容。"
    width="1024px"
  >
    <Dialog.Body>
      <div class="markdown-editor">
        <Banner
          v-if="markdownSaveError"
          ref="markdownErrorBanner"
          variant="critical"
          title="README 保存失败"
          :description="markdownSaveError"
        />
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
          <span class="markdown-editor__count" :data-invalid="markdownDraft.length > 20000">
            {{ markdownDraft.length }} / 20000 字符
          </span>
        </div>
        <FormControl v-if="markdownMode === 'edit'">
          <FormControl.Label visually-hidden>README 内容</FormControl.Label>
          <Textarea
            v-model:value="markdownDraft"
            class="markdown-editor__textarea"
            block
            resize="vertical"
            :maxlength="20000"
            placeholder="用 Markdown 介绍你自己、项目和正在做的事情。"
            autofocus
          />
          <FormControl.Validation v-if="markdownDraftError" variant="error">
            {{ markdownDraftError }}
          </FormControl.Validation>
        </FormControl>
        <div v-else class="markdown-editor__preview">
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="markdownDraft"
            class="markdown-body markdown-editor__preview-body"
            v-html="renderedDraftMarkdown"
          />
          <!-- eslint-enable vue/no-v-html -->
          <div v-else class="markdown-editor__empty">暂无可预览内容。</div>
        </div>
      </div>
    </Dialog.Body>
    <Dialog.Footer>
      <Button @click="markdownDialogOpen = false"> 取消 </Button>
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
import { computed, nextTick, onMounted, ref } from 'vue'
import 'github-markdown-css/github-markdown-light.css'
import { Blankslate } from '@/components/primer-vue/Blankslate'
import { Banner, type BannerInstance } from '@/components/primer-vue/Banner'
import { Button } from '@/components/primer-vue/Button'
import { Dialog } from '@/components/primer-vue/Dialog'
import { Textarea } from '@/components/primer-vue/Textarea'
import { FormControl } from '@/components/primer-vue/FormControl'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import { RepoTemplateIcon } from '@onlikee/octicons-vue'
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
const markdownSaveError = ref('')
const markdownStatus = ref('')
const markdownErrorBanner = ref<BannerInstance | null>(null)
const markdownDraftError = computed(() =>
  markdownDraft.value.length > 20000 ? 'README 不得超过20000个字符。' : '',
)

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
    async: false,
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
  markdownSaveError.value = ''
  markdownStatus.value = ''
  markdownDraft.value = profileMarkdown.value ?? ''
  markdownMode.value = 'edit'
  markdownDialogOpen.value = true
}

const saveMarkdown = async () => {
  if (markdownSaving.value) {
    return
  }

  markdownSaveError.value = ''
  markdownStatus.value = ''
  if (markdownDraftError.value) return

  markdownSaving.value = true
  try {
    await saveCurrentUserMarkdown({ content: markdownDraft.value })
    profileMarkdown.value = markdownDraft.value
    markdownDialogOpen.value = false
    markdownStatus.value = 'README 已保存。'
  } catch (error) {
    markdownSaveError.value =
      error instanceof Error ? error.message : 'README 保存失败，请稍后重试。'
    await nextTick()
    markdownErrorBanner.value?.element?.focus()
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
}

.markdown-editor__textarea :deep(textarea) {
  height: 480px;
}

.markdown-editor__preview {
  box-sizing: border-box;
  height: 480px;
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
