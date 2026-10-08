<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ActionList 操作列表"
      description="用于下拉菜单、选择列表、分组菜单和链接操作的列表组件。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        <code>ActionList</code> 提供列表容器，<code>ActionList.Item</code> 和
        <code>ActionList.LinkItem</code> 提供按钮与链接两类操作项。
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
          <ActionList.LinkItem href="https://github.com" target="_blank" rel="noopener noreferrer">
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
        通过 <code>variant</code> 控制列表与容器边缘的关系，通过
        <code>showDividers</code> 显示连续项之间的细分隔线。
      </template>

      <ComponentDocsDemoBlock :code="demo2Code">
        <div class="demo-grid demo-grid-3">
          <div class="demo-surface">
            <div class="demo-caption">inset</div>
            <ActionList variant="inset" show-dividers>
              <ActionList.Item> Issues </ActionList.Item>
              <ActionList.Item> Pull requests </ActionList.Item>
              <ActionList.Item> Discussions </ActionList.Item>
            </ActionList>
          </div>

          <div class="demo-surface">
            <div class="demo-caption">horizontal-inset</div>
            <ActionList variant="horizontal-inset" show-dividers>
              <ActionList.Item> 个人资料 </ActionList.Item>
              <ActionList.Item> 设置 </ActionList.Item>
              <ActionList.Item> 通知 </ActionList.Item>
            </ActionList>
          </div>

          <div class="demo-surface">
            <div class="demo-caption">full</div>
            <ActionList variant="full" show-dividers>
              <ActionList.Item> README.md </ActionList.Item>
              <ActionList.Item> package.json </ActionList.Item>
              <ActionList.Item> vite.config.ts </ActionList.Item>
            </ActionList>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="视觉区域和说明">
      <template #description>
        leading、description 和 trailing 区域遵循 Primer ActionList 的排列方式；说明文字支持
        inline、block 和截断。
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
          <ActionList.Item size="large">
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
        在列表上设置 <code>selectionVariant</code>，再由每个列表项的
        <code>selected</code> 控制单选或多选状态。
      </template>

      <ComponentDocsDemoBlock :code="demo4Code">
        <div class="demo-grid">
          <ActionList
            role="listbox"
            aria-label="选择选项"
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
            role="listbox"
            aria-label="选择选项"
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
          role="listbox"
          aria-label="选择选项"
          selection-variant="single"
        >
          <ActionList.Item selected active>
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
          <ActionList.Item loading> 正在同步 </ActionList.Item>
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
        使用 <code>ActionList.Group</code>、<code>ActionList.GroupHeading</code> 与
        <code>ActionList.Divider</code> 组织更复杂的菜单结构。
      </template>

      <ComponentDocsDemoBlock :code="demo6Code">
        <FeatureFlags :flags="{ primer_react_action_list_group_heading_trailing_action: true }">
          <ActionList class="demo-list-wide">
            <ActionList.Group>
              <ActionList.GroupHeading as="h3"> 代码 </ActionList.GroupHeading>
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
                <ActionList.TrailingVisual> main </ActionList.TrailingVisual>
              </ActionList.Item>
            </ActionList.Group>

            <ActionList.Group>
              <ActionList.GroupHeading as="h3" variant="filled">
                访问范围
                <ActionList.GroupHeading.TrailingAction :icon="PencilIcon" label="管理" />
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
        </FeatureFlags>
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
            target="_blank"
            rel="noopener noreferrer"
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
            target="_blank"
            rel="noopener noreferrer"
            active
          >
            <ActionList.LeadingVisual>
              <BookIcon />
            </ActionList.LeadingVisual>
            Vue 文档
          </ActionList.LinkItem>
          <ActionList.LinkItem href="https://vitejs.dev" inactive-text="暂不可访问">
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
            <Button :trailing-visual="TriangleDownIcon"> 更多操作 </Button>
          </Dropdown.trigger>
          <Dropdown.content>
            <ActionList role="menu" aria-label="更多操作">
              <ActionList.Item role="menuitem">
                <ActionList.LeadingVisual>
                  <PencilIcon />
                </ActionList.LeadingVisual>
                编辑
              </ActionList.Item>
              <ActionList.Item role="menuitem">
                <ActionList.LeadingVisual>
                  <CopyIcon />
                </ActionList.LeadingVisual>
                复制
              </ActionList.Item>
              <ActionList.Divider />
              <ActionList.Item role="menuitem" variant="danger">
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

    <ComponentDocsSection title="列表标题与尾部操作">
      <template #description>
        Heading 放在列表前并自动关联 aria-labelledby；TrailingAction 是独立按钮或链接。
        默认列表保留原生 Tab 顺序。menu、menubar、listbox 默认启用焦点区；disableFocusZone
        可关闭它。
      </template>
      <ComponentDocsDemoBlock :code="advancedCode">
        <div class="demo-list-wide">
          <ActionList>
            <ActionList.Heading as="h3" size="small"> 仓库 </ActionList.Heading>
            <ActionList.Item>
              onlikee
              <ActionList.Description truncate> 最近更新的公开仓库 </ActionList.Description>
              <ActionList.TrailingAction :icon="PencilIcon" label="编辑仓库" />
            </ActionList.Item>
            <ActionList.Item inactive-text="需要管理员权限"> 归档仓库 </ActionList.Item>
            <ActionList.Item>
              文档
              <ActionList.TrailingAction as="a" href="https://vuejs.org" label="查看" />
            </ActionList.Item>
          </ActionList>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
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

      <h4>ActionList.Heading Props</h4>
      <Table
        :columns="apiTableColumns"
        :data="headingPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h4>ActionList.TrailingAction / GroupHeading.TrailingAction Props</h4>
      <Table
        :columns="apiTableColumns"
        :data="trailingActionPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h4>上下文与元素引用</h4>
      <p>
        ActionList.ContainerContext 与 ActionList.GroupContext 是 Vue injection key，可通过 provide
        注入 reactive 对象。容器字段包括
        container、listRole、selectionVariant、selectionAttribute、listLabelledBy、afterSelect、enableFocusZone、defaultTrailingVisual；分组字段为
        selectionVariant 与 groupHeadingId。
      </p>
      <p>
        Item 的 select 事件调用 preventDefault() 可阻止容器
        afterSelect。根列表、Item、LinkItem、Heading 和两个 TrailingAction 通过模板 ref 暴露
        element、focus()、blur()。Item 的 element 根据语义指向 button 或 li，LinkItem 的 element
        始终指向链接元素，inactive 时为 null。
      </p>
      <p>
        分组标题尾部操作由 primer_react_action_list_group_heading_trailing_action
        控制；上方示例显式启用了该标志。primer_react_action_list_item_gap 仅在 NavList 容器且未设置
        disableItemGap 时生效。
      </p>
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
import { FeatureFlags } from '@/components/primer-vue/FeatureFlags'
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
  ZapIcon,
} from '@/components/octicons-vue3'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const visibilityOptions = [
  {
    label: '公开的',
    description: '所有人都能在应用广场看见它。',
    icon: EyeIcon,
  },
  {
    label: '私有的',
    description: '仅自己可以在个人应用中管理。',
    icon: EyeClosedIcon,
  },
]
const filterOptions = ['Issues', 'Pull requests', 'Discussions']
const selectedVisibility = ref(visibilityOptions[0].label)
const selectedFilters = ref<string[]>(['Issues'])

function toggleFilter(value: string) {
  selectedFilters.value = selectedFilters.value.includes(value)
    ? selectedFilters.value.filter((item) => item !== value)
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
    <ActionList.LinkItem href="https://github.com" target="_blank" rel="noopener noreferrer">
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
  <ActionList role="listbox" aria-label="选择选项" selection-variant="single">
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

  <ActionList role="listbox" aria-label="选择选项" selection-variant="multiple">
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
  <ActionList role="listbox" aria-label="选择选项" selection-variant="single">
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
  <FeatureFlags :flags="{ primer_react_action_list_group_heading_trailing_action: true }">
  <ActionList>
    <ActionList.Group>
      <ActionList.GroupHeading as="h3">代码</ActionList.GroupHeading>
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
      <ActionList.GroupHeading as="h3" variant="filled">
        访问范围
        <ActionList.GroupHeading.TrailingAction :icon="PencilIcon" label="管理" />
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
  </FeatureFlags>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { FeatureFlags } from '@/components/primer-vue/FeatureFlags'
import { CodeIcon, GitBranchIcon, PencilIcon, PeopleIcon, ShieldLockIcon, SignOutIcon } from '@/components/octicons-vue3'
<\/script>`

const demo7Code = `<template>
  <ActionList>
    <ActionList.LinkItem href="https://github.com/UnderHear" target="_blank" rel="noopener noreferrer">
      <ActionList.LeadingVisual><MarkGithubIcon /></ActionList.LeadingVisual>
      UnderHear
      <ActionList.TrailingVisual><LinkExternalIcon /></ActionList.TrailingVisual>
    </ActionList.LinkItem>
    <ActionList.LinkItem href="https://vuejs.org" target="_blank" rel="noopener noreferrer" active>
      <ActionList.LeadingVisual><BookIcon /></ActionList.LeadingVisual>
      Vue 文档
    </ActionList.LinkItem>
    <ActionList.LinkItem href="https://vitejs.dev" inactive-text="暂不可访问">
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
      <Button :trailing-visual="TriangleDownIcon">
        更多操作
      </Button>
    </Dropdown.trigger>
    <Dropdown.content>
      <ActionList role="menu" aria-label="更多操作">
        <ActionList.Item role="menuitem">
          <ActionList.LeadingVisual><PencilIcon /></ActionList.LeadingVisual>
          编辑
        </ActionList.Item>
        <ActionList.Item role="menuitem">
          <ActionList.LeadingVisual><CopyIcon /></ActionList.LeadingVisual>
          复制
        </ActionList.Item>
        <ActionList.Divider />
        <ActionList.Item role="menuitem" variant="danger">
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
  { key: 'description', label: '说明', minWidth: '260px', wrap: true },
]

const actionListPropsRows = [
  { name: 'as', type: 'string | Component', default: "'ul'", description: '根列表元素或组件' },
  {
    name: 'variant',
    type: "'inset' | 'horizontal-inset' | 'full'",
    default: "'inset'",
    description: '列表边缘间距',
  },
  {
    name: 'selectionVariant',
    type: "'single' | 'radio' | 'multiple'",
    default: 'undefined',
    description: '选择标记；角色与选择状态仍需正确设置',
  },
  {
    name: 'role',
    type: '原生 ARIA role',
    default: '容器 listRole',
    description:
      'listbox 推导 option，tablist 推导 tab；menu 的条目需显式角色或 ActionMenu 容器上下文',
  },
  {
    name: 'showDividers',
    type: 'boolean',
    default: 'false',
    description: '连续列表项之间显示分隔线',
  },
  {
    name: 'disableFocusZone',
    type: 'boolean',
    default: 'false',
    description: '关闭 menu、menubar、listbox 的焦点管理；容器 enableFocusZone 优先',
  },
  {
    name: 'disableItemGap',
    type: 'boolean',
    default: 'false',
    description: '关闭 NavList 容器的 FeatureFlag 项间距',
  },
  {
    name: 'className / 原生属性',
    type: 'HTMLAttributes',
    default: '—',
    description: '同时支持 Vue class、style、ARIA 和 DOM 事件',
  },
]
const actionListItemPropsRows = [
  {
    name: 'selected',
    type: 'boolean',
    default: 'undefined',
    description:
      '选择状态；option 对应 aria-selected，menuitemradio/menuitemcheckbox 对应 aria-checked',
  },
  { name: 'active', type: 'boolean', default: 'false', description: '显示当前项背景与左侧强调线' },
  {
    name: 'variant',
    type: "'default' | 'danger'",
    default: "'default'",
    description: '默认或危险操作样式',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: '设置 aria-disabled 并阻止 select；仍可在焦点区中聚焦',
  },
  {
    name: 'inactiveText',
    type: 'string',
    default: 'undefined',
    description: '非活动原因，阻止操作；普通列表显示提示图标，menu/listbox 显示警告文本',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'undefined',
    description: '显示 Spinner 与 Loading 公告，阻止 select 并隐藏尾部操作',
  },
  { name: 'size', type: "'medium' | 'large'", default: "'medium'", description: '条目高度' },
  {
    name: 'id / role / 原生属性',
    type: 'HTMLAttributes',
    default: '—',
    description: '属性按语义落到 button 或 li；class 落在外层 li',
  },
  {
    name: 'as',
    type: 'string | Component',
    default: 'undefined',
    description: '已弃用，对 Item 不生效；使用 LinkItem 的 as 实现自定义链接',
  },
  {
    name: 'privateItemWrapper / privateTooltipText',
    type: '函数 / string',
    default: 'undefined',
    description: '对应源 _PrivateItemWrapper / _PrivateTooltipText 的内部适配接口',
  },
  {
    name: 'groupId / renderItem / handleAddItem',
    type: 'string / 函数',
    default: 'undefined',
    description: '保留源兼容接口，不传到 DOM',
  },
]
const actionListLinkItemPropsRows = [
  { name: 'as', type: 'string | Component', default: "'a'", description: '原生链接或路由链接组件' },
  {
    name: 'href / target / rel',
    type: '原生链接属性',
    default: 'undefined',
    description: '直接传递到链接，使用 target="_blank" 指定新标签页',
  },
  {
    name: 'active / variant / size',
    type: '与 Item 对应属性相同',
    default: 'false / default / medium',
    description: '条目视觉状态',
  },
  {
    name: 'inactiveText',
    type: 'string',
    default: 'undefined',
    description: '非活动链接渲染 span 并移除链接交互',
  },
  { name: 'privateTooltipText', type: 'string', default: 'undefined', description: '链接提示内容' },
  {
    name: 'className / 原生属性',
    type: 'HTMLAttributes',
    default: '—',
    description: 'class 落到 li；其余原生链接属性和 click 事件落到链接',
  },
]
const actionListDescriptionPropsRows = [
  {
    name: 'variant',
    type: "'inline' | 'block'",
    default: "'inline'",
    description: '说明显示在同一行或下一行',
  },
  {
    name: 'truncate',
    type: 'boolean',
    default: 'undefined',
    description: '仅 inline 截断；按钮条目自动显示全文 Tooltip，其他语义使用 title',
  },
  {
    name: 'className / style',
    type: 'string / CSSProperties',
    default: '—',
    description: '支持 Vue class 与 style，其余属性不透传',
  },
]
const actionListGroupPropsRows = [
  {
    name: 'selectionVariant',
    type: "'single' | 'radio' | 'multiple' | false",
    default: 'undefined',
    description: '覆盖选择标记；false 隐藏组内选择标记',
  },
  {
    name: 'role / aria-label',
    type: 'string',
    default: '由列表推导',
    description:
      '角色列表内的 ul 为 group，通过 aria-label 标记；复杂标题应显式设置 aria-label，普通列表使用标题 ID',
  },
  {
    name: 'title / variant / auxiliaryText',
    type: 'string / subtle或filled / string',
    default: 'undefined / subtle / undefined',
    description: '旧标题接口，推荐使用 GroupHeading；同时提供 title 和 GroupHeading 时不渲染标题',
  },
  {
    name: 'className / 原生属性',
    type: 'HTMLAttributes',
    default: '—',
    description: '其余原生属性落在外层 li',
  },
]
const actionListGroupHeadingPropsRows = [
  {
    name: 'as',
    type: "'h1' 至 'h6'",
    default: 'undefined',
    description: '普通列表必须设置标题级别；menu/listbox 等角色列表禁止设置 as',
  },
  {
    name: 'variant',
    type: "'subtle' | 'filled'",
    default: "'subtle'",
    description: '标题视觉样式',
  },
  { name: 'auxiliaryText', type: 'string', default: 'undefined', description: '标题辅助文字' },
  {
    name: 'headingWrapElement',
    type: "'div' | 'li'",
    default: "'div'",
    description: '标题包装元素',
  },
  {
    name: 'id / className / 原生属性',
    type: 'HTMLAttributes',
    default: '生成 id',
    description: '普通列表属性落在标题，角色列表落在 presentation 包装元素',
  },
]
const headingPropsRows = [
  {
    name: 'as',
    type: "'h1' 至 'h6'",
    default: '必填',
    description: '列表标题级别；禁止在 ActionMenu 容器使用',
  },
  {
    name: 'size',
    type: "'large' | 'medium' | 'small'",
    default: 'undefined',
    description: '标题字号',
  },
  {
    name: 'visuallyHidden',
    type: 'boolean',
    default: 'false',
    description: '保留标题语义并在视觉上隐藏',
  },
  {
    name: 'id / className / 原生属性',
    type: 'HTMLAttributes',
    default: '生成 id',
    description: '标题和列表 aria-labelledby 自动关联',
  },
]
const trailingActionPropsRows = [
  {
    name: 'label',
    type: 'string',
    default: '必填',
    description: '文本按钮内容或图标按钮的可访问名称',
  },
  {
    name: 'icon',
    type: 'Component',
    default: 'undefined',
    description: '使用 IconButton；GroupHeading.TrailingAction 必填',
  },
  {
    name: 'as / href',
    type: "'button' | 'a' / string",
    default: "'button' / undefined",
    description: 'as=a 必须提供 href',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'undefined',
    description: '仅 button 支持；加载时关闭点击并公告状态',
  },
  {
    name: 'tooltipDirection',
    type: 'TooltipDirection',
    default: "'w'",
    description: '图标提示方向',
  },
  {
    name: 'className / style / 原生属性',
    type: 'HTMLAttributes',
    default: '—',
    description: 'Item 尾部操作 class/style 落在包装 span；分组尾部操作落在按钮',
  },
]
const advancedCode = `<template>
  <ActionList>
    <ActionList.Heading as="h3" size="small">仓库</ActionList.Heading>
    <ActionList.Item>
      onlikee
      <ActionList.Description truncate>最近更新的公开仓库</ActionList.Description>
      <ActionList.TrailingAction :icon="PencilIcon" label="编辑仓库" />
    </ActionList.Item>
    <ActionList.Item inactive-text="需要管理员权限">归档仓库</ActionList.Item>
    <ActionList.Item>
      文档
      <ActionList.TrailingAction as="a" href="https://vuejs.org" label="查看" />
    </ActionList.Item>
  </ActionList>
</template>

<script setup lang="ts">
import { ActionList } from '@/components/primer-vue/ActionList'
import { PencilIcon } from '@/components/octicons-vue3'
<\/script>`

const eventsTableColumns: TableColumn[] = [
  { key: 'name', label: '事件名', rowHeader: true, minWidth: '160px' },
  { key: 'component', label: '组件', minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true },
]

const eventsRows = [
  {
    name: 'click',
    component: 'ActionList.LinkItem / TrailingAction',
    description: '原生链接或尾部按钮的点击事件',
  },
  {
    name: 'select',
    component: 'ActionList.Item',
    description:
      '点击或非按钮语义条目 Enter/Space 激活时触发；disabled、inactive、loading 阻止触发',
  },
]

const slotsTableColumns: TableColumn[] = [
  { key: 'component', label: '组件', rowHeader: true, minWidth: '180px' },
  { key: 'name', label: '插槽名', minWidth: '160px' },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true },
]

const slotsRows = [
  {
    key: 'action-list-default',
    component: 'ActionList',
    name: 'default',
    description: '列表子项，通常为 Item、LinkItem、Group 或 Divider',
  },
  {
    key: 'item-default',
    component: 'ActionList.Item / LinkItem',
    name: 'default',
    description: '列表项主标签',
  },
  {
    key: 'leading-default',
    component: 'ActionList.LeadingVisual',
    name: 'default',
    description: '列表项左侧图标区域',
  },
  {
    key: 'description-default',
    component: 'ActionList.Description',
    name: 'default',
    description: '列表项说明文字',
  },
  {
    key: 'trailing-default',
    component: 'ActionList.TrailingVisual',
    name: 'default',
    description: '列表项右侧图标或辅助信息区域',
  },
  {
    key: 'group-default',
    component: 'ActionList.Group',
    name: 'default',
    description: '分组内的列表项及 GroupHeading 子组件',
  },
  {
    key: 'heading-default',
    component: 'ActionList.GroupHeading',
    name: 'default',
    description: '分组标题内容及 GroupHeading.TrailingAction 子组件',
  },
  {
    key: 'list-heading',
    component: 'ActionList.Heading',
    name: 'default',
    description: '列表标题',
  },
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

@media (max-width: 900px) {
  .demo-grid,
  .demo-grid-3 {
    grid-template-columns: 1fr;
    width: min(100%, 420px);
  }
}
</style>
