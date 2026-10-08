<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  ActionBar,
  type ActionBarMenuItemProps,
  type ActionBarSize,
  type ActionBarGap,
} from '@/components/primer-vue/ActionBar'
import {
  BoldIcon,
  ItalicIcon,
  CodeIcon,
  LinkIcon,
  FileAddedIcon,
  SearchIcon,
  QuoteIcon,
  ListUnorderedIcon,
  ListOrderedIcon,
  TasklistIcon,
  KebabHorizontalIcon,
} from '@/components/octicons-vue3'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const width = shallowRef(360)
const size = shallowRef<ActionBarSize>('medium')
const gap = shallowRef<ActionBarGap>('condensed')
const flush = shallowRef(false)
const selected = shallowRef('尚未选择操作')
const editor = shallowRef<HTMLInputElement | null>(null)
const actions = [
  { label: 'Bold', icon: BoldIcon },
  { label: 'Italic', icon: ItalicIcon },
  { label: 'Code', icon: CodeIcon },
  { label: 'Link', icon: LinkIcon },
  { label: 'File Added', icon: FileAddedIcon },
  { label: 'Search', icon: SearchIcon },
  { label: 'Insert Quote', icon: QuoteIcon },
  { label: 'Unordered List', icon: ListUnorderedIcon },
  { label: 'Ordered List', icon: ListOrderedIcon },
  { label: 'Task List', icon: TasklistIcon },
]
const menuItems: ActionBarMenuItemProps[] = [
  {
    label: '复制',
    onClick: () => {
      selected.value = '复制'
    },
  },
  {
    label: '导出',
    leadingVisual: FileAddedIcon,
    items: [
      {
        label: 'Markdown',
        trailingVisual: '.md',
        onClick: () => {
          selected.value = '导出 Markdown'
        },
      },
      {
        label: 'HTML',
        onClick: () => {
          selected.value = '导出 HTML'
        },
      },
    ],
  },
  { type: 'divider' },
  { label: '只读操作', disabled: true },
  {
    label: '删除',
    variant: 'danger',
    onClick: () => {
      selected.value = '删除'
    },
  },
]
const imports = (icons: string) =>
  [
    '<script setup lang="ts">',
    "import { ActionBar } from '@/components/primer-vue/ActionBar'",
    'import { ' + icons + " } from '@/components/octicons-vue3'",
    '<\/script>',
    '',
  ].join('\n')
const basicCode =
  imports('BoldIcon, ItalicIcon, CodeIcon') +
  [
    '<template>',
    '  <ActionBar aria-label="编辑工具栏">',
    '    <ActionBar.IconButton :icon="BoldIcon" aria-label="Bold" />',
    '    <ActionBar.IconButton :icon="ItalicIcon" aria-label="Italic" />',
    '    <ActionBar.Divider />',
    '    <ActionBar.Button :leading-visual="CodeIcon">Code</ActionBar.Button>',
    '  </ActionBar>',
    '</template>',
  ].join('\n')
const overflowCode =
  imports('BoldIcon, ItalicIcon, CodeIcon, LinkIcon') +
  [
    '<template>',
    '  <div style="width: 120px; max-width: 100%">',
    '    <ActionBar aria-label="格式操作" size="medium" gap="condensed" flush>',
    '      <ActionBar.IconButton :icon="BoldIcon" aria-label="Bold" />',
    '      <ActionBar.IconButton :icon="ItalicIcon" aria-label="Italic" />',
    '      <ActionBar.IconButton :icon="CodeIcon" aria-label="Code" />',
    '      <ActionBar.IconButton :icon="LinkIcon" aria-label="Link" />',
    '    </ActionBar>',
    '  </div>',
    '</template>',
  ].join('\n')
const groupCode =
  imports('BoldIcon, ItalicIcon, LinkIcon') +
  [
    '<template>',
    '  <div style="width: 180px; max-width: 100%">',
    '    <ActionBar aria-label="分组操作" flush>',
    '      <ActionBar.Group>',
    '        <ActionBar.IconButton :icon="BoldIcon" aria-label="Bold" />',
    '        <ActionBar.IconButton :icon="ItalicIcon" aria-label="Italic" disabled />',
    '      </ActionBar.Group>',
    '      <ActionBar.Divider />',
    '      <ActionBar.Button :leading-visual="LinkIcon">Insert link</ActionBar.Button>',
    '    </ActionBar>',
    '  </div>',
    '</template>',
  ].join('\n')
const menuCode = [
  '<script setup lang="ts">',
  "import { shallowRef } from 'vue'",
  "import { ActionBar, type ActionBarMenuItemProps } from '@/components/primer-vue/ActionBar'",
  "import { KebabHorizontalIcon } from '@/components/octicons-vue3'",
  '',
  'const editor = shallowRef<HTMLInputElement | null>(null)',
  "const selected = shallowRef('')",
  'const items: ActionBarMenuItemProps[] = [',
  "  { label: '复制', onClick: () => { selected.value = '复制' } },",
  "  { label: '导出', items: [",
  "    { label: 'Markdown', onClick: () => { selected.value = 'Markdown' } },",
  "    { label: 'HTML', onClick: () => { selected.value = 'HTML' } }",
  '  ] },',
  "  { type: 'divider' },",
  "  { label: '只读操作', disabled: true },",
  "  { label: '删除', variant: 'danger', onClick: () => { selected.value = '删除' } }",
  ']',
  '<\/script>',
  '',
  '<template>',
  '  <input ref="editor" aria-label="编辑内容" />',
  '  <ActionBar aria-label="文档操作" flush>',
  '    <ActionBar.Menu',
  '      :icon="KebabHorizontalIcon"',
  '      aria-label="文档菜单"',
  '      :items="items"',
  '      overflow-icon="none"',
  '      :return-focus-ref="editor"',
  '    />',
  '  </ActionBar>',
  '  <p>{{ selected }}</p>',
  '</template>',
].join('\n')
const columns: TableColumn[] = [
  { key: 'name', label: '属性', rowHeader: true },
  { key: 'type', label: '类型', wrap: true },
  { key: 'default', label: '默认值' },
  { key: 'description', label: '说明', wrap: true },
]
const barRows = [
  {
    name: 'aria-label / aria-labelledby',
    type: 'string',
    default: '—',
    description: '必须提供其中一个，为 toolbar 命名；其他原生属性和 class 透传到外层容器。',
  },
  {
    name: 'size',
    type: 'small | medium | large',
    default: 'medium',
    description: '28 / 32 / 40px，传给按钮和溢出按钮。',
  },
  {
    name: 'gap',
    type: 'none | condensed',
    default: 'condensed',
    description: '0 / 8px；none 时分隔线自身保留左右 8px 留白。',
  },
  { name: 'flush', type: 'boolean', default: 'false', description: '去除默认左右 16px 留白。' },
  { name: 'className', type: 'string', default: '—', description: '也可使用 Vue 原生 class。' },
]
const buttonRows = [
  {
    name: 'icon / aria-label',
    type: 'Component / string',
    default: '—',
    description: 'IconButton 必填，图标组件和无障碍标签；自带 Tooltip。',
  },
  {
    name: '默认插槽 / leadingVisual',
    type: 'VNode / Component',
    default: '—',
    description: 'Button 的文字内容和前导图标，在溢出菜单中保留。',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description:
      'Button / IconButton 仍可聚焦，设置 aria-disabled 并阻止激活。Menu 使用原生 disabled。',
  },
  {
    name: '@click',
    type: '(MouseEvent | KeyboardEvent) => void',
    default: '—',
    description: '工具栏点击和溢出菜单选择共享同一事件；preventDefault 可阻止菜单关闭。',
  },
  {
    name: '按钮属性',
    type: 'size, loading, type, leadingVisual, trailingVisual, trailingAction, count…',
    default: '—',
    description: '复用现有按钮实现；variant 固定为 invisible。',
  },
  {
    name: 'Tooltip 属性',
    type: 'description, tooltipDirection, keyshortcuts, keybindingHint, unsafeDisableTooltip',
    default: '—',
    description: '图标按钮支持提示方向、描述及一个或多个快捷键提示。',
  },
]
const menuRows = [
  {
    name: 'icon / aria-label / items',
    type: 'Component / string / ActionBarMenuItemProps[]',
    default: '—',
    description: '菜单按钮图标、标签和菜单项，均为必填。',
  },
  {
    name: 'overflowIcon',
    type: "Component | 'none'",
    default: 'icon',
    description: '进入溢出菜单时的图标；none 隐藏图标。',
  },
  {
    name: 'returnFocusRef',
    type: 'HTMLElement | Ref<HTMLElement | null>',
    default: '菜单按钮',
    description: '关闭或选择后恢复焦点的目标。',
  },
  {
    name: '菜单项',
    type: 'label, disabled, leadingVisual, trailingVisual, variant, onClick, items',
    default: "type: 'action'",
    description:
      'trailingVisual 支持字符串或图标；variant 为 default / danger；items 创建嵌套菜单。',
  },
  {
    name: '分隔线项',
    type: "{ type: 'divider' }",
    default: '—',
    description: '在菜单中插入水平分隔线。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ActionBar 操作栏"
      description="按容器宽度收纳操作，支持分组、文字按钮和嵌套菜单。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description>
        操作默认靠右排列。IconButton 自带提示，Button 用默认插槽提供文字。
      </template>
      <ComponentDocsDemoBlock :code="basicCode">
        <ActionBar aria-label="编辑工具栏">
          <ActionBar.IconButton :icon="BoldIcon" aria-label="Bold" @click="selected = 'Bold'" />
          <ActionBar.IconButton
            :icon="ItalicIcon"
            aria-label="Italic"
            @click="selected = 'Italic'"
          />
          <ActionBar.Divider />
          <ActionBar.Button :leading-visual="CodeIcon" @click="selected = 'Code'">
            Code
          </ActionBar.Button>
        </ActionBar>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="响应式溢出、尺寸与间距">
      <template #description>
        缩小容器会将放不下的操作按原顺序移入 More items 菜单，恢复宽度后自动移回。
      </template>
      <ComponentDocsDemoBlock :code="overflowCode">
        <div class="action-bar-demo-stack">
          <div class="action-bar-controls">
            <label
              >容器宽度 {{ width }}px
              <input v-model.number="width" type="range" min="80" max="700" aria-label="容器宽度"
            /></label>
            <label
              >尺寸
              <select v-model="size">
                <option>small</option>
                <option>medium</option>
                <option>large</option>
              </select></label
            >
            <label
              >间距
              <select v-model="gap">
                <option>none</option>
                <option>condensed</option>
              </select></label
            >
            <label><input v-model="flush" type="checkbox" /> flush</label>
          </div>
          <div class="action-bar-demo-container" :style="{ width: width + 'px' }">
            <ActionBar aria-label="格式操作" :size="size" :gap="gap" :flush="flush">
              <ActionBar.IconButton
                v-for="action in actions"
                :key="action.label"
                :icon="action.icon"
                :aria-label="action.label"
                @click="selected = action.label"
              />
            </ActionBar>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="整体分组与禁用状态">
      <template #description>
        Group 内的项目同时显示或溢出；禁用按钮保持可聚焦，并在工具栏和菜单中阻止选择。
      </template>
      <ComponentDocsDemoBlock :code="groupCode">
        <div class="action-bar-demo-container" style="width: 180px">
          <ActionBar aria-label="分组操作" flush>
            <ActionBar.Group>
              <ActionBar.IconButton
                :icon="BoldIcon"
                aria-label="Bold"
                @click="selected = '分组 Bold'"
              />
              <ActionBar.IconButton
                :icon="ItalicIcon"
                aria-label="Italic"
                disabled
                @click="selected = '禁用操作'"
              />
            </ActionBar.Group>
            <ActionBar.Divider />
            <ActionBar.Button :leading-visual="LinkIcon" @click="selected = 'Insert link'">
              Insert link
            </ActionBar.Button>
          </ActionBar>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="菜单与焦点恢复">
      <template #description>
        支持嵌套菜单、危险操作和分隔线。这里关闭菜单后，焦点会回到输入框；按钮溢出时菜单变为子菜单。
      </template>
      <ComponentDocsDemoBlock :code="menuCode">
        <div class="action-bar-demo-stack">
          <input
            ref="editor"
            class="action-bar-editor"
            aria-label="编辑内容"
            placeholder="菜单关闭后焦点回到这里"
          />
          <ActionBar aria-label="文档操作" flush>
            <ActionBar.Menu
              :icon="KebabHorizontalIcon"
              aria-label="文档菜单"
              :items="menuItems"
              overflow-icon="none"
              :return-focus-ref="editor"
            />
          </ActionBar>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <p role="status">最近操作：{{ selected }}</p>
    <ComponentDocsSection title="键盘操作">
      <p>
        Tab 进入工具栏；← / → 循环移动焦点，Home / End 移至首项或末项。菜单按钮支持 ↑ / ↓
        打开并定位末项或首项。
      </p>
      <p>
        菜单内 ↑ / ↓、Home / End 移动焦点，输入文字查找操作；→ 打开子菜单，← 返回父菜单。Escape
        关闭当前菜单并恢复焦点，Tab 关闭菜单链。
      </p>
    </ComponentDocsSection>
    <ComponentDocsSection title="ActionBar API">
      <Table :columns="columns" :data="barRows" />
    </ComponentDocsSection>
    <ComponentDocsSection title="Button / IconButton API">
      <Table :columns="columns" :data="buttonRows" />
    </ComponentDocsSection>
    <ComponentDocsSection title="Menu API">
      <Table :columns="columns" :data="menuRows" />
    </ComponentDocsSection>
    <ComponentDocsSection title="Group / Divider 与导出">
      <p>Group 通过默认插槽组合操作，整体溢出；Divider 渲染装饰性竖线，溢出时转为菜单分隔线。</p>
      <p>
        支持 ActionBar.Button / IconButton / Group / Divider / Menu，也可单独导入
        ActionBarButton、ActionBarIconButton、ActionBarGroup、ActionBarDivider、ActionBarMenu。
      </p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.action-bar-demo-stack {
  width: 100%;
  min-width: 0;
}
.action-bar-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.action-bar-controls label {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.action-bar-controls input[type='range'] {
  max-width: 100%;
}
.action-bar-demo-container {
  max-width: 100%;
  border: 1px solid var(--borderColor-default, #d1d9e0);
  border-radius: 6px;
  padding-block: 8px;
}
.action-bar-editor {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid var(--borderColor-default, #d1d9e0);
  border-radius: 6px;
  color: var(--fgColor-default);
  background: var(--bgColor-default);
}
</style>
