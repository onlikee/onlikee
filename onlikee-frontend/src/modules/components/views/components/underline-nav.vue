<script setup lang="ts">
import { useId as useDocumentationId } from 'vue'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'

import { UnderlineNav } from '@/components/primer-vue/UnderlineNav'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import { CodeIcon, IssueOpenedIcon } from '@onlikee/octicons-vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()

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
    <UnderlineNav.Item href="#" aria-current="page" :counter="8" :leading-visual="CodeIcon">
      Code
    </UnderlineNav.Item>
    <UnderlineNav.Item href="#" :counter="12" :leading-visual="IssueOpenedIcon">
      Issues
    </UnderlineNav.Item>
  </UnderlineNav>
</template>

<script setup lang="ts">
import { UnderlineNav } from '@/components/primer-vue/UnderlineNav'
import { CodeIcon, IssueOpenedIcon } from '@onlikee/octicons-vue'
<\/script>`

const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '160px' },
  { field: 'type', header: '类型', minWidth: '190px' },
  { field: 'default', header: '默认值', minWidth: '100px' },
  { field: 'description', header: '说明' },
]

const rootRows = [
  {
    id: 'aria-label',
    name: 'aria-label',
    type: 'string',
    default: '—',
    description: '导航区域的无障碍名称。',
  },
  { id: 'as', name: 'as', type: 'string', default: 'nav', description: '根元素。' },
  {
    id: 'variant',
    name: 'variant',
    type: 'inset | flush',
    default: 'inset',
    description: '导航项的水平内边距。',
  },
  {
    id: 'loadingCounters',
    name: 'loadingCounters',
    type: 'boolean',
    default: 'false',
    description: '统一显示计数加载状态。',
  },
  {
    id: 'hideIconsBreakpoint',
    name: 'hideIconsBreakpoint',
    type: 'xsmall | small | medium | large | xlarge | xxlarge | null',
    default: 'medium',
    description: '容器较窄时隐藏图标的断点；null 表示始终显示。',
  },
]

const itemRows = [
  { id: 'href', name: 'href', type: 'string', default: '#', description: '链接地址。' },
  {
    id: 'aria-current',
    name: 'aria-current',
    type: 'string | boolean',
    default: '—',
    description: '标记当前页面或当前位置。',
  },
  {
    id: 'counter',
    name: 'counter',
    type: 'number | string',
    default: '—',
    description: '导航项后的计数。',
  },
  {
    id: 'as',
    name: 'as',
    type: 'string | Component',
    default: 'a',
    description: '链接元素或自定义导航组件。',
  },
  {
    id: 'leadingVisual',
    name: 'leadingVisual',
    type: 'Component',
    default: '—',
    description: '标签前的图标组件。',
  },
  {
    id: 'select',
    name: 'select',
    type: 'event',
    default: '—',
    description: '点击或按 Enter、Space 时触发。',
  },
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
          <UnderlineNav.Item href="#" aria-current="page"> Code </UnderlineNav.Item>
          <UnderlineNav.Item href="#"> Pull requests </UnderlineNav.Item>
          <UnderlineNav.Item href="#"> Actions </UnderlineNav.Item>
        </UnderlineNav>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="图标、计数与 flush">
      <ComponentDocsDemoBlock :code="featuresCode">
        <UnderlineNav aria-label="Repository" variant="flush">
          <UnderlineNav.Item href="#" aria-current="page" :counter="8" :leading-visual="CodeIcon">
            Code
          </UnderlineNav.Item>
          <UnderlineNav.Item href="#" :counter="12" :leading-visual="IssueOpenedIcon">
            Issues
          </UnderlineNav.Item>
        </UnderlineNav>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <h3>UnderlineNav</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-0`"
        >UnderlineNav 下划线导航 UnderlineNav</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-0`"
        :columns="columns"
        :data="rootRows"
      />
      <h3>UnderlineNav.Item</h3>
      <VisuallyHidden :id="`${documentationId}-api-table-1`"
        >UnderlineNav 下划线导航 UnderlineNav.Item</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-1`"
        :columns="columns"
        :data="itemRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
