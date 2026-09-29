<script setup lang="ts">
import { Truncate } from '@/components/primer-vue/Truncate'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const basicCode = `<template>
  <Truncate title="A long repository name that does not fit">A long repository name that does not fit</Truncate>
</template>

<script setup lang="ts">
import { Truncate } from '@/components/primer-vue/Truncate'
<\/script>`

const variantsCode = `<template>
  <Truncate title="Hover to expand this long name" expandable :max-width="160">Hover to expand this long name</Truncate>
  <Truncate title="Inline truncated label" inline max-width="8rem">Inline truncated label</Truncate>
</template>`

const columns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '130px' },
  { key: 'type', label: '类型', minWidth: '180px' },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'description', label: '说明', wrap: true }
]

const rows = [
  { name: 'title', type: 'string', default: '必填', description: '完整文本，供浏览器原生提示显示。' },
  { name: 'as', type: 'string | Component', default: 'div', description: '根元素或组件。' },
  { name: 'maxWidth', type: 'number | string', default: '125', description: '最大宽度；数字按像素处理。' },
  { name: 'inline', type: 'boolean', default: 'false', description: '以内联块显示。' },
  { name: 'expandable', type: 'boolean', default: 'false', description: '悬停时展开内容。' }
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Truncate 文本截断"
      description="在指定宽度内截断单行文本，并保留完整文本提示。"
    />

    <ComponentDocsSection title="基础用法">
      <ComponentDocsDemoBlock :code="basicCode">
        <Truncate title="A long repository name that does not fit">
          A long repository name that does not fit
        </Truncate>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="悬停展开与内联显示">
      <ComponentDocsDemoBlock :code="variantsCode">
        <div class="demo-row">
          <Truncate
            title="Hover to expand this long name"
            expandable
            :max-width="160"
          >
            Hover to expand this long name
          </Truncate>
          <Truncate
            title="Inline truncated label"
            inline
            max-width="8rem"
          >
            Inline truncated label
          </Truncate>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <Table
        :columns="columns"
        :data="rows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
}
</style>
