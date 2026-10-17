<script setup lang="ts">
import { useId as useDocumentationId } from 'vue'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'

import { RouterLink } from 'vue-router'
import { Link } from '@/components/primer-vue/Link'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()

const basicCode = `<Link href="#">Link</Link>
<Link href="#" muted>Muted link</Link>`
const inlineCode = `<p data-a11y-link-underlines="true">
  查看 <Link href="/component" inline>组件文档</Link>，了解更多。
</p>`
const buttonCode = `<Link as="button" type="button">Action</Link>
<Link :as="RouterLink" to="/component">组件文档</Link>`
const contentCode = `<Link href="https://github.com" target="_blank" rel="noopener noreferrer">
  <strong>GitHub</strong>
</Link>`

const apiTableColumns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '140px' },
  { field: 'default', header: '默认值', minWidth: '120px' },
  { field: 'type', header: '类型', minWidth: '160px' },
  { field: 'description', header: '说明', minWidth: '240px' },
]
const apiTableRows = [
  {
    id: 'as',
    name: 'as',
    type: 'string | Component',
    default: 'a',
    description: '根元素或自定义组件；应最终渲染为 a 或 button',
  },
  {
    id: 'muted',
    name: 'muted',
    type: 'boolean',
    default: 'undefined',
    description: '使用弱化颜色，悬停时恢复强调色并移除下划线',
  },
  {
    id: 'inline',
    name: 'inline',
    type: 'boolean',
    default: 'undefined',
    description:
      '文本块中的链接；祖先 data-a11y-link-underlines="true" 时默认显示下划线，悬停时移除',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '合并到根元素的类名，也可使用 Vue 的 class 属性',
  },
  {
    id: 'hoverColor',
    name: 'hoverColor',
    type: 'string',
    default: '—',
    description: '已弃用且不产生样式；使用 CSS Modules 设置悬停颜色',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Link 链接"
      description="文本链接，支持弱化颜色、行内下划线和自定义根元素。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>通过默认插槽提供内容，使用 <code>muted</code> 弱化链接颜色。</template>
      <ComponentDocsDemoBlock :code="basicCode">
        <div class="link-row">
          <Link href="#">Link</Link>
          <Link href="#" muted>Muted link</Link>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="行内链接">
      <template #description>
        <code>inline</code> 配合祖先的
        <code>data-a11y-link-underlines="true"</code> 控制文本中的下划线。
      </template>
      <ComponentDocsDemoBlock :code="inlineCode">
        <p data-a11y-link-underlines="true">
          查看 <Link href="/component" inline>组件文档</Link>，了解更多。
        </p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自定义根元素">
      <template #description>
        使用 <code>as</code> 渲染按钮或路由组件。按钮的
        <code>type</code> 由调用方指定；开发环境会检查最终元素是否为链接或按钮。
      </template>
      <ComponentDocsDemoBlock :code="buttonCode">
        <div class="link-row">
          <Link as="button" type="button">Action</Link>
          <Link :as="RouterLink" to="/component">组件文档</Link>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="内容与原生属性">
      <template #description>
        默认插槽支持文本和其他节点。<code>href</code>、<code>target</code>、<code>rel</code>、ARIA
        属性及事件传给实际根元素；新窗口链接的属性由调用方指定。
      </template>
      <ComponentDocsDemoBlock :code="contentCode">
        <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
          <strong>GitHub</strong>
        </Link>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <template #description>
        <code>LinkProps</code> 根据 <code>as</code> 接受对应元素或组件的属性。组件 ref 的
        <code>element</code> 指向实际根元素，可调用其原生 <code>focus()</code>；卸载后为 null。
      </template>
      <VisuallyHidden :id="`${documentationId}-api-table-0`">Link 链接 API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-0`"
        :columns="apiTableColumns"
        :data="apiTableRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.link-row {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}
</style>
