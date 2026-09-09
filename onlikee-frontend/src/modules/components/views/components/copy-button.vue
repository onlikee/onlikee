<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="CopyButton 复制按钮"
      description="用于复制内容的图标按钮，点击后自动切换为勾选图标并在指定时间后复原。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        点击按钮触发复制操作，图标会切换为勾选状态持续 2 秒后自动恢复。通常配合
        <code>navigator.clipboard.writeText()</code> 使用。
      </template>

      <ComponentDocsDemoBlock :code="basicDemoCode">
        <div class="demo-row">
          <CopyButton @click="copyText('Hello, world!')" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="不同尺寸">
      <template #description>
        通过 <code>size</code> 控制按钮的尺寸，small、medium、large 分别对应 28×28、32×32、40×40 像素。
      </template>

      <ComponentDocsDemoBlock :code="sizeDemoCode">
        <div class="demo-row demo-row--align-end">
          <CopyButton size="small" />
          <CopyButton size="medium" />
          <CopyButton size="large" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="在代码块中使用">
      <template #description>
        <code>CopyButton</code> 常见于代码块右上角，配合
        <code>navigator.clipboard.writeText()</code> 实现一键复制代码片段。
      </template>

      <ComponentDocsDemoBlock :code="codeBlockDemoCode">
        <div class="code-block-demo">
          <div class="code-block-header">
            <span class="code-block-lang">TypeScript</span>
            <CopyButton
              size="small"
              @click="copyText(sampleCode)"
            />
          </div>
          <pre class="code-block-body"><code>{{ sampleCode }}</code></pre>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h3>属性</h3>
      <Table
        :columns="apiTableColumns"
        :data="apiTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>事件</h3>
      <Table
        :columns="eventTableColumns"
        :data="eventTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { CopyButton } from '@/components/primer-vue/CopyButton'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const sampleCode = `const greet = (name: string) => {
  return \`Hello, \${name}!\`
}`

function copyText(text: string) {
  navigator.clipboard.writeText(text)
}

const basicDemoCode = `<script setup lang="ts">
import { CopyButton } from '@/components/primer-vue/CopyButton'

function copyText(text: string) {
  navigator.clipboard.writeText(text)
}
<\/script>

<template>
  <CopyButton @click="copyText('Hello, world!')" />
</template>`

const sizeDemoCode = `<script setup lang="ts">
import { CopyButton } from '@/components/primer-vue/CopyButton'
<\/script>

<template>
  <div style="display: flex; align-items: flex-end; gap: 1rem;">
    <CopyButton size="small" />
    <CopyButton size="medium" />
    <CopyButton size="large" />
  </div>
</template>`

const codeBlockDemoCode = `<script setup lang="ts">
import { CopyButton } from '@/components/primer-vue/CopyButton'

const code = \`const greet = (name: string) => {
  return \\\`Hello, \\\${name}!\\\`
}\`

function copyText(text: string) {
  navigator.clipboard.writeText(text)
}
<\/script>

<template>
  <div class="code-block">
    <div class="code-block-header">
      <span>TypeScript</span>
      <CopyButton size="small" @click="copyText(code)" />
    </div>
    <pre><code>{{ code }}</code></pre>
  </div>
</template>`

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '120px' },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'type', label: '类型', minWidth: '220px', wrap: true },
  { key: 'options', label: '可选值', minWidth: '200px', wrap: true },
  { key: 'description', label: '说明', minWidth: '220px', wrap: true }
]

const apiTableRows = [
  {
    name: 'size',
    description: '控制按钮的尺寸，分别对应 28×28、32×32、40×40 像素。',
    type: "'small' | 'medium' | 'large'",
    options: 'small / medium / large',
    default: "'medium'"
  }
]

const eventTableColumns: TableColumn[] = [
  { key: 'name', label: '事件名', rowHeader: true, minWidth: '120px' },
  { key: 'params', label: '参数', minWidth: '160px', wrap: true },
  { key: 'description', label: '说明', minWidth: '280px', wrap: true }
]

const eventTableRows = [
  {
    name: 'click',
    params: '(event: MouseEvent)',
    description: '按钮被点击时触发。组件内部会自动切换图标状态，此事件用于执行实际的复制逻辑。'
  }
]
</script>

<style scoped>
.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.demo-row--align-end {
  align-items: flex-end;
}

.code-block-demo {
  border: 1px solid var(--borderColor-default, #d0d7de);
  border-radius: 6px;
  overflow: hidden;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  font-size: 13px;
}

.code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 4px 16px;
  background-color: var(--bgColor-muted, #f6f8fa);
  border-bottom: 1px solid var(--borderColor-default, #d0d7de);
}

.code-block-lang {
  font-size: 12px;
  color: var(--fgColor-muted, #59636e);
}

.code-block-body {
  margin: 0;
  padding: 16px;
  background-color: var(--bgColor-default, #fff);
  overflow-x: auto;
  color: var(--fgColor-default, #1f2328);
  line-height: 1.6;
}
</style>
