<script setup lang="ts">
import { UnderlineNav } from '@/components/primer-vue/UnderlineNav'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import { CodeIcon, IssueOpenedIcon } from '@/components/octicons-vue3'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const basicCode = `<template>
  <UnderlineNav aria-label="Repository">
    <UnderlineNav.Item href="#" aria-current="page">Code</UnderlineNav.Item>
    <UnderlineNav.Item href="#">Pull requests</UnderlineNav.Item>
    <UnderlineNav.Item href="#">Actions</UnderlineNav.Item>
  </UnderlineNav>
</template>

<script setup lang="ts">
import { UnderlineNav } from '@/components/primer-vue/UnderlineNav'
<\/script>`

const featuresCode = `<template>
  <UnderlineNav aria-label="Repository" variant="flush">
    <UnderlineNav.Item href="#" aria-current="page" :counter="8">
      <template #leadingVisual><CodeIcon /></template>
      Code
    </UnderlineNav.Item>
    <UnderlineNav.Item href="#" :counter="12">
      <template #leadingVisual><IssueOpenedIcon /></template>
      Issues
    </UnderlineNav.Item>
  </UnderlineNav>
</template>`

const columns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '160px' },
  { key: 'type', label: '类型', minWidth: '190px' },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'description', label: '说明', wrap: true }
]

const rootRows = [
  { name: 'aria-label', type: 'string', default: '—', description: '导航区域的无障碍名称。' },
  { name: 'as', type: 'string', default: 'nav', description: '根元素。' },
  { name: 'variant', type: 'inset | flush', default: 'inset', description: '导航项的水平内边距。' },
  { name: 'loadingCounters', type: 'boolean', default: 'false', description: '统一显示计数加载状态。' },
  { name: 'hideIconsBreakpoint', type: 'xsmall | small | medium | large | xlarge | xxlarge | null', default: 'medium', description: '容器较窄时隐藏图标的断点；null 表示始终显示。' }
]

const itemRows = [
  { name: 'href', type: 'string', default: '#', description: '链接地址。' },
  { name: 'aria-current', type: 'string | boolean', default: '—', description: '标记当前页面或当前位置。' },
  { name: 'counter', type: 'number | string', default: '—', description: '导航项后的计数。' },
  { name: 'as', type: 'string | Component', default: 'a', description: '链接元素或自定义导航组件。' },
  { name: 'leadingVisual', type: 'slot', default: '—', description: '标签前的图标。' },
  { name: 'select', type: 'event', default: '—', description: '点击或按 Enter、Space 时触发。' }
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="UnderlineNav 下划线导航"
      description="在相关页面之间切换；空间不足时将末尾项目收进 More 菜单。"
    />

    <ComponentDocsSection title="基础用法">
      <ComponentDocsDemoBlock :code="basicCode">
        <UnderlineNav aria-label="Repository">
          <UnderlineNav.Item
            href="#"
            aria-current="page"
          >
            Code
          </UnderlineNav.Item>
          <UnderlineNav.Item href="#">
            Pull requests
          </UnderlineNav.Item>
          <UnderlineNav.Item href="#">
            Actions
          </UnderlineNav.Item>
        </UnderlineNav>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="图标、计数与 flush">
      <ComponentDocsDemoBlock :code="featuresCode">
        <UnderlineNav
          aria-label="Repository"
          variant="flush"
        >
          <UnderlineNav.Item
            href="#"
            aria-current="page"
            :counter="8"
          >
            <template #leadingVisual>
              <CodeIcon />
            </template>
            Code
          </UnderlineNav.Item>
          <UnderlineNav.Item
            href="#"
            :counter="12"
          >
            <template #leadingVisual>
              <IssueOpenedIcon />
            </template>
            Issues
          </UnderlineNav.Item>
        </UnderlineNav>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h3>UnderlineNav</h3>
      <Table
        :columns="columns"
        :data="rootRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h3>UnderlineNav.Item</h3>
      <Table
        :columns="columns"
        :data="itemRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
