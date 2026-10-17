<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Admonition 提示块"
      description="用于在文档或页面中展示提示、警告、注意事项等不同级别的信息块。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过
        <code>type</code>
        属性切换五种语义变体：<code>info</code>、<code>success</code>、<code>upsell</code>、<code>warning</code>、<code>critical</code>。
      </template>
      <ComponentDocsDemoBlock :code="demoBasicCode">
        <div class="admonition-demo-stack">
          <Admonition type="info"> 这是一条普通注释信息。 </Admonition>
          <Admonition type="success"> 保存成功，配置已经生效。 </Admonition>
          <Admonition type="upsell"> 你可以升级到专业版解锁更多能力。 </Admonition>
          <Admonition type="warning"> 注意：此操作可能存在风险，建议备份后再继续。 </Admonition>
          <Admonition type="critical"> 操作失败，请修复问题后重试。 </Admonition>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="带标题">
      <template #description> 通过 <code>title</code> 属性设置提示框标题。 </template>
      <ComponentDocsDemoBlock :code="demoTitleCode">
        <div class="admonition-demo-stack">
          <Admonition type="info" title="你知道吗？">
            Markdown 文件中的 Admonition 语法会被渲染为此组件样式。
          </Admonition>
          <Admonition type="warning" title="版本兼容性">
            此 API 在 v2.0 中已弃用，请迁移至新接口。
          </Admonition>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <h4>Props</h4>
      <VisuallyHidden :id="`${documentationId}-api-table-0`">Admonition 提示块 API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-0`"
        :columns="apiTableColumns"
        :data="apiTableRows"
      />
      <h4 style="margin-top: 24px">Slots</h4>
      <VisuallyHidden :id="`${documentationId}-api-table-1`">Admonition 提示块 API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-1`"
        :columns="slotTableColumns"
        :data="slotTableRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { useId as useDocumentationId } from 'vue'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'

import { Admonition } from '@/components/primer-vue/Admonition'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()

// ---------- demo code strings ----------

const demoBasicCode = `<script setup lang="ts">
import { Admonition } from '@/components/primer-vue/Admonition'
<\/script>

<template>
  <Admonition type="info">这是一条普通注释信息。</Admonition>
  <Admonition type="success">保存成功，配置已经生效。</Admonition>
  <Admonition type="upsell">你可以升级到专业版解锁更多能力。</Admonition>
  <Admonition type="warning">注意：此操作可能存在风险，建议备份后再继续。</Admonition>
  <Admonition type="critical">操作失败，请修复问题后重试。</Admonition>
</template>`

const demoTitleCode = `<script setup lang="ts">
import { Admonition } from '@/components/primer-vue/Admonition'
<\/script>

<template>
  <Admonition type="info" title="你知道吗？">
    Markdown 文件中的 Admonition 语法会被渲染为此组件样式。
  </Admonition>

  <Admonition type="warning" title="版本兼容性">
    此 API 在 v2.0 中已弃用，请迁移至新接口。
  </Admonition>
</template>`

// ---------- API Tables ----------

const apiTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '140px' },
  { field: 'default', header: '默认值', minWidth: '100px' },
  { field: 'type', header: '类型', minWidth: '220px' },
  { field: 'description', header: '说明', minWidth: '200px' },
]

const apiTableRows = [
  {
    id: 'type',
    name: 'type',
    description: '语义变体类型',
    type: "'critical' | 'info' | 'success' | 'upsell' | 'warning'",
    default: "'info'",
  },
  { id: 'title', name: 'title', description: '提示框标题文本', type: 'string', default: '—' },
]

const slotTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '插槽名', rowHeader: true, minWidth: '140px' },
  { field: 'description', header: '说明', minWidth: '300px' },
]

const slotTableRows = [{ id: 'default', name: 'default', description: '提示框正文内容' }]
</script>

<style scoped>
.admonition-demo-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}
</style>
