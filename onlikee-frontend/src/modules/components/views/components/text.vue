<script setup lang="ts">
import {
  Text,
  type TextSize,
  type TextWeight,
  type TextWhiteSpace,
} from '@/components/primer-vue/Text'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '../../components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '../../components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '../../components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '../../components/ComponentDocsPage/ComponentDocsSection.vue'

const sizes: TextSize[] = ['small', 'medium', 'large']
const weights: TextWeight[] = ['light', 'normal', 'medium', 'semibold']
const whiteSpaces: TextWhiteSpace[] = ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line']
const whitespaceSample =
  '第一行  含有连续空格\n第二行文字较长，可以观察文本在有限宽度中的换行方式。'

const codes = {
  basic: `<Text>用于展示文本内容。</Text>`,
  sizes: `<Text size="small">小号文本</Text>
<Text size="medium">中号文本</Text>
<Text size="large">大号文本</Text>`,
  weights: `<Text weight="light">轻量字重</Text>
<Text weight="normal">常规字重</Text>
<Text weight="medium">中等字重</Text>
<Text weight="semibold">半粗字重</Text>`,
  elements: `<Text as="p">段落文本</Text>
<Text as="em">强调文本</Text>
<Text as="strong">重要文本</Text>
<Text as="a" href="#属性">查看属性</Text>`,
  whitespace: `<Text white-space="pre-wrap">{{ '第一行  含有连续空格\\n第二行文字较长，可以观察文本在有限宽度中的换行方式。' }}</Text>`,
  custom: `<Text size="small" class="highlight-text">自定义颜色与背景</Text>

<style scoped>
.highlight-text {
  padding: 8px 12px;
  color: var(--fgColor-onEmphasis, #ffffff);
  background-color: var(--bgColor-neutral-emphasis, #59636e);
  border-radius: 6px;
}
</style>`,
}

const columns: TableColumn[] = [
  { key: 'name', label: '名称', rowHeader: true },
  { key: 'type', label: '类型', wrap: true },
  { key: 'default', label: '默认值' },
  { key: 'description', label: '说明', wrap: true },
]
const rows = [
  {
    name: 'as',
    type: 'string | Component',
    default: 'span',
    description: '渲染的元素或组件，支持对应属性与事件透传',
  },
  {
    name: 'size',
    type: "'small' | 'medium' | 'large'",
    default: '—',
    description: '同时设置字号与行高；未设置时继承上下文',
  },
  {
    name: 'weight',
    type: "'light' | 'normal' | 'medium' | 'semibold'",
    default: '—',
    description: '设置字重；未设置时保留元素的默认字重或继承上下文',
  },
  {
    name: 'whiteSpace',
    type: "'pre' | 'normal' | 'nowrap' | 'pre-wrap' | 'pre-line'",
    default: '—',
    description: '控制空格、换行符和自动换行；未设置时继承上下文',
  },
  {
    name: 'class / className',
    type: 'string',
    default: '—',
    description: '添加自定义样式类，可覆盖字号、字重等样式',
  },
]
const instanceRows = [
  {
    name: 'element',
    type: 'HTMLElement | SVGElement | ComponentPublicInstance | null',
    default: 'null',
    description: '通过模板 ref 访问根元素；as 为组件时，返回该组件实例',
  },
]
const slotRows = [
  { name: 'default', type: '—', default: '—', description: '文本内容，可包含内联元素或其他组件' },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Text 文本"
      description="统一文本字号、字重和换行方式，支持灵活的语义元素与自定义样式。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description> 默认渲染为 span，保留上下文中的字号、字重和颜色。 </template>
      <ComponentDocsDemoBlock :code="codes.basic">
        <Text>用于展示文本内容。</Text>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="字号">
      <template #description> size 提供三种字号，并匹配相应的行高。 </template>
      <ComponentDocsDemoBlock :code="codes.sizes">
        <div class="demo-column">
          <div v-for="size in sizes" :key="size" class="demo-row">
            <span class="demo-label">{{ size }}</span>
            <Text :size="size"> 文本示例 · The quick brown fox </Text>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="字重">
      <template #description> weight 提供轻量、常规、中等和半粗四种字重。 </template>
      <ComponentDocsDemoBlock :code="codes.weights">
        <div class="demo-column">
          <div v-for="weight in weights" :key="weight" class="demo-row">
            <span class="demo-label">{{ weight }}</span>
            <Text :weight="weight"> 文本示例 · The quick brown fox </Text>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="语义元素">
      <template #description>
        使用 as 选择合适的 HTML 元素，也可以传入自定义组件。元素的原生属性和事件会透传。
      </template>
      <ComponentDocsDemoBlock :code="codes.elements">
        <div class="demo-column">
          <Text as="p"> 段落文本 </Text>
          <Text as="em"> 强调文本 </Text>
          <Text as="strong"> 重要文本 </Text>
          <Text as="a" href="#属性"> 查看属性 </Text>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="空白与换行">
      <template #description>
        whiteSpace 控制连续空格、显式换行及自动换行。以下示例使用相同内容与宽度。
      </template>
      <ComponentDocsDemoBlock :code="codes.whitespace">
        <div class="whitespace-grid">
          <div v-for="whiteSpace in whiteSpaces" :key="whiteSpace" class="whitespace-example">
            <span class="demo-label">{{ whiteSpace }}</span>
            <div class="whitespace-preview">
              <Text :white-space="whiteSpace">
                {{ whitespaceSample }}
              </Text>
            </div>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自定义样式">
      <template #description>
        使用 class 或 className 添加颜色、背景及其他样式，也可以通过 style 设置内联样式。
      </template>
      <ComponentDocsDemoBlock :code="codes.custom">
        <Text size="small" class="highlight-text"> 自定义颜色与背景 </Text>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="属性" variant="api">
      <Table :columns="columns" :data="rows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>

    <ComponentDocsSection title="组件实例" variant="api">
      <Table :columns="columns" :data="instanceRows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>

    <ComponentDocsSection title="插槽" variant="api">
      <Table :columns="columns" :data="slotRows" row-key="name" compact :hoverable="false" />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.demo-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 16px;
}

.demo-label {
  min-width: 80px;
  color: var(--fgColor-muted, #59636e);
  font-size: 12px;
  line-height: 1.5;
}

.whitespace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 24px;
  width: 100%;
}

.whitespace-example {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.whitespace-preview {
  overflow: auto;
  padding: 12px;
  border: 1px solid var(--borderColor-default, #d1d9e0);
  border-radius: 6px;
  background-color: var(--bgColor-muted, #f6f8fa);
}

.highlight-text {
  padding: 8px 12px;
  color: var(--fgColor-onEmphasis, #ffffff);
  background-color: var(--bgColor-neutral-emphasis, #59636e);
  border-radius: 6px;
}
</style>
