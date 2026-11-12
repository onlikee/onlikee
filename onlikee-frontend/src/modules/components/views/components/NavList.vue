<script setup lang="ts">
import { h, useId } from 'vue'
import { RouterLink } from 'vue-router'
import { GearIcon, PersonIcon, RepoIcon } from '@onlikee/octicons-vue'
import { NavList, type NavListGroupItem } from '@/components/primer-vue/NavList'
import { Link } from '@/components/primer-vue/Link'
import { CounterLabel } from '@/components/primer-vue/CounterLabel'
import { FeatureFlags } from '@/components/primer-vue/FeatureFlags'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '../../components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '../../components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '../../components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '../../components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '../../components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useId()
const importCode = "import { NavList } from '@/components/primer-vue/NavList'"
const basicCode = `<NavList aria-label="个人设置">
  <NavList.Item href="#profile" aria-current="page">
    <NavList.LeadingVisual><PersonIcon /></NavList.LeadingVisual>
    个人资料
  </NavList.Item>
  <NavList.Item href="#repositories">
    <NavList.LeadingVisual><RepoIcon /></NavList.LeadingVisual>
    仓库
    <NavList.TrailingVisual><CounterLabel>12</CounterLabel></NavList.TrailingVisual>
  </NavList.Item>
  <NavList.Item inactive-text="需要管理员权限">组织管理</NavList.Item>
</NavList>`
const groupCode = `<NavList>
  <NavList.Heading as="h3">项目设置</NavList.Heading>
  <NavList.Group title="基本信息" hide-divider>
    <NavList.Item href="#general" aria-current="page">概览</NavList.Item>
    <NavList.Item href="#access">访问权限</NavList.Item>
  </NavList.Group>
  <NavList.Group>
    <NavList.GroupHeading>
      <Link href="#automation">自动化</Link>
    </NavList.GroupHeading>
    <NavList.Item href="#actions">Actions</NavList.Item>
    <NavList.Item href="#webhooks">Webhooks</NavList.Item>
  </NavList.Group>
</NavList>`
const nestedCode = `<NavList>
  <NavList.Heading visually-hidden>账户导航</NavList.Heading>
  <NavList.Item href="#overview">概览</NavList.Item>
  <NavList.Item>
    <NavList.LeadingVisual><GearIcon /></NavList.LeadingVisual>
    设置
    <NavList.SubNav>
      <NavList.Item href="#public" aria-current="page">公开资料</NavList.Item>
      <NavList.Item>
        安全
        <NavList.SubNav>
          <NavList.Item href="#password">密码</NavList.Item>
          <NavList.Item href="#sessions">登录会话</NavList.Item>
        </NavList.SubNav>
      </NavList.Item>
    </NavList.SubNav>
  </NavList.Item>
</NavList>`
const moreItems: NavListGroupItem[] = [
  { text: '项目 Alpha', href: '#alpha', leadingVisual: RepoIcon },
  { text: '项目 Beta', href: '#beta', leadingVisual: RepoIcon },
  { text: '项目 Gamma', href: '#gamma', leadingVisual: RepoIcon },
  { text: '项目 Delta', href: '#delta', leadingVisual: RepoIcon },
  { text: '项目 Epsilon', href: '#epsilon', leadingVisual: RepoIcon },
]
const expandCode = `<script setup lang="ts">
import { RepoIcon } from '@onlikee/octicons-vue'
import { NavList } from '@/components/primer-vue/NavList'

const items = [
  { text: '项目 Alpha', href: '#alpha', leadingVisual: RepoIcon },
  { text: '项目 Beta', href: '#beta', leadingVisual: RepoIcon },
  { text: '项目 Gamma', href: '#gamma', leadingVisual: RepoIcon },
  { text: '项目 Delta', href: '#delta', leadingVisual: RepoIcon },
  { text: '项目 Epsilon', href: '#epsilon', leadingVisual: RepoIcon },
]
<\/script>

<template>
  <NavList aria-label="项目">
    <NavList.Item href="#pinned">置顶项目</NavList.Item>
    <NavList.GroupExpand :items="items" :pages="2" label="显示更多" />
  </NavList>
</template>`
const customCode = `<script setup lang="ts">
import { h } from 'vue'
import { RouterLink } from 'vue-router'
import { NavList, type NavListGroupItem } from '@/components/primer-vue/NavList'
import { Link } from '@/components/primer-vue/Link'

const items = [{ text: '更多链接', href: '#more' }]
const renderItem = (item: NavListGroupItem) =>
  h(NavList.Item<typeof Link>, { as: Link, href: item.href,
    'data-expand-focus-target': item['data-expand-focus-target'] }, () => item.text)
<\/script>

<template>
  <NavList aria-label="组件文档">
    <NavList.Item :as="RouterLink" to="/component/nav-list">NavList</NavList.Item>
    <NavList.Item :as="Link" href="#examples" tooltip-text="查看组合示例">
      组合示例
      <NavList.Description variant="block">使用现有 Link 组件</NavList.Description>
      <NavList.TrailingAction as="a" href="#api" label="API" />
    </NavList.Item>
    <NavList.GroupExpand :items="items" :render-item="renderItem" label="更多链接" />
  </NavList>
</template>`
const customItems = [{ text: '更多链接', href: '#more' }]
const renderItem = (item: NavListGroupItem) =>
  h(
    NavList.Item<typeof Link>,
    {
      as: Link,
      href: item.href,
      'data-expand-focus-target': item['data-expand-focus-target'],
    },
    () => item.text,
  )
const gapCode = `<FeatureFlags :flags="{ primer_react_action_list_item_gap: true }">
  <NavList aria-label="带间距的导航">
    <NavList.Item default-open>
      项目
      <NavList.SubNav>
        <NavList.Item href="#code">代码</NavList.Item>
        <NavList.Item href="#issues">Issues</NavList.Item>
      </NavList.SubNav>
    </NavList.Item>
    <NavList.Item href="#settings">设置</NavList.Item>
  </NavList>
</FeatureFlags>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性 / 组件', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rows = [
  {
    id: 'root',
    name: 'NavList',
    type: 'nav 属性、className、disableItemGap',
    default: 'disableItemGap: false',
    description:
      '固定 nav + ActionList；支持 aria-label / aria-labelledby。Heading 自动提供名称；实例 element 为 nav。',
  },
  {
    id: 'heading',
    name: 'Heading',
    type: "as: 'h2' | 'h3'; visuallyHidden: boolean",
    default: "'h2'; false",
    description: '直接子标题置于列表之前，支持自定义 id。视觉隐藏保留语义。',
  },
  {
    id: 'item',
    name: 'Item',
    type: 'as、href、aria-current、defaultOpen、inactiveText、tooltipText',
    default: "as: 'a'; defaultOpen: false",
    description:
      '叶子条目透传目标元素/组件属性和事件，aria-current 标记活动行。实例 element 为链接；折叠父项不转发属性、事件或 DOM ref。',
  },
  {
    id: 'subnav',
    name: 'SubNav',
    type: '默认插槽',
    default: '关闭；含当前项时自动打开',
    description:
      '作为 Item 直接子节点，最多嵌套四层。子项始终挂载，折叠由 CSS 控制；不透传其他属性。',
  },
  {
    id: 'group',
    name: 'Group',
    type: 'title?: string; hideDivider?: boolean; li 属性',
    default: 'hideDivider: false',
    description:
      '默认前置 Divider，首个 Divider 由 CSS 隐藏。显式 GroupHeading 优先于 title，支持 Fragment 和 asSlot 包装。',
  },
  {
    id: 'group-heading',
    name: 'GroupHeading',
    type: 'ActionListGroupHeadingProps',
    default: '无 Heading 时 h3；否则低一级',
    description:
      '在 h3 导航标题下默认为 h4，可用 as 覆盖。独立使用包装为 li，在 Group 中包装为 div 并为子列表命名。',
  },
  {
    id: 'expand',
    name: 'GroupExpand',
    type: 'items; pages?; label?; renderItem?',
    default: "pages: 0; label: 'Show more'",
    description:
      '初始隐藏全部 items；pages=0 一次展示，正数按页展示。展开后将焦点移到新增条目，完成时移除按钮。',
  },
  {
    id: 'render-item',
    name: 'renderItem',
    type: '(item: NavListGroupItem) => VNodeChild',
    default: '默认渲染 Item',
    description:
      '自定义条目需将 data-expand-focus-target 转发给可聚焦元素。items 支持 leadingVisual / trailingVisual 组件和 trailingAction。',
  },
  {
    id: 'shared',
    name: 'Description / LeadingVisual / TrailingVisual / TrailingAction / Divider',
    type: '对应 ActionList 子组件',
    default: '沿用 ActionList',
    description: '可互换使用；SubNav 父项会过滤 TrailingAction，叶子条目保留。',
  },
  {
    id: 'slots',
    name: '默认插槽',
    type: 'NavList 子组件',
    default: '—',
    description:
      '对应 children。Heading 和 SubNav 直接匹配，包装组件用 asSlot 复制标记；Group 额外支持显式 Fragment 中的标题。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="NavList 导航列表"
      description="用于页面或区域导航，支持分组、嵌套导航和按页展示更多条目。"
    />
    <ComponentDocsSection title="引入">
      <ComponentDocsDemoBlock :code="importCode"><code>NavList</code></ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="基础导航">
      <ComponentDocsDemoBlock :code="basicCode">
        <NavList class="nav-demo" aria-label="个人设置">
          <NavList.Item href="#profile" aria-current="page">
            <NavList.LeadingVisual><PersonIcon /></NavList.LeadingVisual>
            个人资料
          </NavList.Item>
          <NavList.Item href="#repositories">
            <NavList.LeadingVisual><RepoIcon /></NavList.LeadingVisual>
            仓库
            <NavList.TrailingVisual><CounterLabel>12</CounterLabel></NavList.TrailingVisual>
          </NavList.Item>
          <NavList.Item inactive-text="需要管理员权限">组织管理</NavList.Item>
        </NavList>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="标题与分组">
      <template #description
        >导航标题自动命名 nav，分组标题默认比导航标题低一级。显式 GroupHeading 优先于 title，可组合
        Link。</template
      >
      <ComponentDocsDemoBlock :code="groupCode">
        <NavList class="nav-demo">
          <NavList.Heading as="h3">项目设置</NavList.Heading>
          <NavList.Group title="基本信息" hide-divider>
            <NavList.Item href="#general" aria-current="page">概览</NavList.Item>
            <NavList.Item href="#access">访问权限</NavList.Item>
          </NavList.Group>
          <NavList.Group>
            <NavList.GroupHeading><Link href="#automation">自动化</Link></NavList.GroupHeading>
            <NavList.Item href="#actions">Actions</NavList.Item>
            <NavList.Item href="#webhooks">Webhooks</NavList.Item>
          </NavList.Group>
        </NavList>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="嵌套导航">
      <template #description
        >当前条目的所有父项首次渲染即展开，也可以手动折叠。Tab 在链接与展开按钮间移动，Enter / Space
        操作展开按钮。</template
      >
      <ComponentDocsDemoBlock :code="nestedCode">
        <NavList class="nav-demo">
          <NavList.Heading visually-hidden>账户导航</NavList.Heading>
          <NavList.Item href="#overview">概览</NavList.Item>
          <NavList.Item>
            <NavList.LeadingVisual><GearIcon /></NavList.LeadingVisual>
            设置
            <NavList.SubNav>
              <NavList.Item href="#public" aria-current="page">公开资料</NavList.Item>
              <NavList.Item>
                安全
                <NavList.SubNav>
                  <NavList.Item href="#password">密码</NavList.Item>
                  <NavList.Item href="#sessions">登录会话</NavList.Item>
                </NavList.SubNav>
              </NavList.Item>
            </NavList.SubNav>
          </NavList.Item>
        </NavList>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="显示更多">
      <template #description
        >5 个条目分两页，依次展示 3 个、2 个；每次展开将焦点移到首个新增条目。</template
      >
      <ComponentDocsDemoBlock :code="expandCode">
        <NavList class="nav-demo" aria-label="项目">
          <NavList.Item href="#pinned">置顶项目</NavList.Item>
          <NavList.GroupExpand :items="moreItems" :pages="2" label="显示更多" />
        </NavList>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="组合链接与自定义条目">
      <template #description
        >as 支持 Link、RouterLink 和其他链接组件。RouterLink 计算 aria-current；活动行需要向 Item
        显式传入 aria-current。自定义展开条目保留焦点标记。</template
      >
      <ComponentDocsDemoBlock :code="customCode">
        <NavList class="nav-demo" aria-label="组件文档">
          <NavList.Item :as="RouterLink" to="/component/nav-list">NavList</NavList.Item>
          <NavList.Item :as="Link" href="#examples" tooltip-text="查看组合示例">
            组合示例
            <NavList.Description variant="block">使用现有 Link 组件</NavList.Description>
            <NavList.TrailingAction as="a" href="#api" label="API" />
          </NavList.Item>
          <NavList.GroupExpand :items="customItems" :render-item="renderItem" label="更多链接" />
        </NavList>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="条目间距">
      <template #description
        >开启 item gap 标志时，条目之间及展开的子导航之前增加 2px 间距。NavList 的 disableItemGap
        可单独关闭。</template
      >
      <ComponentDocsDemoBlock :code="gapCode">
        <FeatureFlags :flags="{ primer_react_action_list_item_gap: true }">
          <NavList class="nav-demo" aria-label="带间距的导航">
            <NavList.Item default-open>
              项目
              <NavList.SubNav>
                <NavList.Item href="#code">代码</NavList.Item>
                <NavList.Item href="#issues">Issues</NavList.Item>
              </NavList.SubNav>
            </NavList.Item>
            <NavList.Item href="#settings">设置</NavList.Item>
          </NavList>
        </FeatureFlags>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <VisuallyHidden :id="`${documentationId}-api`">NavList API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.nav-demo {
  width: 320px;
  max-width: 100%;
}
</style>
