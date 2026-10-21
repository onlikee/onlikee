<script setup lang="ts">
import { h, shallowRef, useId } from 'vue'
import { RouterLink } from 'vue-router'
import { Pagination, type PageProps } from '@/components/primer-vue/Pagination'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useId()
const page = shallowRef(2)
const routerPage = shallowRef(2)
function changePage(event: MouseEvent, number: number) {
  event.preventDefault()
  page.value = number
}
function renderRouterPage({ key, number, className, children, ...props }: PageProps) {
  return h(
    RouterLink,
    { key, to: { query: { page: number } }, class: className, ...props },
    { default: () => children },
  )
}
const basicCode = `<script setup lang="ts">
import { shallowRef } from 'vue'
import { Pagination } from '@/components/primer-vue/Pagination'

const page = shallowRef(2)
function changePage(event: MouseEvent, number: number) {
  event.preventDefault()
  page.value = number
}
<\/script>

<template>
  <Pagination :page-count="15" :current-page="page" @page-change="changePage" />
</template>`
const windowCode = `<Pagination :page-count="15" :current-page="5" :margin-page-count="4" @page-change="(event) => event.preventDefault()" />
<Pagination :page-count="15" :current-page="5" :surrounding-page-count="4" @page-change="(event) => event.preventDefault()" />`
const responsiveCode = `<Pagination :page-count="15" :current-page="5" :show-pages="false" @page-change="(event) => event.preventDefault()" />
<Pagination :page-count="15" :current-page="5" :show-pages="{ narrow: false }" @page-change="(event) => event.preventDefault()" />`
const routerCode = `<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { RouterLink } from 'vue-router'
import { Pagination, type PageProps } from '@/components/primer-vue/Pagination'

const page = shallowRef(2)
function renderPage({ key, number, className, children, ...props }: PageProps) {
  return h(
    RouterLink,
    { key, to: { query: { page: number } }, class: className, ...props },
    { default: () => children },
  )
}
<\/script>

<template>
  <Pagination
    :page-count="15"
    :current-page="page"
    :render-page="renderPage"
    @page-change="(_event, number) => page = number"
  />
</template>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rows = [
  {
    id: 'pageCount',
    name: 'pageCount',
    type: 'number',
    default: '必填',
    description: '总页数。小于或等于 0 时，默认模式仅保留禁用的前后页。',
  },
  {
    id: 'currentPage',
    name: 'currentPage',
    type: 'number',
    default: '必填',
    description: '从 1 开始的当前页，完全由调用方控制。',
  },
  {
    id: 'onPageChange',
    name: 'onPageChange / @page-change',
    type: '(event: MouseEvent, page: number) => void',
    default: '—',
    description:
      '点击可用的数字或前后页时触发，包含点击当前页；组件不主动阻止链接导航或更新当前页。',
  },
  {
    id: 'hrefBuilder',
    name: 'hrefBuilder',
    type: '(page: number) => string',
    default: 'page => `#${page}`',
    description: '生成可用页的链接地址，禁用边界不调用。',
  },
  {
    id: 'marginPageCount',
    name: 'marginPageCount',
    type: 'number',
    default: '1',
    description: '始末两端各保留的页数。',
  },
  {
    id: 'surroundingPageCount',
    name: 'surroundingPageCount',
    type: 'number',
    default: '2',
    description: '当前页两侧各保留的页数；靠近边界时会补足另一侧的窗口。',
  },
  {
    id: 'showPages',
    name: 'showPages',
    type: 'boolean | { narrow?: boolean; regular?: boolean; wide?: boolean }',
    default: 'true',
    description:
      'false 只渲染前后页；对象模式保留完整 DOM，并由 CSS 隐藏指定范围的数字页。未指定的范围不隐藏。regular 从 768px 起，wide 从 1400px 起，范围重叠时任一 false 均会隐藏。',
  },
  {
    id: 'renderPage',
    name: 'renderPage',
    type: '(props: PageProps) => VNodeChild',
    default: '—',
    description:
      '自定义所有非省略号项，包括禁用边界。将 className 映射为 Vue class，children 用作内容，其余属性和 onClick 转交给链接。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '附加到 nav 的类名，也支持 Vue class。原生属性、事件和 ARIA 属性透传到 nav。',
  },
]
const pageRows = [
  {
    id: 'key',
    name: 'key',
    type: 'string',
    default: '—',
    description: '稳定的页项键，例如 page-prev、page-2、page-next；转交给 VNode key。',
  },
  {
    id: 'number',
    name: 'number',
    type: 'number',
    default: '—',
    description: '目标页号；禁用的前后边界可能为 0 或总页数加 1。',
  },
  {
    id: 'children',
    name: 'children',
    type: 'VNodeChild',
    default: '—',
    description: '包含 Previous / Next 图标与文案，或数字页文本。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '页项默认 CSS Module 类名。',
  },
  {
    id: 'attributes',
    name: '链接属性',
    type: 'href / rel / aria-* / onClick / data-component',
    default: '—',
    description:
      '保留访问性、导航和点击语义；自定义渲染统一使用 Pagination.Page 标记，默认渲染的前后页各有独立标记。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Pagination 分页"
      description="基于链接的受控分页导航，支持窗口省略、响应式页码和自定义路由链接。"
    />
    <ComponentDocsSection title="受控分页">
      <template #description
        >点击后由调用方更新 currentPage；本示例阻止默认跳转。当前页为 {{ page }}。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <Pagination :page-count="15" :current-page="page" @page-change="changePage" />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="页码窗口">
      <template #description
        >分别增加两端保留页数和当前页附近的页数。窗口中的省略号不可点击。</template
      >
      <ComponentDocsDemoBlock :code="windowCode">
        <div>
          <Pagination
            :page-count="15"
            :current-page="5"
            :margin-page-count="4"
            @page-change="(event) => event.preventDefault()"
          />
          <Pagination
            :page-count="15"
            :current-page="5"
            :surrounding-page-count="4"
            @page-change="(event) => event.preventDefault()"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="隐藏页码">
      <template #description
        >第一行只显示前后页；第二行在视口小于 768px 时隐藏数字页，调整浏览器宽度观察变化。</template
      >
      <ComponentDocsDemoBlock :code="responsiveCode">
        <div>
          <Pagination
            :page-count="15"
            :current-page="5"
            :show-pages="false"
            @page-change="(event) => event.preventDefault()"
          />
          <Pagination
            :page-count="15"
            :current-page="5"
            :show-pages="{ narrow: false }"
            @page-change="(event) => event.preventDefault()"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="RouterLink 组合">
      <template #description
        >renderPage 显式生成 RouterLink。点击后更新受控页号和当前地址的 page 查询参数；不阻止
        RouterLink 自身导航。</template
      >
      <ComponentDocsDemoBlock :code="routerCode">
        <Pagination
          :page-count="15"
          :current-page="routerPage"
          :render-page="renderRouterPage"
          @page-change="(_event, number) => (routerPage = number)"
        />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="Pagination API" variant="api">
      <template #description
        >导出 Pagination、PaginationProps 和 PageProps。根元素为带 aria-label="Pagination" 的
        nav；可通过原生属性覆盖名称。组件沿用原生链接的 Tab 和 Enter
        行为，不实现方向键切页或自动移动焦点；禁用前后页无 href，并带 aria-hidden 和
        aria-disabled。与 DataTable 的 Table.Pagination 是不同组件。源组件没有 forwardRef 和
        children API，因此本组件不提供 DOM ref 合同或内容插槽。</template
      >
      <VisuallyHidden :id="`${documentationId}-pagination-api`">Pagination API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-pagination-api`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>
    <ComponentDocsSection title="PageProps API" variant="api">
      <template #description
        >renderPage 返回 Vue VNode；省略号始终由组件渲染为 span
        role="presentation"。默认图标、禁用状态和页码标签均包含在回调参数中。</template
      >
      <VisuallyHidden :id="`${documentationId}-page-api`">PageProps API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-page-api`"
        :columns="columns"
        :data="pageRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
