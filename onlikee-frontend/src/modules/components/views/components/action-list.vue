<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ActionList 操作列表"
      description="用于下拉菜单、选择列表、分组菜单和链接操作的列表组件。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        <code>ActionList</code> 提供列表容器，<code>ActionList.Item</code> 和 <code>ActionList.LinkItem</code> 提供按钮与链接两类操作项。
      </template>

      <ComponentDocsDemoBlock :code="demo1Code">
        <ActionList class="demo-list">
          <ActionList.Item>
            <ActionList.LeadingVisual>
              <FileIcon />
            </ActionList.LeadingVisual>
            新建文件
          </ActionList.Item>
          <ActionList.Item>
            <ActionList.LeadingVisual>
              <RepoIcon />
            </ActionList.LeadingVisual>
            新建仓库
            <ActionList.TrailingVisual>
              <ChevronRightIcon />
            </ActionList.TrailingVisual>
          </ActionList.Item>
          <ActionList.LinkItem
            href="https://github.com"
            new-tab
          >
            <ActionList.LeadingVisual>
              <MarkGithubIcon />
            </ActionList.LeadingVisual>
            打开 GitHub
            <ActionList.TrailingVisual>
              <LinkExternalIcon />
            </ActionList.TrailingVisual>
          </ActionList.LinkItem>
        </ActionList>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="容器样式">
      <template #description>
        通过 <code>variant</code> 控制列表与容器边缘的关系，通过 <code>showDividers</code> 显示连续项之间的细分隔线。
      </template>

      <ComponentDocsDemoBlock :code="demo2Code">
        <div class="demo-grid demo-grid-3">
          <div class="demo-surface">
            <div class="demo-caption">
              inset
            </div>
            <ActionList
              variant="inset"
              show-dividers
            >
              <ActionList.Item>
                Issues
              </ActionList.Item>
              <ActionList.Item>
                Pull requests
              </ActionList.Item>
              <ActionList.Item>
                Discussions
              </ActionList.Item>
            </ActionList>
          </div>

          <div class="demo-surface">
            <div class="demo-caption">
              horizontal-inset
            </div>
            <ActionList
              variant="horizontal-inset"
              show-dividers
            >
              <ActionList.Item>
                个人资料
              </ActionList.Item>
              <ActionList.Item>
                设置
              </ActionList.Item>
              <ActionList.Item>
                通知
              </ActionList.Item>
            </ActionList>
          </div>

          <div class="demo-surface">
            <div class="demo-caption">
              full
            </div>
            <ActionList
              variant="full"
              show-dividers
            >
              <ActionList.Item>
                README.md
              </ActionList.Item>
              <ActionList.Item>
                package.json
              </ActionList.Item>
              <ActionList.Item>
                vite.config.ts
              </ActionList.Item>
            </ActionList>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="视觉区域和说明">
      <template #description>
        leading、description 和 trailing 区域遵循 Primer ActionList 的排列方式；说明文字支持 inline、block 和截断。
      </template>

      <ComponentDocsDemoBlock :code="demo3Code">
        <ActionList class="demo-list-wide">
          <ActionList.Item>
            <ActionList.LeadingVisual>
              <RepoIcon />
            </ActionList.LeadingVisual>
            onlikee
            <ActionList.Description variant="block">
              Vue 组件库中的操作列表菜单
            </ActionList.Description>
            <ActionList.TrailingVisual>
              <span class="demo-counter">12</span>
            </ActionList.TrailingVisual>
          </ActionList.Item>
          <ActionList.Item>
            <ActionList.LeadingVisual>
              <FileCodeIcon />
            </ActionList.LeadingVisual>
            ActionList.vue
            <ActionList.Description truncate>
              最近更新于 2 小时前，包含基础结构、键盘焦点和视觉样式
            </ActionList.Description>
            <ActionList.TrailingVisual>
              <LinkExternalIcon />
            </ActionList.TrailingVisual>
          </ActionList.Item>
          <ActionList.Item
            size="large"
          >
            <ActionList.LeadingVisual>
              <ArchiveIcon />
            </ActionList.LeadingVisual>
            Large item
            <ActionList.Description variant="block">
              使用 <code>size="large"</code> 时，列表项垂直间距更大。
            </ActionList.Description>
          </ActionList.Item>
        </ActionList>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="选择状态">
      <template #description>
        在列表上设置 <code>selectionVariant</code>，再由每个列表项的 <code>selected</code> 控制单选或多选状态。
      </template>

      <ComponentDocsDemoBlock :code="demo4Code">
        <div class="demo-grid">
          <ActionList
            selection-variant="single"
            class="demo-list"
          >
            <ActionList.Item
              v-for="item in visibilityOptions"
              :key="item.label"
              :selected="selectedVisibility === item.label"
              @select="selectedVisibility = item.label"
            >
              <ActionList.LeadingVisual>
                <component :is="item.icon" />
              </ActionList.LeadingVisual>
              {{ item.label }}
              <ActionList.Description variant="block">
                {{ item.description }}
              </ActionList.Description>
            </ActionList.Item>
          </ActionList>

          <ActionList
            selection-variant="multiple"
            class="demo-list"
          >
            <ActionList.Item
              v-for="item in filterOptions"
              :key="item"
              :selected="selectedFilters.includes(item)"
              @select="toggleFilter(item)"
            >
              {{ item }}
            </ActionList.Item>
          </ActionList>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="项目状态">
      <template #description>
        列表项支持 active、disabled、loading、danger 与 selected 的视觉状态组合。
      </template>

      <ComponentDocsDemoBlock :code="demo5Code">
        <ActionList
          class="demo-list"
          selection-variant="single"
        >
          <ActionList.Item
            selected
            active
          >
            <ActionList.LeadingVisual>
              <ProjectIcon />
            </ActionList.LeadingVisual>
            当前项目
          </ActionList.Item>
          <ActionList.Item disabled>
            <ActionList.LeadingVisual>
              <LockIcon />
            </ActionList.LeadingVisual>
            暂不可用
          </ActionList.Item>
          <ActionList.Item loading>
            正在同步
          </ActionList.Item>
          <ActionList.Divider />
          <ActionList.Item variant="danger">
            <ActionList.LeadingVisual>
              <TrashIcon />
            </ActionList.LeadingVisual>
            删除项目
          </ActionList.Item>
        </ActionList>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="分组标题和分隔线">
      <template #description>
        使用 <code>ActionList.Group</code>、<code>ActionList.GroupHeading</code> 与 <code>ActionList.Divider</code> 组织更复杂的菜单结构。
      </template>

      <ComponentDocsDemoBlock :code="demo6Code">
        <ActionList class="demo-list-wide">
          <ActionList.Group>
            <ActionList.GroupHeading>代码</ActionList.GroupHeading>
            <ActionList.Item>
              <ActionList.LeadingVisual>
                <CodeIcon />
              </ActionList.LeadingVisual>
              打开 Codespace
            </ActionList.Item>
            <ActionList.Item>
              <ActionList.LeadingVisual>
                <GitBranchIcon />
              </ActionList.LeadingVisual>
              切换分支
              <ActionList.TrailingVisual>
                main
              </ActionList.TrailingVisual>
            </ActionList.Item>
          </ActionList.Group>

          <ActionList.Group>
            <ActionList.GroupHeading variant="filled">
              访问范围
              <ActionList.GroupHeadingTrailingAction>
                <span class="demo-heading-action">管理</span>
              </ActionList.GroupHeadingTrailingAction>
            </ActionList.GroupHeading>
            <ActionList.Item>
              <ActionList.LeadingVisual>
                <PeopleIcon />
              </ActionList.LeadingVisual>
              团队成员
              <ActionList.Description variant="block">
                对组织中的成员开放
              </ActionList.Description>
            </ActionList.Item>
            <ActionList.Item>
              <ActionList.LeadingVisual>
                <ShieldLockIcon />
              </ActionList.LeadingVisual>
              受保护
              <ActionList.Description variant="block">
                需要额外权限才能访问
              </ActionList.Description>
            </ActionList.Item>
          </ActionList.Group>

          <ActionList.Divider />

          <ActionList.Item variant="danger">
            <ActionList.LeadingVisual>
              <SignOutIcon />
            </ActionList.LeadingVisual>
            退出组织
          </ActionList.Item>
        </ActionList>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="链接项">
      <template #description>
        <code>ActionList.LinkItem</code> 使用相同的视觉结构渲染链接，并支持链接属性与列表项状态。
      </template>

      <ComponentDocsDemoBlock :code="demo7Code">
        <ActionList class="demo-list">
          <ActionList.LinkItem
            href="https://github.com/UnderHear"
            new-tab
          >
            <ActionList.LeadingVisual>
              <MarkGithubIcon />
            </ActionList.LeadingVisual>
            UnderHear
            <ActionList.TrailingVisual>
              <LinkExternalIcon />
            </ActionList.TrailingVisual>
          </ActionList.LinkItem>
          <ActionList.LinkItem
            href="https://vuejs.org"
            new-tab
            active
          >
            <ActionList.LeadingVisual>
              <BookIcon />
            </ActionList.LeadingVisual>
            Vue 文档
          </ActionList.LinkItem>
          <ActionList.LinkItem
            href="https://vitejs.dev"
            disabled
          >
            <ActionList.LeadingVisual>
              <ZapIcon />
            </ActionList.LeadingVisual>
            暂不可访问
          </ActionList.LinkItem>
        </ActionList>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="配合 Dropdown 使用">
      <template #description>
        ActionList 可以直接放入 Dropdown 内容区，形成 Primer 风格的操作面板。
      </template>

      <ComponentDocsDemoBlock :code="demo8Code">
        <Dropdown>
          <Dropdown.trigger>
            <Button>
              更多操作
              <Button.trailingVisual>
                <TriangleDownIcon />
              </Button.trailingVisual>
            </Button>
          </Dropdown.trigger>
          <Dropdown.content>
            <ActionList>
              <ActionList.Item>
                <ActionList.LeadingVisual>
                  <PencilIcon />
                </ActionList.LeadingVisual>
                编辑
              </ActionList.Item>
              <ActionList.Item>
                <ActionList.LeadingVisual>
                  <CopyIcon />
                </ActionList.LeadingVisual>
                复制
              </ActionList.Item>
              <ActionList.Divider />
              <ActionList.Item variant="danger">
                <ActionList.LeadingVisual>
                  <TrashIcon />
                </ActionList.LeadingVisual>
                删除
              </ActionList.Item>
            </ActionList>
          </Dropdown.content>
        </Dropdown>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h4>ActionList Props</h4>
      <Table
        :columns="apiTableColumns"
        :data="actionListPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h4>ActionList.Item Props</h4>
      <Table
        :columns="apiTableColumns"
        :data="actionListItemPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h4>ActionList.LinkItem Props</h4>
      <Table
        :columns="apiTableColumns"
        :data="actionListLinkItemPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h4>ActionList.Description Props</h4>
      <Table
        :columns="apiTableColumns"
        :data="actionListDescriptionPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h4>ActionList.Group Props</h4>
      <Table
        :columns="apiTableColumns"
        :data="actionListGroupPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h4>ActionList.GroupHeading Props</h4>
      <Table
        :columns="apiTableColumns"
        :data="actionListGroupHeadingPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h4>Events</h4>
      <Table
        :columns="eventsTableColumns"
        :data="eventsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h4>Slots</h4>
      <Table
        :columns="slotsTableColumns"
        :data="slotsRows"
        row-key="key"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ActionList } from '@/components/primer-vue/ActionList'
import { Button } from '@/components/primer-vue/Button'
import { Dropdown } from '@/components/primer-vue/Dropdown'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import {
  ArchiveIcon,
  BookIcon,
  ChevronRightIcon,
  CodeIcon,
  CopyIcon,
  EyeClosedIcon,
  EyeIcon,
  FileCodeIcon,
  FileIcon,
  GitBranchIcon,
  LinkExternalIcon,
  LockIcon,
  MarkGithubIcon,
  PencilIcon,
  PeopleIcon,
  ProjectIcon,
  RepoIcon,
  ShieldLockIcon,
  SignOutIcon,
  TrashIcon,
  TriangleDownIcon,
  ZapIcon
} from '@/components/octicons-vue3'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const visibilityOptions = [
  {
    label: '公开的',
    description: '所有人都能在应用广场看见它。',
    icon: EyeIcon
  },
  {
    label: '私有的',
    description: '仅自己可以在个人应用中管理。',
    icon: EyeClosedIcon
  }
]
const filterOptions = ['Issues', 'Pull requests', 'Discussions']
const selectedVisibility = ref(visibilityOptions[0].label)
const selectedFilters = ref<string[]>(['Issues'])

function toggleFilter(value: string) {
  selectedFilters.value = selectedFilters.value.includes(value)
    ? selectedFilters.value.filter(item => item !== value)
    : [...selectedFilters.value, value]
}

const demo1Code = `<template>
  <ActionList>
    <ActionList.Item>
      <ActionList.LeadingVisual><FileIcon /></ActionList.LeadingVisual>
      新建文件
    </ActionList.Item>
    <ActionList.Item>
      <ActionList.LeadingVisual><RepoIcon /></ActionList.LeadingVisual>
      新建仓库
      <ActionList.TrailingVisual><ChevronRightIcon /></ActionList.TrailingVisual>
    </ActionList.Item>
    <ActionList.LinkItem href="https://github.com" new-tab>
      <ActionList.LeadingVisual><MarkGithubIcon /></ActionList.LeadingVisual>
      打开 GitHub
      <ActionList.TrailingVisual><LinkExternalIcon /></ActionList.TrailingVisual>
    </ActionList.LinkItem>
  </ActionList>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { ChevronRightIcon, FileIcon, LinkExternalIcon, MarkGithubIcon, RepoIcon } from '@/components/octicons-vue3'
<\/script>`

const demo2Code = `<template>
  <ActionList variant="inset" show-dividers>
    <ActionList.Item>Issues</ActionList.Item>
    <ActionList.Item>Pull requests</ActionList.Item>
    <ActionList.Item>Discussions</ActionList.Item>
  </ActionList>

  <ActionList variant="horizontal-inset" show-dividers>
    <ActionList.Item>个人资料</ActionList.Item>
    <ActionList.Item>设置</ActionList.Item>
    <ActionList.Item>通知</ActionList.Item>
  </ActionList>

  <ActionList variant="full" show-dividers>
    <ActionList.Item>README.md</ActionList.Item>
    <ActionList.Item>package.json</ActionList.Item>
    <ActionList.Item>vite.config.ts</ActionList.Item>
  </ActionList>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
<\/script>`

const demo3Code = `<template>
  <ActionList>
    <ActionList.Item>
      <ActionList.LeadingVisual><RepoIcon /></ActionList.LeadingVisual>
      onlikee
      <ActionList.Description variant="block">Vue 组件库中的操作列表菜单</ActionList.Description>
      <ActionList.TrailingVisual>12</ActionList.TrailingVisual>
    </ActionList.Item>
    <ActionList.Item>
      <ActionList.LeadingVisual><FileCodeIcon /></ActionList.LeadingVisual>
      ActionList.vue
      <ActionList.Description truncate>最近更新于 2 小时前，包含基础结构、键盘焦点和视觉样式</ActionList.Description>
      <ActionList.TrailingVisual><LinkExternalIcon /></ActionList.TrailingVisual>
    </ActionList.Item>
    <ActionList.Item size="large">
      <ActionList.LeadingVisual><ArchiveIcon /></ActionList.LeadingVisual>
      Large item
      <ActionList.Description variant="block">使用 size="large" 时，列表项垂直间距更大。</ActionList.Description>
    </ActionList.Item>
  </ActionList>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { ArchiveIcon, FileCodeIcon, LinkExternalIcon, RepoIcon } from '@/components/octicons-vue3'
<\/script>`

const demo4Code = `<template>
  <ActionList selection-variant="single">
    <ActionList.Item
      v-for="item in visibilityOptions"
      :key="item.label"
      :selected="selectedVisibility === item.label"
      @select="selectedVisibility = item.label"
    >
      <ActionList.LeadingVisual><component :is="item.icon" /></ActionList.LeadingVisual>
      {{ item.label }}
      <ActionList.Description variant="block">{{ item.description }}</ActionList.Description>
    </ActionList.Item>
  </ActionList>

  <ActionList selection-variant="multiple">
    <ActionList.Item
      v-for="item in filterOptions"
      :key="item"
      :selected="selectedFilters.includes(item)"
      @select="toggleFilter(item)"
    >
      {{ item }}
    </ActionList.Item>
  </ActionList>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ActionList } from '@/components/primer-vue/ActionList'
import { EyeClosedIcon, EyeIcon } from '@/components/octicons-vue3'

const visibilityOptions = [
  { label: '公开的', description: '所有人都能在应用广场看见它。', icon: EyeIcon },
  { label: '私有的', description: '仅自己可以在个人应用中管理。', icon: EyeClosedIcon }
]
const filterOptions = ['Issues', 'Pull requests', 'Discussions']
const selectedVisibility = ref(visibilityOptions[0].label)
const selectedFilters = ref<string[]>(['Issues'])

function toggleFilter(value: string) {
  selectedFilters.value = selectedFilters.value.includes(value)
    ? selectedFilters.value.filter(item => item !== value)
    : [...selectedFilters.value, value]
}
<\/script>`

const demo5Code = `<template>
  <ActionList selection-variant="single">
    <ActionList.Item selected active>
      <ActionList.LeadingVisual><ProjectIcon /></ActionList.LeadingVisual>
      当前项目
    </ActionList.Item>
    <ActionList.Item disabled>
      <ActionList.LeadingVisual><LockIcon /></ActionList.LeadingVisual>
      暂不可用
    </ActionList.Item>
    <ActionList.Item loading>正在同步</ActionList.Item>
    <ActionList.Divider />
    <ActionList.Item variant="danger">
      <ActionList.LeadingVisual><TrashIcon /></ActionList.LeadingVisual>
      删除项目
    </ActionList.Item>
  </ActionList>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { LockIcon, ProjectIcon, TrashIcon } from '@/components/octicons-vue3'
<\/script>`

const demo6Code = `<template>
  <ActionList>
    <ActionList.Group>
      <ActionList.GroupHeading>代码</ActionList.GroupHeading>
      <ActionList.Item>
        <ActionList.LeadingVisual><CodeIcon /></ActionList.LeadingVisual>
        打开 Codespace
      </ActionList.Item>
      <ActionList.Item>
        <ActionList.LeadingVisual><GitBranchIcon /></ActionList.LeadingVisual>
        切换分支
        <ActionList.TrailingVisual>main</ActionList.TrailingVisual>
      </ActionList.Item>
    </ActionList.Group>

    <ActionList.Group>
      <ActionList.GroupHeading variant="filled">
        访问范围
        <ActionList.GroupHeadingTrailingAction>管理</ActionList.GroupHeadingTrailingAction>
      </ActionList.GroupHeading>
      <ActionList.Item>
        <ActionList.LeadingVisual><PeopleIcon /></ActionList.LeadingVisual>
        团队成员
        <ActionList.Description variant="block">对组织中的成员开放</ActionList.Description>
      </ActionList.Item>
      <ActionList.Item>
        <ActionList.LeadingVisual><ShieldLockIcon /></ActionList.LeadingVisual>
        受保护
        <ActionList.Description variant="block">需要额外权限才能访问</ActionList.Description>
      </ActionList.Item>
    </ActionList.Group>

    <ActionList.Divider />
    <ActionList.Item variant="danger">
      <ActionList.LeadingVisual><SignOutIcon /></ActionList.LeadingVisual>
      退出组织
    </ActionList.Item>
  </ActionList>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { CodeIcon, GitBranchIcon, PeopleIcon, ShieldLockIcon, SignOutIcon } from '@/components/octicons-vue3'
<\/script>`

const demo7Code = `<template>
  <ActionList>
    <ActionList.LinkItem href="https://github.com/UnderHear" new-tab>
      <ActionList.LeadingVisual><MarkGithubIcon /></ActionList.LeadingVisual>
      UnderHear
      <ActionList.TrailingVisual><LinkExternalIcon /></ActionList.TrailingVisual>
    </ActionList.LinkItem>
    <ActionList.LinkItem href="https://vuejs.org" new-tab active>
      <ActionList.LeadingVisual><BookIcon /></ActionList.LeadingVisual>
      Vue 文档
    </ActionList.LinkItem>
    <ActionList.LinkItem href="https://vitejs.dev" disabled>
      <ActionList.LeadingVisual><ZapIcon /></ActionList.LeadingVisual>
      暂不可访问
    </ActionList.LinkItem>
  </ActionList>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { BookIcon, LinkExternalIcon, MarkGithubIcon, ZapIcon } from '@/components/octicons-vue3'
<\/script>`

const demo8Code = `<template>
  <Dropdown>
    <Dropdown.trigger>
      <Button>
        更多操作
        <Button.trailingVisual><TriangleDownIcon /></Button.trailingVisual>
      </Button>
    </Dropdown.trigger>
    <Dropdown.content>
      <ActionList>
        <ActionList.Item>
          <ActionList.LeadingVisual><PencilIcon /></ActionList.LeadingVisual>
          编辑
        </ActionList.Item>
        <ActionList.Item>
          <ActionList.LeadingVisual><CopyIcon /></ActionList.LeadingVisual>
          复制
        </ActionList.Item>
        <ActionList.Divider />
        <ActionList.Item variant="danger">
          <ActionList.LeadingVisual><TrashIcon /></ActionList.LeadingVisual>
          删除
        </ActionList.Item>
      </ActionList>
    </Dropdown.content>
  </Dropdown>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { Button } from '@/components/primer-vue/Button'
import { Dropdown } from '@/components/primer-vue/Dropdown'
import { CopyIcon, PencilIcon, TrashIcon, TriangleDownIcon } from '@/components/octicons-vue3'
<\/script>`

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '160px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '220px' },
  { key: 'description', label: '说明', minWidth: '260px', wrap: true }
]

const actionListPropsRows = [
  { name: 'variant', type: "'inset' | 'horizontal-inset' | 'full'", default: "'inset'", description: '控制列表与容器边缘的间距关系' },
  { name: 'selectionVariant', type: "'single' | 'multiple'", default: '—', description: '显示单选勾选或多选 checkbox 的选择列' },
  { name: 'showDividers', type: 'boolean', default: 'false', description: '在连续列表项之间显示细分隔线' }
]

const actionListItemPropsRows = [
  { name: 'selected', type: 'boolean', default: 'false', description: '是否处于选中状态，需要配合 selectionVariant 使用' },
  { name: 'active', type: 'boolean', default: 'false', description: '当前项状态，会显示选中背景和左侧强调线' },
  { name: 'variant', type: "'default' | 'danger'", default: "'default'", description: '默认或危险操作样式' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用操作项' },
  { name: 'loading', type: 'boolean', default: 'false', description: '显示加载状态并禁用操作' },
  { name: 'size', type: "'medium' | 'large'", default: "'medium'", description: '控制列表项垂直间距' },
  { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", description: '按钮列表项的原生 type' }
]

const actionListLinkItemPropsRows = [
  { name: 'href', type: 'string', default: '—', description: '链接地址' },
  { name: 'newTab', type: 'boolean', default: 'false', description: '是否在新标签页打开链接' },
  { name: 'target', type: 'string', default: '—', description: '链接 target，会覆盖 newTab 推导值' },
  { name: 'rel', type: 'string', default: '—', description: '链接 rel，会覆盖 newTab 推导值' },
  { name: '其他 Item Props', type: 'ActionList.Item props', default: '—', description: 'LinkItem 支持 Item 的视觉状态 props' }
]

const actionListDescriptionPropsRows = [
  { name: 'variant', type: "'inline' | 'block'", default: "'inline'", description: '说明文字显示在同一行或下一行' },
  { name: 'truncate', type: 'boolean', default: 'false', description: '单行截断说明文字' }
]

const actionListGroupPropsRows: never[] = []

const actionListGroupHeadingPropsRows = [
  { name: 'variant', type: "'subtle' | 'filled'", default: "'subtle'", description: '分组标题的视觉样式' }
]

const eventsTableColumns: TableColumn[] = [
  { key: 'name', label: '事件名', rowHeader: true, minWidth: '160px' },
  { key: 'component', label: '组件', minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true }
]

const eventsRows = [
  { name: 'select', component: 'ActionList.Item / LinkItem', description: '启用状态下点击列表项时触发，disabled 和 loading 状态不会触发' }
]

const slotsTableColumns: TableColumn[] = [
  { key: 'component', label: '组件', rowHeader: true, minWidth: '180px' },
  { key: 'name', label: '插槽名', minWidth: '160px' },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true }
]

const slotsRows = [
  { key: 'action-list-default', component: 'ActionList', name: 'default', description: '列表子项，通常为 Item、LinkItem、Group 或 Divider' },
  { key: 'item-default', component: 'ActionList.Item / LinkItem', name: 'default', description: '列表项主标签' },
  { key: 'leading-default', component: 'ActionList.LeadingVisual', name: 'default', description: '列表项左侧图标区域' },
  { key: 'description-default', component: 'ActionList.Description', name: 'default', description: '列表项说明文字' },
  { key: 'trailing-default', component: 'ActionList.TrailingVisual', name: 'default', description: '列表项右侧图标或辅助信息区域' },
  { key: 'group-default', component: 'ActionList.Group', name: 'default', description: '分组内的列表项及 GroupHeading 子组件' },
  { key: 'heading-default', component: 'ActionList.GroupHeading', name: 'default', description: '分组标题内容及 GroupHeadingTrailingAction 子组件' },
  { key: 'heading-trailing-default', component: 'ActionList.GroupHeadingTrailingAction', name: 'default', description: '分组标题右侧辅助操作区域' }
]
</script>

<style scoped>
h4 {
  margin: 24px 0 12px;
  color: var(--fgColor-default);
  font-size: 14px;
  font-weight: 600;
}

h4:first-child {
  margin-top: 0;
}

.demo-list {
  width: 280px;
}

.demo-list-wide {
  width: min(100%, 420px);
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 24px;
  width: min(100%, 680px);
}

.demo-grid-3 {
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  width: min(100%, 820px);
}

.demo-surface {
  overflow: hidden;
  background: var(--bgColor-default);
  border: 1px solid var(--borderColor-default);
  border-radius: var(--borderRadius-medium, 6px);
}

.demo-caption {
  padding: 8px 12px;
  color: var(--fgColor-muted);
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  background: var(--bgColor-muted);
  border-bottom: 1px solid var(--borderColor-muted);
}

.demo-counter {
  min-width: 20px;
  color: var(--fgColor-muted);
  font-size: 12px;
  text-align: right;
}

.demo-heading-action {
  color: var(--fgColor-accent);
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 900px) {
  .demo-grid,
  .demo-grid-3 {
    grid-template-columns: 1fr;
    width: min(100%, 420px);
  }
}
</style>
