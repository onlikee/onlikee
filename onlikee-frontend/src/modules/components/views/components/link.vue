<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Link 链接"
      description="常用的文本超链接。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用 <code>variant</code> 来定义链接的样式。
      </template>

      <ComponentDocsDemoBlock :code="demo1Code">
        <div class="link-row">
          <Link
            href="#"
            link-text="Primary Link"
            variant="primary"
          />
          <Link
            href="#"
            link-text="Secondary Link"
            variant="secondary"
          />
          <Link
            href="#"
            link-text="Danger Link"
            variant="danger"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="外部链接">
      <template #description>
        设置 <code>external</code> 属性可以在链接后显示外部链接图标。
      </template>

      <ComponentDocsDemoBlock :code="demo2Code">
        <div class="link-row">
          <Link
            href="https://github.com"
            link-text="GitHub"
            :external="true"
            target="_blank"
          />
          <Link
            href="https://vuejs.org"
            link-text="Vue.js"
            :external="true"
            target="_blank"
            variant="secondary"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="前后缀文本">
      <template #description>
        使用 <code>prefix-text</code> 和 <code>suffix-text</code> 在链接前后添加文本。
      </template>

      <ComponentDocsDemoBlock :code="demo3Code">
        <div class="link-column">
          <Link
            href="/component"
            link-text="组件文档"
            prefix-text="查看"
          />
          <Link
            href="/component"
            link-text="组件文档"
            suffix-text="了解更多"
          />
          <Link
            href="/component"
            link-text="组件文档"
            prefix-text="前往"
            suffix-text="查看详情"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <Table
        :columns="apiTableColumns"
        :data="apiTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { Link } from '@/components/primer-vue/Link'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const demo1Code = `<template>
  <div style="max-width: 600px">
    <Link href="#" link-text="Primary Link" variant="primary" />
    <Link href="#" link-text="Secondary Link" variant="secondary" />
    <Link href="#" link-text="Danger Link" variant="danger" />
  </div>
</template>

<style scoped>
.link-row {
  display: flex;
  gap: 20px;
  align-items: center;
}
</style>`

const demo2Code = `<template>
  <div style="max-width: 600px">
    <Link href="https://github.com" link-text="GitHub" :external="true" target="_blank" />
    <Link href="https://vuejs.org" link-text="Vue.js" :external="true" target="_blank" variant="secondary" />
  </div>
</template>

<style scoped>
.link-row {
  display: flex;
  gap: 20px;
  align-items: center;
}
</style>`

const demo3Code = `<template>
  <div style="max-width: 600px">
    <Link href="/component" link-text="组件文档" prefix-text="查看" />
    <Link href="/component" link-text="组件文档" suffix-text="了解更多" />
    <Link href="/component" link-text="组件文档" prefix-text="前往" suffix-text="查看详情" />
  </div>
</template>

<style scoped>
.link-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>`

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '160px', wrap: true },
  { key: 'options', label: '可选值', minWidth: '200px', wrap: true },
  { key: 'description', label: '说明', minWidth: '200px', wrap: true }
]

const apiTableRows = [
  {
    name: 'href',
    description: '链接地址',
    type: 'string',
    options: '—',
    default: '—'
  },
  {
    name: 'link-text',
    description: '链接文本',
    type: 'string',
    options: '—',
    default: '—'
  },
  {
    name: 'prefix-text',
    description: '前置文本',
    type: 'string',
    options: '—',
    default: '—'
  },
  {
    name: 'suffix-text',
    description: '后置文本',
    type: 'string',
    options: '—',
    default: '—'
  },
  {
    name: 'external',
    description: '是否为外部链接',
    type: 'boolean',
    options: 'true / false',
    default: 'false'
  },
  {
    name: 'target',
    description: '链接打开方式',
    type: 'string',
    options: '_blank / _self / _parent / _top',
    default: '_self'
  },
  {
    name: 'variant',
    description: '链接样式变体',
    type: 'string',
    options: 'primary / secondary / danger / default',
    default: 'primary'
  }
]
</script>

<style scoped>
.link-row {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.link-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .link-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .link-column {
    gap: 0.75rem;
  }
}
</style>
