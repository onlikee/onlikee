<script setup lang="ts">
import { computed, shallowRef, useId } from 'vue'
import { GitBranchIcon } from '@onlikee/octicons-vue'
import { Token, IssueLabelToken, type TokenSizeKeys } from '@/components/primer-vue/Token'
import { LabelGroup } from '@/components/primer-vue/LabelGroup'
import Autocomplete from '@/components/primer-vue/Autocomplete'
import TextInputWithTokens from '@/components/primer-vue/TextInputWithTokens'
import { Button } from '@/components/primer-vue/Button'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'

const id = useId()
const sizes: TokenSizeKeys[] = ['small', 'medium', 'large', 'xlarge']
const colors = ['#0366d6', 'lightpink', '#98afa7', '#573807', '#D6F2DE', '#161E37']
const tokens = shallowRef(['Vue', 'TypeScript', 'Vite'])
const clicks = shallowRef(0)
const removable = shallowRef(true)
const items = [
  { id: 'vue', text: 'Vue' },
  { id: 'typescript', text: 'TypeScript' },
  { id: 'vite', text: 'Vite' },
]
const selected = shallowRef(['vue', 'typescript'])
const filter = shallowRef('')
const selectedTokens = computed(() => items.filter((item) => selected.value.includes(item.id)))
function removeSelected(tokenId: string | number) {
  selected.value = selected.value.filter((value) => value !== tokenId)
}
const basicCode = `<Token text="main" :leading-visual="GitBranchIcon" />
<Token text="Selected" is-selected />
<Token as="a" href="#details" text="Link" />`
const removeCode = `<Token v-for="text in tokens" :key="text" as="button" :text="text"
  @click="clicks++" @remove="tokens = tokens.filter(item => item !== text)" />`
const colorCode = `<IssueLabelToken text="good first issue" fill-color="#0366d6" />
<IssueLabelToken as="a" href="#issue" text="help wanted" fill-color="lightpink" />`
const groupCode = `<LabelGroup :visible-child-count="2" overflow-style="inline">
  <Token v-for="text in ['One', 'Two', 'Three', 'Four']" :key="text" as="button" :text="text" />
</LabelGroup>`
const inputCode = `<Autocomplete>
  <Autocomplete.Input :as="TextInputWithTokens" :tokens="selectedTokens"
    v-model:value="filter" aria-labelledby="language-label" @token-remove="removeSelected" />
  <Autocomplete.Overlay>
    <Autocomplete.Menu :items="items" v-model:selected-item-ids="selected"
      selection-variant="multiple" aria-labelledby="language-label" />
  </Autocomplete.Overlay>
</Autocomplete>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性', rowHeader: true, minWidth: '170px' },
  { field: 'type', header: '类型', minWidth: '180px' },
  { field: 'default', header: '默认值', minWidth: '100px' },
  { field: 'description', header: '说明', minWidth: '300px' },
]
const rows = [
  {
    id: 'text',
    name: 'text',
    type: 'VNodeChild',
    default: '必填',
    description: '显示的文字或 Vue 节点。内容通过 text 传入。',
  },
  {
    id: 'as',
    name: 'as',
    type: "'span' | 'a' | 'button'",
    default: 'span',
    description:
      '交互元素类型；同时可交互和可移除时，外层为 span，内层文字承接 as、href 和 click。',
  },
  {
    id: 'id',
    name: 'id',
    type: 'number | string',
    default: '-',
    description: '根元素标识符；数字转换为字符串。',
  },
  {
    id: 'size',
    name: 'size',
    type: "'small' | 'medium' | 'large' | 'xlarge'",
    default: 'medium',
    description: '高度分别为 16、20、24、32px。',
  },
  {
    id: 'remove',
    name: 'onRemove / @remove',
    type: '() => void',
    default: '-',
    description: '点击移除按钮或按 Backspace / Delete 时调用，由调用方移除数据。',
  },
  {
    id: 'hide',
    name: 'hideRemoveButton',
    type: 'boolean',
    default: 'false',
    description: '隐藏移除按钮，仍保留键盘移除行为。',
  },
  {
    id: 'selected',
    name: 'isSelected',
    type: 'boolean',
    default: 'undefined',
    description: '选中态样式。',
  },
  {
    id: 'disabled',
    name: 'disabled',
    type: 'boolean',
    default: 'undefined',
    description: '遵循参考实现：影响根元素及光标，不单独阻止移除回调。',
  },
  {
    id: 'leading',
    name: 'leadingVisual',
    type: 'Component | 原生标签名',
    default: '-',
    description: 'Token 的前置视觉组件，small 尺寸不显示。',
  },
  {
    id: 'fill',
    name: 'fillColor',
    type: 'string',
    default: '#999',
    description: 'IssueLabelToken 的颜色；支持 hex、rgb、hsl 和命名颜色，并根据主题计算样式。',
  },
  {
    id: 'native',
    name: '原生属性 / className',
    type: 'HTMLAttributes',
    default: '-',
    description: '支持 href、type、tabindex、ARIA、事件和 style。ref.element 指向根 DOM。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Token 标签令牌"
      description="展示可选择或移除的项目，包含通用 Token 和支持自定义颜色的 IssueLabelToken。"
    />
    <ComponentDocsSection title="基础用法与尺寸">
      <ComponentDocsDemoBlock :code="basicCode">
        <div class="token-row">
          <Token text="main" :leading-visual="GitBranchIcon" /><Token
            text="Selected"
            is-selected
          /><Token as="a" href="#token-details" text="Link" />
        </div>
        <div class="token-row">
          <Token
            v-for="size in sizes"
            :key="size"
            :size="size"
            :text="size"
            :leading-visual="GitBranchIcon"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="移除与独立操作目标">
      <template #description
        >可移除 Token 支持 Backspace 和
        Delete。移除按钮会停止点击冒泡，文字区域仍保留原有点击或链接行为。</template
      >
      <ComponentDocsDemoBlock :code="removeCode">
        <div class="token-row" data-testid="removable-tokens">
          <Token
            v-for="text in tokens"
            :key="text"
            as="button"
            :text="text"
            @click="clicks++"
            @remove="tokens = tokens.filter((item) => item !== text)"
          />
        </div>
        <p data-testid="token-clicks">文字操作次数：{{ clicks }}</p>
        <Button size="small" @click="tokens = ['Vue', 'TypeScript', 'Vite']">恢复 Token</Button>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="动态移除回调">
      <ComponentDocsDemoBlock
        code='<Token text="动态令牌" v-bind="removable ? { onRemove: handleRemove } : {}" />'
      >
        <div class="token-row">
          <Token
            text="动态令牌"
            v-bind="removable ? { onRemove: () => (removable = false) } : {}"
            data-testid="dynamic-token"
          /><Button size="small" @click="removable = !removable">切换可移除状态</Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="IssueLabelToken 颜色与主题">
      <ComponentDocsDemoBlock :code="colorCode"
        ><div class="token-row">
          <IssueLabelToken
            v-for="color in colors"
            :key="color"
            :text="color"
            :fill-color="color"
          /><IssueLabelToken text="Selected" fill-color="#0366d6" is-selected /></div
      ></ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="与 LabelGroup 组合">
      <ComponentDocsDemoBlock :code="groupCode"
        ><LabelGroup :visible-child-count="2" overflow-style="inline"
          ><Token
            v-for="text in ['One', 'Two', 'Three', 'Four']"
            :key="text"
            as="button"
            :text="text" /></LabelGroup
      ></ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="与 TextInputWithTokens 和 Autocomplete 组合">
      <template #description
        >方向键在输入框和 Token 间移动，Backspace / Delete 移除聚焦的 Token。自动补全的选中列表与
        Token 数据由调用方同步。</template
      >
      <ComponentDocsDemoBlock :code="inputCode">
        <div class="input-demo">
          <span :id="`${id}-languages`">使用的语言</span>
          <Autocomplete>
            <Autocomplete.Input
              v-model:value="filter"
              :as="TextInputWithTokens"
              :tokens="selectedTokens"
              :aria-labelledby="`${id}-languages`"
              placeholder="添加语言"
              @token-remove="removeSelected"
            />
            <Autocomplete.Overlay
              ><Autocomplete.Menu
                v-model:selected-item-ids="selected"
                :items="items"
                selection-variant="multiple"
                :aria-labelledby="`${id}-languages`"
            /></Autocomplete.Overlay>
          </Autocomplete>
          <p data-testid="selected-languages">
            已选择：{{ selectedTokens.map((token) => token.text).join('、') || '无' }}
          </p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api"
      ><VisuallyHidden :id="`${id}-api`">Token 与 IssueLabelToken 属性</VisuallyHidden
      ><ComponentDocsTable :aria-labelledby="`${id}-api`" :columns="columns" :data="rows"
    /></ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.token-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.input-demo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 480px;
}
</style>
