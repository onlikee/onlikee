<script setup lang="ts">
import { computed, ref } from 'vue'
import { FormControl } from '@/components/primer-vue/FormControl'
import Autocomplete, { type AutocompleteMenuItem } from '@/components/primer-vue/Autocomplete'
import TextInputWithTokens from '@/components/primer-vue/TextInputWithTokens'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const items = [
  { id: 'javascript', text: 'JavaScript' }, { id: 'typescript', text: 'TypeScript' },
  { id: 'python', text: 'Python' }, { id: 'rust', text: 'Rust' }, { id: 'ruby', text: 'Ruby' }
]
const value = ref('')
const selectedIds = ref<string[]>([])
const filterValue = ref('')
const multipleIds = ref<string[]>(['typescript'])
const tokens = computed(() => items.filter(item => multipleIds.value.includes(item.id)))
function select(selected: AutocompleteMenuItem | AutocompleteMenuItem[]) {
  value.value = (Array.isArray(selected) ? selected[0] : selected)?.text ?? ''
}
function removeToken(id: string | number) { multipleIds.value = multipleIds.value.filter(selected => selected !== id) }
const singleCode = `<FormControl id="language">
  <FormControl.Label id="language-label">语言</FormControl.Label>
  <Autocomplete>
    <Autocomplete.Input v-model:value="value" />
    <Autocomplete.Overlay>
      <Autocomplete.Menu :items="items" v-model:selected-item-ids="selectedIds"
        aria-labelledby="language-label" @selected-change="select" />
    </Autocomplete.Overlay>
  </Autocomplete>
  <FormControl.Caption>输入文字筛选，方向键选择，Enter 确认。</FormControl.Caption>
</FormControl>`
const multipleCode = `<Autocomplete>
  <Autocomplete.Input :as="TextInputWithTokens" :tokens="tokens"
    v-model:value="filterValue" @token-remove="removeToken" />
  <Autocomplete.Overlay>
    <Autocomplete.Menu :items="items" v-model:selected-item-ids="multipleIds"
      selection-variant="multiple" aria-labelledby="languages-label" />
  </Autocomplete.Overlay>
</Autocomplete>`
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Autocomplete 自动补全"
      description="组合输入框、列表和弹层，支持前缀筛选、内联建议、键盘导航以及单选和多选。"
    />
    <ComponentDocsSection title="单选与 FormControl">
      <template #description>
        输入文字后显示建议，ArrowUp / ArrowDown 移动选项，Home / End 跳到首尾，Enter 选择，Escape 清空并关闭。焦点始终保留在输入框。
      </template>
      <ComponentDocsDemoBlock :code="singleCode">
        <FormControl id="docs-language">
          <FormControl.Label id="docs-language-label">
            语言
          </FormControl.Label>
          <Autocomplete>
            <Autocomplete.Input
              v-model:value="value"
              placeholder="输入语言名称"
            />
            <Autocomplete.Overlay>
              <Autocomplete.Menu
                v-model:selected-item-ids="selectedIds"
                :items="items"
                aria-labelledby="docs-language-label"
                @selected-change="select"
              />
            </Autocomplete.Overlay>
          </Autocomplete>
          <FormControl.Caption>例如输入 “Ru” 查找 Rust 和 Ruby。</FormControl.Caption>
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="多选与 Token">
      <template #description>
        多选后列表保持打开。空输入框中的 Backspace 将最后一个 Token 还原为可编辑文本；聚焦 Token 后可用 Backspace / Delete 移除。
      </template>
      <ComponentDocsDemoBlock :code="multipleCode">
        <FormControl id="docs-languages">
          <FormControl.Label id="docs-languages-label">
            使用的语言
          </FormControl.Label>
          <Autocomplete>
            <Autocomplete.Input
              v-model:value="filterValue"
              :as="TextInputWithTokens"
              :tokens="tokens"
              placeholder="添加语言"
              @token-remove="removeToken"
            />
            <Autocomplete.Overlay>
              <Autocomplete.Menu
                v-model:selected-item-ids="multipleIds"
                :items="items"
                selection-variant="multiple"
                aria-labelledby="docs-languages-label"
              />
            </Autocomplete.Overlay>
          </Autocomplete>
          <FormControl.Caption>已选择：{{ tokens.map(token => token.text).join('、') || '无' }}</FormControl.Caption>
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection
      title="接口说明"
      variant="api"
    >
      <p>Autocomplete 提供 Context、Input、Menu、Overlay。Input 支持 TextInput 属性及 as；Menu 接收 items、selectedItemIds、selectionVariant、filterFn、sortOnCloseFn、loading、emptyStateText、addNewItem；Overlay 接收 menuAnchorRef 和弹层属性。</p>
      <p>selected-change 的参数为选中项数组，update:selectedItemIds 支持命名双向绑定。单选切换时使用新的选中项替换旧项。节点型视觉属性可传组件、VNode 或同名具名插槽。</p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
