<script setup lang="ts">
import { useId } from 'vue'
import { RouterLink } from 'vue-router'
import { MarkGithubIcon } from '@onlikee/octicons-vue'
import { Header } from '@/components/primer-vue/Header'
import { Avatar } from '@/components/primer-vue/Avatar'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
  type DocumentationRow,
} from '../../components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '../../components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '../../components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '../../components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '../../components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useId()
const codes = {
  basic: `<script setup lang="ts">
import { Header } from '@/components/primer-vue/Header'
import { Avatar } from '@/components/primer-vue/Avatar'
import { MarkGithubIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <Header style="width: 100%">
    <Header.Item>
      <Header.Link href="#" style="gap: 8px">
        <MarkGithubIcon :size="32" />
        <span>GitHub</span>
      </Header.Link>
    </Header.Item>
    <Header.Item full>Menu</Header.Item>
    <Header.Item style="margin-right: 0">
      <Avatar src="https://github.com/octocat.png" :size="20" square alt="@octocat" />
    </Header.Item>
  </Header>
</template>`,
  full: `<Header style="width: 100%">
  <Header.Item>Item 1</Header.Item>
  <Header.Item full>Item 2</Header.Item>
  <Header.Item style="margin-right: 0">Item 3</Header.Item>
</Header>`,
  links: `<Header style="width: 100%">
  <Header.Item><Header.Link href="#">About</Header.Link></Header.Item>
  <Header.Item><Header.Link href="#">Releases</Header.Link></Header.Item>
  <Header.Item><Header.Link href="#">Team</Header.Link></Header.Item>
</Header>`,
  many: `<Header style="width: 100%">
  <Header.Item>
    <Header.Link href="#" aria-label="GitHub"><MarkGithubIcon :size="32" /></Header.Link>
  </Header.Item>
  <Header.Item v-for="index in 16" :key="index">Item {{ index }}</Header.Item>
</Header>`,
  custom: `<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Header } from '@/components/primer-vue/Header'
<\/script>

<template>
  <Header as="nav" aria-label="组件文档" style="width: 100%">
    <Header.Item>
      <Header.Link :as="RouterLink" to="/component/header">Header</Header.Link>
    </Header.Item>
    <Header.Item>
      <Header.Link :as="RouterLink" to="/component/heading">Heading</Header.Link>
    </Header.Item>
  </Header>
</template>`,
}
const columns: DocumentationColumn[] = [
  { field: 'name', header: '名称', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rootRows: DocumentationRow[] = [
  {
    id: 'as',
    name: 'as',
    type: '原生标签 | Component',
    default: 'header',
    description: '根元素或自定义组件。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '与 Vue class 和内置类合并。',
  },
]
const itemRows: DocumentationRow[] = [
  {
    id: 'full',
    name: 'full',
    type: 'boolean',
    default: 'undefined',
    description: '输出 data-full，使项目填满剩余空间。未传入时不输出该属性。',
  },
  { id: 'className', name: 'className', type: 'string', default: '—', description: '附加样式类。' },
]
const linkRows: DocumentationRow[] = [
  {
    id: 'as',
    name: 'as',
    type: '原生标签 | Component',
    default: 'a',
    description: '链接根元素，可传入 RouterLink。',
  },
  { id: 'href', name: 'href', type: 'string', default: '—', description: '原生链接目标。' },
  {
    id: 'to',
    name: 'to',
    type: 'RouteLocationRaw',
    default: '—',
    description: '直接透传给根组件；使用 RouterLink 时负责路由导航。',
  },
  { id: 'className', name: 'className', type: 'string', default: '—', description: '附加样式类。' },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Header 页头"
      description="使用 Header.Item 和 Header.Link 组合品牌、导航链接与账户信息。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description
        >默认使用 header 元素，项目以单行 flex 排列。末项的右外边距由调用方按需要设置。</template
      >
      <ComponentDocsDemoBlock :code="codes.basic">
        <Header class="header-demo">
          <Header.Item>
            <Header.Link href="#" style="gap: 8px">
              <MarkGithubIcon :size="32" /><span>GitHub</span>
            </Header.Link>
          </Header.Item>
          <Header.Item full>Menu</Header.Item>
          <Header.Item style="margin-right: 0">
            <Avatar src="https://github.com/octocat.png" :size="20" square alt="@octocat" />
          </Header.Item>
        </Header>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="填满剩余空间">
      <template #description>
        给中间项目设置 full 可将后续项目推至末端。与 React 源码一致，样式按 data-full
        是否存在匹配；显式传入 false 仍输出 data-full="false" 并拉伸，需要取消时应省略 full 或传入
        undefined。
      </template>
      <ComponentDocsDemoBlock :code="codes.full">
        <Header class="header-demo">
          <Header.Item>Item 1</Header.Item>
          <Header.Item full>Item 2</Header.Item>
          <Header.Item style="margin-right: 0">Item 3</Header.Item>
        </Header>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="导航链接">
      <template #description
        >Header.Link 默认渲染为 a，使用主题中的页头链接颜色，悬停与聚焦时改变文字颜色。</template
      >
      <ComponentDocsDemoBlock :code="codes.links">
        <Header class="header-demo">
          <Header.Item><Header.Link href="#">About</Header.Link></Header.Item>
          <Header.Item><Header.Link href="#">Releases</Header.Link></Header.Item>
          <Header.Item><Header.Link href="#">Team</Header.Link></Header.Item>
        </Header>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="较多项目">
      <template #description>项目不换行，内容超过可用宽度时在页头内部滚动。</template>
      <ComponentDocsDemoBlock :code="codes.many">
        <Header class="header-demo">
          <Header.Item
            ><Header.Link href="#" aria-label="GitHub"><MarkGithubIcon :size="32" /></Header.Link
          ></Header.Item>
          <Header.Item v-for="index in 16" :key="index">Item {{ index }}</Header.Item>
        </Header>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="自定义元素与路由链接">
      <template #description
        >as 改变渲染元素。to 仅透传，组件本身不解析路由，也不自动生成 href。</template
      >
      <ComponentDocsDemoBlock :code="codes.custom">
        <Header as="nav" aria-label="组件文档" class="header-demo">
          <Header.Item
            ><Header.Link :as="RouterLink" to="/component/header">Header</Header.Link></Header.Item
          >
          <Header.Item
            ><Header.Link :as="RouterLink" to="/component/heading"
              >Heading</Header.Link
            ></Header.Item
          >
        </Header>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="Header 属性" variant="api">
      <VisuallyHidden :id="`${documentationId}-root`">Header 属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-root`"
        :columns="columns"
        :data="rootRows"
      />
    </ComponentDocsSection>
    <ComponentDocsSection title="Header.Item 属性" variant="api">
      <VisuallyHidden :id="`${documentationId}-item`">Header.Item 属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-item`"
        :columns="columns"
        :data="itemRows"
      />
    </ComponentDocsSection>
    <ComponentDocsSection title="Header.Link 属性" variant="api">
      <VisuallyHidden :id="`${documentationId}-link`">Header.Link 属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-link`"
        :columns="columns"
        :data="linkRows"
      />
    </ComponentDocsSection>
    <ComponentDocsSection title="插槽、事件与组件实例" variant="api">
      <p>
        三个组件均使用默认插槽提供内容，支持 class、style、id、aria-*、data-*
        和原生事件透传，没有自定义事件。Header.Item 始终渲染为 div。
      </p>
      <p>
        通过模板 ref 的 element 访问根元素；自定义组件根返回其公开实例，卸载后为 null。对应导出
        HeaderInstance、HeaderItemInstance、HeaderLinkInstance 和各组件 Props 类型，也可以单独导入
        HeaderItem、HeaderLink。
      </p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.header-demo {
  width: 100%;
}
</style>
