<script setup lang="ts">
import { useId } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeftIcon, GitBranchIcon } from '@onlikee/octicons-vue'
import { PageHeader } from '@/components/primer-vue/PageHeader'
import { Button, IconButton } from '@/components/primer-vue/Button'
import { Breadcrumbs, BreadcrumbsItem } from '@/components/primer-vue/Breadcrumbs'
import { Label } from '@/components/primer-vue/Label'
import { UnderlineNav } from '@/components/primer-vue/UnderlineNav'
import { ActionMenu } from '@/components/primer-vue/ActionMenu'
import { ActionList } from '@/components/primer-vue/ActionList'
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
  basic: `<PageHeader has-border>
  <PageHeader.TitleArea>
    <PageHeader.Title as="h1">Branches</PageHeader.Title>
    <PageHeader.LeadingVisual><GitBranchIcon :size="24" /></PageHeader.LeadingVisual>
    <PageHeader.TrailingVisual><Label>Public</Label></PageHeader.TrailingVisual>
  </PageHeader.TitleArea>
  <PageHeader.Actions><Button variant="primary">New branch</Button></PageHeader.Actions>
  <PageHeader.Description>Manage branches in this repository.</PageHeader.Description>
</PageHeader>`,
  responsive: `<PageHeader has-border>
  <PageHeader.TitleArea :variant="{ narrow: 'medium', regular: 'large' }">
    <PageHeader.Title>Repository settings</PageHeader.Title>
  </PageHeader.TitleArea>
  <PageHeader.ContextArea>
    <PageHeader.ParentLink href="#repository">Repository</PageHeader.ParentLink>
    <PageHeader.ContextAreaActions><Button size="small">Help</Button></PageHeader.ContextAreaActions>
  </PageHeader.ContextArea>
  <PageHeader.LeadingAction>
    <IconButton :icon="ArrowLeftIcon" aria-label="Back to repository" />
  </PageHeader.LeadingAction>
  <PageHeader.TrailingAction><Button>Help</Button></PageHeader.TrailingAction>
  <PageHeader.Actions><Button variant="primary">Save</Button></PageHeader.Actions>
</PageHeader>`,
  navigation: `<PageHeader has-border>
  <PageHeader.TitleArea><PageHeader.Title>Repository</PageHeader.Title></PageHeader.TitleArea>
  <PageHeader.ContextArea :hidden="false">
    <PageHeader.ContextBar :hidden="false">
      <Breadcrumbs>
        <BreadcrumbsItem href="#organization">onlikee</BreadcrumbsItem>
        <BreadcrumbsItem href="#repository" selected>repository</BreadcrumbsItem>
      </Breadcrumbs>
    </PageHeader.ContextBar>
  </PageHeader.ContextArea>
  <PageHeader.Actions>
    <ActionMenu>
      <ActionMenu.Button>More</ActionMenu.Button>
      <ActionMenu.Overlay><ActionList><ActionList.Item>Watch repository</ActionList.Item></ActionList></ActionMenu.Overlay>
    </ActionMenu>
  </PageHeader.Actions>
  <PageHeader.Navigation :hidden="{ narrow: true }">
    <UnderlineNav aria-label="Repository">
      <UnderlineNav.Item href="#code" aria-current="page">Code</UnderlineNav.Item>
      <UnderlineNav.Item href="#issues">Issues</UnderlineNav.Item>
    </UnderlineNav>
  </PageHeader.Navigation>
</PageHeader>`,
  breadcrumbs: `<PageHeader>
  <PageHeader.TitleArea variant="subtitle"><PageHeader.Title>Branches</PageHeader.Title></PageHeader.TitleArea>
  <PageHeader.Breadcrumbs>
    <Breadcrumbs><BreadcrumbsItem href="#repository">repository</BreadcrumbsItem></Breadcrumbs>
  </PageHeader.Breadcrumbs>
</PageHeader>`,
  router: `<PageHeader as="header" aria-label="Branches">
  <PageHeader.TitleArea><PageHeader.Title>Branches</PageHeader.Title></PageHeader.TitleArea>
  <PageHeader.ContextArea :hidden="false">
    <PageHeader.ParentLink :as="RouterLink" to="/component/page-header" :hidden="false">Component docs</PageHeader.ParentLink>
  </PageHeader.ContextArea>
  <PageHeader.Navigation as="nav" aria-label="Branch navigation">
    <a href="#all">All branches</a>
  </PageHeader.Navigation>
</PageHeader>`,
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
    default: 'div',
    description: '根标签或自定义组件，支持对应元素或组件的属性。',
  },
  {
    id: 'hasBorder',
    name: 'hasBorder',
    type: 'boolean',
    default: 'undefined',
    description: '没有可见 Navigation 时显示底边框和底部间距。',
  },
  {
    id: 'role',
    name: 'role / aria-label',
    type: 'ARIA 属性',
    default: 'undefined',
    description: '仅在显式提供时输出；不会自动添加 banner 角色。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: 'undefined',
    description: '所有组件支持，与 Vue class 和内置类合并。',
  },
]
const childRows: DocumentationRow[] = [
  {
    id: 'hidden',
    name: 'hidden',
    type: 'boolean | { narrow?: boolean; regular?: boolean; wide?: boolean }',
    default: '依组件而定',
    description: '通过 CSS 隐藏区域，不改变 DOM 顺序或卸载内容；每个嵌套区域分别控制可见性。',
  },
  {
    id: 'variant',
    name: 'TitleArea.variant',
    type: "'medium' | 'large' | 'subtitle' | 响应式对象",
    default: 'medium',
    description:
      'medium 为 20px 半粗体，large 为 32px 常规字重，subtitle 为 20px 常规字重；使用主题 token。',
  },
  {
    id: 'title-as',
    name: 'Title.as',
    type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'",
    default: 'h2',
    description: '保持真实标题语义，大小由 TitleArea.variant 决定。',
  },
  {
    id: 'parent-as',
    name: 'ParentLink.as / 链接属性',
    type: '原生标签 | Component / 原生链接属性',
    default: 'a',
    description:
      '复用 muted Link，包含左箭头及包裹内容的 div，支持 href、target、rel、download 和自定义组件属性。',
  },
  {
    id: 'navigation-as',
    name: 'Navigation.as',
    type: "'nav' | 'div'",
    default: 'div',
    description: '仅 as="nav" 时输出 aria-label / aria-labelledby；nav 应提供可访问名称。',
  },
]
const regionRows: DocumentationRow[] = [
  {
    id: 'context',
    name: 'ContextArea',
    type: '根区域',
    default: '仅 narrow 可见',
    description:
      '包含 ParentLink、ContextBar 和 ContextAreaActions；这三个子组件默认也仅 narrow 可见。',
  },
  {
    id: 'title',
    name: 'TitleArea',
    type: '根区域',
    default: '全部可见',
    description: '包含 Title、LeadingVisual、TrailingVisual；视觉按图标、标题、尾部标识排列。',
  },
  {
    id: 'leading',
    name: 'LeadingAction / TrailingAction',
    type: '根区域',
    default: 'regular / wide 可见',
    description: '标题左右的操作；窄屏通常使用 ParentLink 或 ContextAreaActions。',
  },
  {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    type: '根区域',
    default: '全部可见',
    description: '放置 Breadcrumbs 组件，与标题同行；ContextBar 则位于标题上方。',
  },
  {
    id: 'actions',
    name: 'Actions',
    type: '根区域',
    default: '全部可见',
    description: '标题行右侧操作，适合 Button 和 ActionMenu。',
  },
  {
    id: 'description',
    name: 'Description',
    type: '根区域',
    default: '全部可见',
    description: '标题下方描述，使用正文大小与行高。',
  },
  {
    id: 'navigation',
    name: 'Navigation',
    type: '根区域',
    default: '全部可见',
    description: '最下方的本地导航，适合 UnderlineNav；导航可见时由导航负责底部分隔。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="PageHeader 页面标题"
      description="组合页面标题、上下文导航、操作与局部导航，响应窄屏、常规与宽屏布局。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description
        >TitleArea 的 variant 控制标题大小，Title 的 as
        控制标题层级；操作和描述作为根组件的直接子组件。</template
      >
      <ComponentDocsDemoBlock :code="codes.basic">
        <PageHeader has-border class="page-header-demo">
          <PageHeader.TitleArea>
            <PageHeader.Title as="h1">Branches</PageHeader.Title>
            <PageHeader.LeadingVisual><GitBranchIcon :size="24" /></PageHeader.LeadingVisual>
            <PageHeader.TrailingVisual><Label>Public</Label></PageHeader.TrailingVisual>
          </PageHeader.TitleArea>
          <PageHeader.Actions><Button variant="primary">New branch</Button></PageHeader.Actions>
          <PageHeader.Description>Manage branches in this repository.</PageHeader.Description>
        </PageHeader>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="响应式上下文与操作">
      <template #description
        >小于 768px 时显示 ContextArea，768px 及以上显示 LeadingAction 和 TrailingAction。regular 从
        768px 开始持续生效，wide 从 1400px 开始覆盖同一属性。调整浏览器宽度查看布局。</template
      >
      <ComponentDocsDemoBlock :code="codes.responsive">
        <PageHeader has-border class="page-header-demo">
          <PageHeader.TitleArea :variant="{ narrow: 'medium', regular: 'large' }"
            ><PageHeader.Title>Repository settings</PageHeader.Title></PageHeader.TitleArea
          >
          <PageHeader.ContextArea>
            <PageHeader.ParentLink href="#repository">Repository</PageHeader.ParentLink>
            <PageHeader.ContextAreaActions
              ><Button size="small">Help</Button></PageHeader.ContextAreaActions
            >
          </PageHeader.ContextArea>
          <PageHeader.LeadingAction
            ><IconButton :icon="ArrowLeftIcon" aria-label="Back to repository"
          /></PageHeader.LeadingAction>
          <PageHeader.TrailingAction><Button>Help</Button></PageHeader.TrailingAction>
          <PageHeader.Actions><Button variant="primary">Save</Button></PageHeader.Actions>
        </PageHeader>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="面包屑、菜单与局部导航">
      <template #description
        >ContextBar 可在标题上方放置面包屑。这里同时取消 ContextArea 和 ContextBar
        的默认隐藏。Navigation 包含自身使用 nav 的 UnderlineNav 时，保持默认 div 即可。</template
      >
      <ComponentDocsDemoBlock :code="codes.navigation">
        <PageHeader has-border class="page-header-demo">
          <PageHeader.TitleArea
            ><PageHeader.Title>Repository</PageHeader.Title></PageHeader.TitleArea
          >
          <PageHeader.ContextArea :hidden="false">
            <PageHeader.ContextBar :hidden="false"
              ><Breadcrumbs
                ><BreadcrumbsItem href="#organization">onlikee</BreadcrumbsItem
                ><BreadcrumbsItem href="#repository" selected
                  >repository</BreadcrumbsItem
                ></Breadcrumbs
              ></PageHeader.ContextBar
            >
          </PageHeader.ContextArea>
          <PageHeader.Actions
            ><ActionMenu
              ><ActionMenu.Button>More</ActionMenu.Button
              ><ActionMenu.Overlay
                ><ActionList
                  ><ActionList.Item>Watch repository</ActionList.Item></ActionList
                ></ActionMenu.Overlay
              ></ActionMenu
            ></PageHeader.Actions
          >
          <PageHeader.Navigation :hidden="{ narrow: true }"
            ><UnderlineNav aria-label="Repository"
              ><UnderlineNav.Item href="#code" aria-current="page">Code</UnderlineNav.Item
              ><UnderlineNav.Item href="#issues">Issues</UnderlineNav.Item></UnderlineNav
            ></PageHeader.Navigation
          >
        </PageHeader>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="同行面包屑与副标题">
      <ComponentDocsDemoBlock :code="codes.breadcrumbs">
        <PageHeader class="page-header-demo"
          ><PageHeader.TitleArea variant="subtitle"
            ><PageHeader.Title>Branches</PageHeader.Title></PageHeader.TitleArea
          ><PageHeader.Breadcrumbs
            ><Breadcrumbs
              ><BreadcrumbsItem href="#repository">repository</BreadcrumbsItem></Breadcrumbs
            ></PageHeader.Breadcrumbs
          ></PageHeader
        >
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="自定义元素与路由链接">
      <ComponentDocsDemoBlock :code="codes.router">
        <PageHeader as="header" aria-label="Branches" class="page-header-demo">
          <PageHeader.TitleArea><PageHeader.Title>Branches</PageHeader.Title></PageHeader.TitleArea>
          <PageHeader.ContextArea :hidden="false"
            ><PageHeader.ParentLink :as="RouterLink" to="/component/page-header" :hidden="false"
              >Component docs</PageHeader.ParentLink
            ></PageHeader.ContextArea
          >
          <PageHeader.Navigation as="nav" aria-label="Branch navigation"
            ><a href="#all">All branches</a></PageHeader.Navigation
          >
        </PageHeader>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="PageHeader 属性" variant="api">
      <VisuallyHidden :id="`${documentationId}-root`">PageHeader 属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-root`"
        :columns="columns"
        :data="rootRows"
      />
    </ComponentDocsSection>
    <ComponentDocsSection title="子组件属性" variant="api">
      <VisuallyHidden :id="`${documentationId}-children`">PageHeader 子组件属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-children`"
        :columns="columns"
        :data="childRows"
      />
    </ComponentDocsSection>
    <ComponentDocsSection title="组合区域与默认可见性" variant="api">
      <VisuallyHidden :id="`${documentationId}-regions`">PageHeader 组合区域</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-regions`"
        :columns="columns"
        :data="regionRows"
      />
    </ComponentDocsSection>
    <ComponentDocsSection title="DOM 顺序、插槽与实例" variant="api">
      <p>
        所有内容通过各组件默认插槽提供，没有自定义事件。TitleArea 应放在 DOM
        最前面，ContextArea、LeadingAction 等随后提供；Grid 和 flex order
        决定视觉位置。存在上下文或前置操作时，避免在 TitleArea
        中放置链接、按钮或其他可聚焦元素，以保持焦点顺序与阅读顺序连贯。
      </p>
      <p>
        TitleArea 和 Navigation 应直接放在 PageHeader 默认插槽内；支持 template、条件和 v-for 形成的
        Fragment。任意 div 或自定义包装组件中的区域不参与根节点的标题大小和导航可见性提升。
      </p>
      <p>
        PageHeader、TitleArea 和 ParentLink 通过模板 ref 的 element 暴露底层根节点；卸载后为
        null。自定义 PageHeader 根组件暴露对应组件实例，ParentLink 复用 Link 的 DOM
        ref。组件族同时提供 PageHeaderX 独立导出和 Props、Instance 类型。
      </p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.page-header-demo {
  width: 100%;
}
</style>
