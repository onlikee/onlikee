<template>
  <form class="collect-form" @submit.prevent>
    <FormControl required>
      <FormControl.Label> 应用名称 </FormControl.Label>
      <TextInput
        block
        :value="collectName"
        placeholder="请输入应用名称"
        maxlength="100"
        @update:value="(value) => emit('update:collect-name', value)"
      />
      <FormControl.Validation v-if="collectNameError" variant="error">
        {{ collectNameError }}
      </FormControl.Validation>
    </FormControl>

    <FormControl required>
      <FormControl.Label> 网站地址 </FormControl.Label>
      <TextInput
        block
        :value="collectUrl"
        placeholder="请输入网站地址"
        @update:value="(value) => emit('update:collect-url', value)"
      />
      <FormControl.Validation v-if="collectUrlError" variant="error">
        {{ collectUrlError }}
      </FormControl.Validation>
    </FormControl>

    <section class="visibility-panel">
      <div class="visibility-text">
        <h4 class="visibility-title">选择可见性 *</h4>
        <p class="visibility-caption">选择你的应用公开的还是私有的。</p>
      </div>

      <div class="visibility-select-wrap">
        <AnchoredOverlay
          :open="visibilityOpen"
          :render-anchor="renderVisibilityAnchor"
          width="medium"
          align="end"
          :overlay-props="{ role: 'dialog', 'aria-label': '选择可见性' }"
          :close-button-props="{ 'aria-label': '关闭可见性选择' }"
          :focus-zone-settings="{ disabled: true }"
          @open="visibilityOpen = true"
          @close="visibilityOpen = false"
        >
          <div class="visibility-options">
            <ActionList role="listbox" aria-label="选择选项" selection-variant="single">
              <ActionList.Item
                v-for="item in visibilityOptions"
                :key="item.label"
                :selected="props.collectVisibility === item.label"
                @select="selectVisibility(item.label)"
              >
                <ActionList.LeadingVisual><component :is="item.icon" /></ActionList.LeadingVisual>
                {{ item.label }}
                <ActionList.Description variant="block">{{
                  item.description
                }}</ActionList.Description>
              </ActionList.Item>
            </ActionList>
          </div>
        </AnchoredOverlay>
      </div>
    </section>

    <FormControl required>
      <FormControl.Label> 应用描述 </FormControl.Label>
      <Textarea
        block
        :value="collectDescription"
        placeholder="请输入应用描述"
        maxlength="1000"
        rows="7"
        @update:value="(value) => emit('update:collect-description', value)"
      />
      <FormControl.Validation v-if="collectDescriptionError" variant="error">
        {{ collectDescriptionError }}
      </FormControl.Validation>
      <FormControl.Caption>
        {{ `${collectDescription.length} / 1000` }}
      </FormControl.Caption>
    </FormControl>
  </form>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import { TextInput } from '@/components/primer-vue/TextInput'
import { Textarea } from '@/components/primer-vue/Textarea'
import { Button } from '@/components/primer-vue/Button'
import { AnchoredOverlay, type AnchorRenderProps } from '@/components/primer-vue/AnchoredOverlay'
import { ActionList } from '@/components/primer-vue/ActionList'
import RepoIcon from '@onlikee/octicons-vue/icons/repo'
import TriangleDownIcon from '@onlikee/octicons-vue/icons/triangle-down'
import LockIcon from '@onlikee/octicons-vue/icons/lock'

interface Props {
  collectName: string
  collectUrl: string
  collectVisibility: string
  collectDescription: string
  collectNameError?: string
  collectUrlError?: string
  collectDescriptionError?: string
}

const props = withDefaults(defineProps<Props>(), {
  collectNameError: '',
  collectUrlError: '',
  collectDescriptionError: '',
})

const emit = defineEmits<{
  'update:collect-name': [value: string]
  'update:collect-url': [value: string]
  'update:collect-visibility': [value: string]
  'update:collect-description': [value: string]
}>()

const visibilityOptions = [
  {
    label: '公开的',
    description: '你的应用被公开，所有人都能够在应用广场上看见它。',
    icon: RepoIcon,
  },
  {
    label: '私有的',
    description: '你可以在个人应用中查看和管理它。当然别人也可以通过URL进行访问。',
    icon: LockIcon,
  },
]

const visibilityOpen = ref(false)
function selectVisibility(value: string) {
  emit('update:collect-visibility', value)
  visibilityOpen.value = false
}
const renderVisibilityAnchor = (anchorProps: AnchorRenderProps) =>
  h(
    Button,
    {
      ...anchorProps,
      type: 'button',
      'aria-haspopup': 'dialog',
      leadingVisual: props.collectVisibility === '私有的' ? LockIcon : RepoIcon,
      trailingVisual: TriangleDownIcon,
    },
    () => props.collectVisibility,
  )
</script>

<style scoped>
.collect-form {
  display: grid;
  gap: 12px;
}

.visibility-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--borderColor-muted);
  border-radius: 6px;
  background: var(--bgColor-default);
}

.visibility-text {
  min-width: 0;
}

.visibility-title {
  margin: 0;
  color: var(--fgColor-default);
  font-size: 14px;
  font-weight: 600;
}

.visibility-caption {
  margin: 2px 0 0;
  color: var(--fgColor-muted);
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .visibility-panel {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
