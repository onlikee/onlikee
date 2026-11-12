<script setup lang="ts">
import { ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import TextInputWithTokens from '@/components/primer-vue/TextInputWithTokens'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const value = ref('')
const tokens = ref([
  { id: 'vue', text: 'Vue' },
  { id: 'typescript', text: 'TypeScript' },
  { id: 'vite', text: 'Vite' },
])
function remove(id: string | number) {
  tokens.value = tokens.value.filter((token) => token.id !== id)
}
function add(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.isComposing || !value.value.trim()) return
  event.preventDefault()
  const text = value.value.trim()
  tokens.value = [...tokens.value, { id: `${text}-${tokens.value.length}`, text }]
  value.value = ''
}
const code = `<FormControl>
  <FormControl.Label>标签</FormControl.Label>
  <TextInputWithTokens v-model:value="value" :tokens="tokens"
    :visible-token-count="2" @token-remove="remove" @keydown="add" />
  <FormControl.Caption>输入标签后按 Enter 添加。</FormControl.Caption>
</FormControl>`
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="TextInputWithTokens 标签输入"
      description="在原生输入框中呈现可移除 Token，支持键盘焦点导航、折叠与自定义 Token 组件。"
    />
    <ComponentDocsSection title="添加、移除与折叠">
      <template #description>
        输入文字后按 Enter 添加。聚焦输入框会展开折叠的 Token；左右方向键在 Token 间移动；Escape
        返回输入框；Backspace / Delete 移除聚焦 Token。
      </template>
      <ComponentDocsDemoBlock :code="code">
        <FormControl>
          <FormControl.Label>项目标签</FormControl.Label>
          <TextInputWithTokens
            v-model:value="value"
            :tokens="tokens"
            :visible-token-count="2"
            placeholder="输入标签"
            @token-remove="remove"
            @keydown="add"
          />
          <FormControl.Caption
            >当前标签：{{
              tokens.map((token) => token.text).join('、') || '无'
            }}</FormControl.Caption
          >
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="尺寸与禁用">
      <ComponentDocsDemoBlock code='<TextInputWithTokens :tokens="tokens" size="small" disabled />'>
        <TextInputWithTokens :tokens="tokens" size="small" disabled />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="接口" variant="api">
      <p>
        tokens 为 Token 属性数组。token-remove 传递被移除的 ID，组件保留 tokens 的受控状态。value /
        defaultValue 管理输入文本，v-model:value 监听 update:value。
      </p>
      <p>
        size 支持 small、medium、large、xlarge；visibleTokenCount 控制折叠数量；preventTokenWrapping
        控制换行；maxHeight 限制高度；hideTokenRemoveButtons 隐藏移除按钮；tokenComponent 替换默认
        Token。支持 TextInput 的视觉、加载、校验与尺寸属性。
      </p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
