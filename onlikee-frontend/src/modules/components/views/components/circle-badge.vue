<script setup lang="ts">
import { useId as useDocumentationId } from 'vue'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'

import { CheckIcon, ZapIcon } from '@onlikee/octicons-vue'
import { CircleBadge } from '@/components/primer-vue/CircleBadge'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsPage from '../../components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsHeader from '../../components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsSection from '../../components/ComponentDocsPage/ComponentDocsSection.vue'
import ComponentDocsDemoBlock from '../../components/ComponentDocsPage/ComponentDocsDemoBlock.vue'

const documentationId = useDocumentationId()

const basicCode = `<script setup lang="ts">
import { CircleBadge } from '@/components/primer-vue/CircleBadge'
import { ZapIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <CircleBadge><CircleBadge.Icon :icon="ZapIcon" :size="48" aria-label="闪电徽章" /></CircleBadge>
</template>`
const variantsCode = `<CircleBadge variant="small"><CircleBadge.Icon :icon="CheckIcon" :size="48" aria-label="小徽章" /></CircleBadge>
<CircleBadge variant="medium"><CircleBadge.Icon :icon="CheckIcon" :size="48" aria-label="中徽章" /></CircleBadge>
<CircleBadge variant="large"><CircleBadge.Icon :icon="CheckIcon" :size="48" aria-label="大徽章" /></CircleBadge>`
const sizeCode = `<CircleBadge variant="large" :size="72">
  <CircleBadge.Icon :icon="ZapIcon" :size="40" aria-label="自定义尺寸徽章" />
</CircleBadge>`
const inlineCode = `<p>状态：<CircleBadge as="span" inline :size="32"><CircleBadge.Icon :icon="CheckIcon" aria-label="已完成" /></CircleBadge></p>
<CircleBadge as="a" href="/component/checkbox" title="查看复选框" :size="56">
  <CircleBadge.Icon :icon="CheckIcon" :size="32" aria-label="查看复选框" />
</CircleBadge>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性', rowHeader: true, minWidth: '140px' },
  { field: 'type', header: '类型', minWidth: '200px' },
  { field: 'default', header: '默认值', minWidth: '100px' },
  { field: 'description', header: '说明', minWidth: '260px' },
]
const rows = [
  {
    id: 'as',
    name: 'as',
    type: '原生标签 | Component',
    default: 'div',
    description: '支持链接、按钮和自定义 Vue 组件，透传对应的属性和事件。',
  },
  {
    id: 'variant',
    name: 'variant',
    type: "'small' | 'medium' | 'large'",
    default: 'medium',
    description: '直径分别为 56px、96px、128px。',
  },
  {
    id: 'size',
    name: 'size',
    type: 'number',
    default: '—',
    description: '有限数值优先于 variant，0 也有效；NaN 和 Infinity 使用 variant 尺寸。',
  },
  {
    id: 'inline',
    name: 'inline',
    type: 'boolean',
    default: 'false',
    description: '使用 inline-flex，默认 flex。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '与 Vue class 合并。',
  },
  {
    id: 'style',
    name: 'style',
    type: 'StyleValue',
    default: '—',
    description: '沿用原版语义：传入的 style 会被尺寸样式整体覆盖；自定义外观请使用 class。',
  },
  {
    id: 'Icon.icon',
    name: 'Icon.icon',
    type: 'Component | string',
    default: '必填',
    description: '渲染指定图标组件，其他 SVG 和图标属性传给它。',
  },
  {
    id: 'Icon.size',
    name: 'Icon.size',
    type: 'IconSize',
    default: '图标默认尺寸',
    description: '图标尺寸独立于徽章尺寸，最大高度为徽章的 55%，最大宽度为 60%。',
  },
  {
    id: 'Icon.className',
    name: 'Icon.className',
    type: 'string',
    default: '—',
    description: '与图标类名、Vue class 合并。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="CircleBadge 圆形徽章"
      description="带圆形背景和阴影的内容容器。React 原版已标记弃用；新场景建议直接使用图标并自定义样式。"
    />
    <ComponentDocsSection title="基础用法">
      <ComponentDocsDemoBlock :code="basicCode">
        <CircleBadge
          ><CircleBadge.Icon :icon="ZapIcon" :size="48" aria-label="闪电徽章"
        /></CircleBadge>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="尺寸变体">
      <ComponentDocsDemoBlock :code="variantsCode">
        <div class="badge-row">
          <CircleBadge variant="small"
            ><CircleBadge.Icon :icon="CheckIcon" :size="48" aria-label="小徽章"
          /></CircleBadge>
          <CircleBadge variant="medium"
            ><CircleBadge.Icon :icon="CheckIcon" :size="48" aria-label="中徽章"
          /></CircleBadge>
          <CircleBadge variant="large"
            ><CircleBadge.Icon :icon="CheckIcon" :size="48" aria-label="大徽章"
          /></CircleBadge>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="自定义尺寸">
      <ComponentDocsDemoBlock :code="sizeCode">
        <CircleBadge variant="large" :size="72"
          ><CircleBadge.Icon :icon="ZapIcon" :size="40" aria-label="自定义尺寸徽章"
        /></CircleBadge>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="行内与链接">
      <ComponentDocsDemoBlock :code="inlineCode">
        <div class="badge-row">
          <p>
            状态：<CircleBadge as="span" inline :size="32"
              ><CircleBadge.Icon :icon="CheckIcon" aria-label="已完成"
            /></CircleBadge>
          </p>
          <CircleBadge as="a" href="/component/checkbox" title="查看复选框" :size="56"
            ><CircleBadge.Icon :icon="CheckIcon" :size="32" aria-label="查看复选框"
          /></CircleBadge>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <VisuallyHidden :id="`${documentationId}-api-table-0`"
        >CircleBadge 圆形徽章 API</VisuallyHidden
      >
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-0`"
        :columns="columns"
        :data="rows"
      />
      <p>默认插槽支持图片、图标或自定义内容；CircleBadge.Icon 也可独立导入 CircleBadgeIcon。</p>
      <p>组件 ref 通过 element 获取实际 DOM 元素。</p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.badge-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--stack-gap-spacious);
}
</style>
