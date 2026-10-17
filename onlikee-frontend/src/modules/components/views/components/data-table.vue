<script setup lang="ts">
import { computed, h, onBeforeUnmount, ref, useId } from 'vue'
import { DownloadIcon, PencilIcon, PlusIcon, RepoIcon, TrashIcon } from '@onlikee/octicons-vue'
import { ActionList } from '@/components/primer-vue/ActionList'
import { ActionMenu } from '@/components/primer-vue/ActionMenu'
import { Blankslate } from '@/components/primer-vue/Blankslate'
import { Button, IconButton } from '@/components/primer-vue/Button'
import {
  DataTable,
  Table,
  createColumnHelper,
  type Column,
  type DataTableData,
  type DataTableRowGroup,
} from '@/components/primer-vue/DataTable'
import { Heading } from '@/components/primer-vue/Heading'
import { Label } from '@/components/primer-vue/Label'
import { LabelGroup } from '@/components/primer-vue/LabelGroup'
import { Link } from '@/components/primer-vue/Link'
import { RelativeTime } from '@/components/primer-vue/RelativeTime'
import { Text } from '@/components/primer-vue/Text'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
  type DocumentationRow,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

interface Repository {
  id: number
  name: string
  visibility: 'public' | 'internal'
  updatedAt: number
  stars: number | null
  securityFeatures: { dependabot: string[]; codeScanning: string[] }
}
const id = useId()
const rows: Repository[] = [
  {
    id: 1,
    name: 'codeql-dca-worker',
    visibility: 'internal',
    updatedAt: 1792195200000,
    stars: 0,
    securityFeatures: {
      dependabot: ['Alerts', 'Security updates', 'Version updates'],
      codeScanning: ['Report secrets'],
    },
  },
  {
    id: 2,
    name: 'aegir',
    visibility: 'public',
    updatedAt: 1792194900000,
    stars: 120,
    securityFeatures: { dependabot: ['Alerts'], codeScanning: ['CodeQL'] },
  },
  {
    id: 3,
    name: 'strapi',
    visibility: 'public',
    updatedAt: 1792191600000,
    stars: null,
    securityFeatures: { dependabot: [], codeScanning: [] },
  },
  {
    id: 4,
    name: 'codeql-ci-nightlies',
    visibility: 'public',
    updatedAt: 1792173600000,
    stars: 25,
    securityFeatures: { dependabot: ['Alerts'], codeScanning: [] },
  },
]
const helper = createColumnHelper<Repository>()
function renderLabels(labels: string[]) {
  return labels.length
    ? h(
        LabelGroup,
        { visibleChildCount: 1 },
        { default: () => labels.map((label) => h(Label, { key: label }, () => label)) },
      )
    : h(Table.CellPlaceholder, {}, () => '—')
}
const columns: Column<Repository>[] = [
  helper.column({
    field: 'name',
    header: 'Repository',
    rowHeader: true,
    width: 'growCollapse',
    minWidth: '180px',
    renderCell: (row) =>
      h(Link, { href: `https://github.com/${encodeURIComponent(row.name)}` }, () => row.name),
  }),
  helper.column({
    field: 'visibility',
    header: 'Visibility',
    width: 'auto',
    renderCell: (row) => h(Label, {}, () => row.visibility),
  }),
  helper.column({
    field: 'updatedAt',
    header: 'Updated',
    width: 'auto',
    renderCell: (row) => h(RelativeTime, { date: new Date(row.updatedAt) }),
  }),
  helper.column({
    field: 'securityFeatures.dependabot',
    header: 'Dependabot',
    minWidth: '150px',
    renderCell: (row) => renderLabels(row.securityFeatures.dependabot),
  }),
  helper.column({
    field: 'securityFeatures.codeScanning',
    header: 'Code scanning',
    minWidth: '130px',
    renderCell: (row) => renderLabels(row.securityFeatures.codeScanning),
  }),
]
const simpleColumns: Column<Repository>[] = [
  helper.column({ field: 'name', header: 'Repository', rowHeader: true, width: 'growCollapse' }),
  helper.column({ field: 'visibility', header: 'Visibility', width: 'auto' }),
  helper.column({
    field: 'stars',
    header: 'Stars',
    align: 'end',
    width: 'auto',
    renderCell: (row) => row.stars ?? h(Table.CellPlaceholder, {}, () => '—'),
  }),
]
const cellPadding = ref<'condensed' | 'normal' | 'spacious'>('normal')
const actionLayout = ref('title-and-subtitle')
const actionCount = ref('multiple')
const actionMessage = ref('尚未执行操作')
const rowActionMode = ref('menu')
function perform(action: string, row?: Repository) {
  actionMessage.value = row ? `${action}：${row.name}` : action
}
function renderActions(row: Repository) {
  if (rowActionMode.value === 'single')
    return h(
      Button,
      {
        size: 'small',
        variant: 'invisible',
        'aria-label': `编辑 ${row.name}`,
        onClick: () => perform('编辑', row),
      },
      () => '编辑',
    )
  if (rowActionMode.value === 'multiple')
    return h('div', { class: 'row-actions' }, [
      h(IconButton, {
        icon: PencilIcon,
        size: 'small',
        variant: 'invisible',
        'aria-label': `编辑 ${row.name}`,
        onClick: () => perform('编辑', row),
      }),
      h(IconButton, {
        icon: TrashIcon,
        size: 'small',
        variant: 'invisible',
        'aria-label': `移除 ${row.name}`,
        onClick: () => perform('移除', row),
      }),
    ])
  return h(
    ActionMenu,
    {},
    {
      default: () => [
        h(
          ActionMenu.Button,
          { size: 'small', variant: 'invisible', 'aria-label': `${row.name} 的操作` },
          () => '⋯',
        ),
        h(
          ActionMenu.Overlay,
          {},
          {
            default: () =>
              h(
                ActionList,
                {},
                {
                  default: () => [
                    h(ActionList.Item, { onSelect: () => perform('编辑', row) }, () => '编辑'),
                    h(ActionList.Item, { onSelect: () => perform('下载', row) }, () => '下载'),
                    h(ActionList.Divider),
                    h(
                      ActionList.Item,
                      { variant: 'danger', onSelect: () => perform('移除', row) },
                      () => '移除',
                    ),
                  ],
                },
              ),
          },
        ),
      ],
    },
  )
}
const actionColumns = computed<Column<Repository>[]>(() => [
  ...simpleColumns,
  helper.column({
    id: 'actions',
    header: () => h('span', { class: 'visually-hidden' }, '操作'),
    width: 'auto',
    align: 'end',
    renderCell: renderActions,
  }),
])
const sortEvents = ref('点击列标题开始排序')
const sortColumns: Column<Repository>[] = [
  helper.column({
    field: 'name',
    header: 'Repository',
    rowHeader: true,
    sortBy: 'alphanumeric',
    width: 'growCollapse',
  }),
  helper.column({
    field: 'visibility',
    header: 'Visibility（自定义）',
    sortBy: (a, b) => a.visibility.localeCompare(b.visibility) || a.name.localeCompare(b.name),
  }),
  helper.column({
    field: 'updatedAt',
    header: 'Updated',
    sortBy: 'datetime',
    renderCell: (row) => h(RelativeTime, { date: new Date(row.updatedAt) }),
  }),
  helper.column({
    field: 'stars',
    header: 'Stars',
    align: 'end',
    sortBy: 'basic',
    renderCell: (row) => row.stars ?? h(Table.CellPlaceholder, {}, () => '—'),
  }),
]
function recordSort(column: string | number, direction: 'ASC' | 'DESC') {
  sortEvents.value = `${column} → ${direction}`
}
const externalRows = ref([...rows].sort((a, b) => a.name.localeCompare(b.name)))
function externalSort(column: string | number, direction: 'ASC' | 'DESC') {
  recordSort(column, direction)
  externalRows.value = [...rows].sort((a, b) => {
    let comparison = 0
    if (column === 'name') comparison = a.name.localeCompare(b.name, undefined, { numeric: true })
    if (column === 'visibility')
      comparison = a.visibility.localeCompare(b.visibility) || a.name.localeCompare(b.name)
    if (column === 'updatedAt') comparison = a.updatedAt - b.updatedAt
    if (column === 'stars') {
      if (a.stars === null) return b.stars === null ? 0 : 1
      if (b.stars === null) return -1
      comparison = a.stars - b.stars
    }
    return direction === 'ASC' ? comparison : -comparison
  })
}
const widthColumns: Column<Repository>[] = [
  helper.column({
    field: 'name',
    header: () =>
      h('span', { class: 'custom-header' }, [
        h(RepoIcon, { size: 16, 'aria-hidden': true }),
        'Repository',
      ]),
    rowHeader: true,
    width: 'growCollapse',
    minWidth: '180px',
  }),
  helper.column({ field: 'visibility', header: '固定 120px', width: '120px' }),
  helper.column({
    field: 'stars',
    header: '右对齐 / auto',
    align: 'end',
    width: 'auto',
    renderCell: (row) => row.stars ?? h(Table.CellPlaceholder, {}, () => '—'),
  }),
  helper.column({
    field: 'securityFeatures.dependabot',
    header: 'grow / 最大 240px',
    width: 'grow',
    minWidth: '160px',
    maxWidth: '240px',
    renderCell: (row) => renderLabels(row.securityFeatures.dependabot),
  }),
]
const empty = ref(true)
const loading = ref(true)
const paginatedRows: Repository[] = Array.from({ length: 32 }, (_, index) => ({
  ...rows[index % rows.length]!,
  id: index + 100,
  name: `repository-${index + 1}`,
}))
const pageIndex = ref(0)
const pageSize = 5
const currentPage = computed(() =>
  paginatedRows.slice(pageIndex.value * pageSize, (pageIndex.value + 1) * pageSize),
)
const defaultPageIndex = ref(1)
const uncontrolledPageIndex = ref(1)
const uncontrolledPage = computed(() =>
  paginatedRows.slice(
    uncontrolledPageIndex.value * pageSize,
    (uncontrolledPageIndex.value + 1) * pageSize,
  ),
)
function changeDefaultPage() {
  defaultPageIndex.value = defaultPageIndex.value === 0 ? 1 : 0
  uncontrolledPageIndex.value = defaultPageIndex.value
}
const requestState = ref<'ready' | 'loading' | 'error'>('ready')
const errorOpen = ref(false)
const requestMessage = ref('使用下面的按钮模拟请求失败。')
let requestTimer: ReturnType<typeof setTimeout> | undefined
function simulateRequest(fail: boolean) {
  if (requestTimer) clearTimeout(requestTimer)
  errorOpen.value = false
  requestState.value = 'loading'
  requestMessage.value = '正在加载…'
  requestTimer = setTimeout(() => {
    requestState.value = fail ? 'error' : 'ready'
    errorOpen.value = fail
    requestMessage.value = fail ? '请求失败，可重试或关闭弹窗。' : '请求成功，已恢复数据。'
  }, 700)
}
onBeforeUnmount(() => {
  if (requestTimer) clearTimeout(requestTimer)
})
function dismissError() {
  errorOpen.value = false
  requestMessage.value = '已关闭错误弹窗，可点击重新加载恢复数据。'
}
const groups: DataTableRowGroup<Repository>[] = [
  {
    groupId: 'internal',
    label: 'Internal',
    rows: rows.filter((row) => row.visibility === 'internal'),
  },
  { groupId: 'public', label: 'Public', rows: rows.filter((row) => row.visibility === 'public') },
  { groupId: 'archived', label: 'Archived', rows: [] },
]
const groupedPageIndex = ref(0)
const groupedPageSize = 3
const mixedRows: DataTableData<Repository> = [
  { ...rows[0]!, id: 90, name: 'standalone/before' },
  ...groups.slice(0, 2),
  { ...rows[1]!, id: 91, name: 'standalone/after' },
]
const totalGroupedCount = mixedRows.reduce(
  (count, item) => count + ('rows' in item ? item.rows.length : 1),
  0,
)
const paginatedGroups = computed<DataTableData<Repository>>(() => {
  const allRows = mixedRows.flatMap((item) => ('rows' in item ? item.rows : [item]))
  const visibleIds = new Set(
    allRows
      .slice(
        groupedPageIndex.value * groupedPageSize,
        (groupedPageIndex.value + 1) * groupedPageSize,
      )
      .map((row) => row.id),
  )
  return mixedRows.flatMap((item): DataTableData<Repository> => {
    if ('rows' in item) {
      const members = item.rows.filter((row) => visibleIds.has(row.id))
      return members.length ? [{ ...item, rows: members }] : []
    }
    return visibleIds.has(item.id) ? [item] : []
  })
})

const compositionCode = `<script setup lang="ts">
import { h } from 'vue'
import { DataTable, Table, createColumnHelper } from '@/components/primer-vue/DataTable'
import { Label } from '@/components/primer-vue/Label'
type Repository = { id: number; name: string; visibility: string }
const rows: Repository[] = [{ id: 1, name: 'primer/vue', visibility: 'public' }]
const { column } = createColumnHelper<Repository>()
const columns = [
  column({ field: 'name', header: 'Repository', rowHeader: true }),
  column({ field: 'visibility', header: 'Visibility',
    renderCell: row => h(Label, {}, () => row.visibility) }),
]
<\/script>
<template>
  <Table.Container>
    <Table.Title as="h2" id="repositories-title">Repositories</Table.Title>
    <Table.Subtitle id="repositories-description">Repository security coverage</Table.Subtitle>
    <DataTable aria-labelledby="repositories-title" aria-describedby="repositories-description"
      :data="rows" :columns="columns" />
  </Table.Container>
</template>`
const actionsCode = `<Table.Container>
  <Table.Title as="h2" id="actions-title">Repositories</Table.Title>
  <Table.Actions>
    <Button :leading-visual="PlusIcon" @click="createRepository">New repository</Button>
    <IconButton :icon="DownloadIcon" aria-label="下载仓库列表" @click="download" />
  </Table.Actions>
  <DataTable aria-labelledby="actions-title" :data="rows" :columns="[
    ...columns,
    { id: 'actions', header: () => h('span', { class: 'visually-hidden' }, '操作'),
      width: 'auto', renderCell: row => h(Button, {
        'aria-label': '编辑 ' + row.name, onClick: () => edit(row)
      }, () => '编辑') },
  ]" />
</Table.Container>`
const sortingCode = `const columns: Column<Repository>[] = [
  { field: 'name', header: 'Repository', sortBy: 'alphanumeric' },
  { field: 'stars', header: 'Stars', sortBy: 'basic', align: 'end' },
  { field: 'updatedAt', header: 'Updated', sortBy: 'datetime' },
  { field: 'visibility', header: 'Visibility',
    sortBy: (a, b) => a.visibility.localeCompare(b.visibility) },
]
// @toggle-sort 接收列 id（缺省为 field）与切换后的 ASC / DESC。
<DataTable :data="rows" :columns="columns" @toggle-sort="recordSort" />
// 初始数据须已按 name 升序排列。externalSorting 下由调用方更新数据。
<DataTable :data="sortedRows" :columns="columns" external-sorting
  initial-sort-column="name" initial-sort-direction="ASC" @toggle-sort="fetchSortedRows" />`
const layoutCode = `<Heading as="h2" id="coverage-title">Security coverage</Heading>
<Table.Container>
  <DataTable aria-labelledby="coverage-title" :data="rows" cell-padding="condensed"
    :columns="[
      { field: 'name', header: () => h('strong', 'Repository'), rowHeader: true,
        width: 'growCollapse', minWidth: '180px' },
      { field: 'visibility', header: 'Visibility', width: '120px' },
      { field: 'stars', header: 'Stars', width: 'auto', align: 'end',
        renderCell: row => row.stars ?? h(Table.CellPlaceholder, {}, () => '—') },
    ]" />
</Table.Container>`
const emptyCode = `<h2 id="empty-repositories">Repositories</h2>
<Blankslate v-if="rows.length === 0" border>
  <Blankslate.Heading>还没有仓库</Blankslate.Heading>
  <Blankslate.Description>创建仓库后，即可在这里查看安全覆盖情况。</Blankslate.Description>
  <Blankslate.PrimaryAction @click="createRepository">创建仓库</Blankslate.PrimaryAction>
</Blankslate>
<DataTable v-else aria-labelledby="empty-repositories" :columns="columns" :data="rows" />`
const loadingCode = `<Table.Container>
  <Table.Title as="h2" id="loading-title">Repositories</Table.Title>
  <Table.Skeleton v-if="loading" aria-labelledby="loading-title" :columns="columns" :rows="4" />
  <DataTable v-else aria-labelledby="loading-title" :columns="columns" :data="rows" />
</Table.Container>`
const paginationCode = `const pageIndex = ref(0)
const pageSize = 5
const page = computed(() => allRows.slice(pageIndex.value * pageSize, (pageIndex.value + 1) * pageSize))
<Table.Container>
  <Table.Title as="h2" id="paginated-repositories">Repositories</Table.Title>
  <DataTable aria-labelledby="paginated-repositories" :data="page" :columns="columns" />
  <Table.Pagination aria-label="仓库分页" :page-size="pageSize"
    :total-count="allRows.length" @change="({ pageIndex: next }) => pageIndex = next" />
</Table.Container>
// 非受控模式：传 default-page-index，通过 change 更新用于显示的数据。
// 更新 defaultPageIndex 也会更新分页当前页；它不会替调用方切片数据。`
const errorCode = `<Table.Container>
  <Table.Title as="h2" id="network-repositories">Repositories</Table.Title>
  <Table.Skeleton v-if="loading || error" aria-labelledby="network-repositories" :columns="columns" />
  <DataTable v-else aria-labelledby="network-repositories" :columns="columns" :data="rows" />
  <Table.ErrorDialog v-if="errorOpen" @retry="retryRequest" @dismiss="dismissError" />
</Table.Container>`
const groupsCode = `import type { DataTableData } from '@/components/primer-vue/DataTable'
const data: DataTableData<Repository> = [
  { id: 90, name: 'standalone/before', visibility: 'public' },
  { groupId: 'internal', label: 'Internal', rows: internalRepositories },
  { groupId: 'public', label: 'Public', rows: publicRepositories },
  { groupId: 'archived', label: 'Archived', rows: [] },
  { id: 91, name: 'standalone/after', visibility: 'public' },
]
<h2 id="grouped-repositories">按可见性分组的仓库</h2>
<DataTable aria-labelledby="grouped-repositories" :data="data" :columns="columns" />
// 排序保留组边界，并分别排序每段连续的普通行。
// 分页按数据行计数；由调用方先选出当前页行，再保留这些行原有的组。`
const directCode = `<script setup lang="ts">
import { useId } from 'vue'
import { Table } from '@/components/primer-vue/DataTable'
const id = useId()
<\/script>
<template>
  <Table.Container>
    <Table.Title as="h2" :id="id + '-title'">Repositories</Table.Title>
    <Table :aria-labelledby="id + '-title'" grid-template-columns="minmax(0, 1fr) auto">
      <Table.Head><Table.Row>
        <Table.Header :id="id + '-name'">Repository</Table.Header>
        <Table.Header :id="id + '-visibility'">Visibility</Table.Header>
      </Table.Row></Table.Head>
      <Table.Group id="public" label="Public" :row-count="1" :col-span="2">
        <Table.Row>
          <Table.Cell :id="id + '-row-1'" scope="row" :headers="id + '-name'">primer/vue</Table.Cell>
          <Table.Cell :headers="id + '-row-1 ' + id + '-visibility'">Public</Table.Cell>
        </Table.Row>
      </Table.Group>
    </Table>
  </Table.Container>
</template>`
const apiColumns: DocumentationColumn[] = [
  { field: 'name', header: '属性 / 接口', rowHeader: true, minWidth: '170px' },
  { field: 'type', header: '类型', minWidth: '200px' },
  { field: 'default', header: '默认值', minWidth: '100px' },
  { field: 'description', header: '说明', minWidth: '250px' },
]
const tableApiRows: DocumentationRow[] = [
  {
    id: 'data',
    name: 'data',
    type: 'DataTableData<Data>',
    default: '必填',
    description: '普通行、分组行或两者混合的数组；行必须含稳定 id，组不能嵌套。',
  },
  {
    id: 'columns',
    name: 'columns',
    type: 'Column<Data>[]',
    default: '必填',
    description:
      '定义字段、表头、渲染、排序和列宽；使用 createColumnHelper<Data>().column 保留类型推导。',
  },
  {
    id: 'cellPadding',
    name: 'cellPadding',
    type: "'condensed' | 'normal' | 'spacious'",
    default: 'normal',
    description: '单元格密度。',
  },
  {
    id: 'getRowId',
    name: 'getRowId',
    type: '(row: Data) => string | number',
    default: 'row => row.id',
    description: '自定义行标识；id 字段仍为数据类型的一部分。',
  },
  {
    id: 'initialSortColumn',
    name: 'initialSortColumn',
    type: 'ObjectPaths<Data> | string | number',
    default: '—',
    description: '初始排序列的 id 或 field；输入数据须预先按对应方向排好。',
  },
  {
    id: 'initialSortDirection',
    name: 'initialSortDirection',
    type: "'ASC' | 'DESC'",
    default: 'ASC',
    description: '初始排序方向；点击表头在 ASC / DESC 间切换。',
  },
  {
    id: 'externalSorting',
    name: 'externalSorting',
    type: 'boolean',
    default: 'false',
    description: '禁用内部数据排序，仍更新排序状态并发出 toggle-sort 事件；由调用方排序完整数据。',
  },
  {
    id: 'aria',
    name: 'aria-labelledby / aria-describedby',
    type: 'string',
    default: '—',
    description: '关联外部标题和描述；没有可见标题时，可关联 VisuallyHidden 中的命名文本。',
  },
  {
    id: 'toggle-sort',
    name: '@toggle-sort',
    type: '(columnId, direction: ASC | DESC) => void',
    default: '—',
    description: '用户切换排序时触发一次。',
  },
]
const columnApiRows: DocumentationRow[] = [
  {
    id: 'column-id',
    name: 'id',
    type: 'string',
    default: 'field',
    description: '稳定的列标识；操作列等没有 field 的列必须显式设置 id。',
  },
  {
    id: 'field',
    name: 'field',
    type: 'ObjectPaths<Data>',
    default: '—',
    description: '字段路径，支持 securityFeatures.dependabot 等嵌套属性。',
  },
  {
    id: 'header',
    name: 'header',
    type: 'string | (() => VNodeChild)',
    default: '必填',
    description: '表头文本或 Vue 渲染函数。',
  },
  {
    id: 'renderCell',
    name: 'renderCell',
    type: '(row: Data) => VNodeChild',
    default: '读取 field',
    description: '接收完整数据行，可使用 h 组合 Label、RelativeTime、Button、ActionMenu 等组件。',
  },
  {
    id: 'rowHeader',
    name: 'rowHeader',
    type: 'boolean',
    default: 'false',
    description: '将本列作为行标题，并自动建立单元格关联。',
  },
  {
    id: 'sortBy',
    name: 'sortBy',
    type: "boolean | 'basic' | 'datetime' | 'alphanumeric' | ((a: Data, b: Data) => number)",
    default: 'false',
    description: '启用排序、指定策略或比较整行；null / undefined 始终放到末尾。',
  },
  {
    id: 'align',
    name: 'align',
    type: "'start' | 'end'",
    default: 'start',
    description: '逻辑方向对齐；数值列建议 end。',
  },
  {
    id: 'width',
    name: 'width',
    type: "'grow' | 'growCollapse' | 'auto' | CSS width",
    default: 'grow',
    description: '拉伸、允许收缩、内容宽度或固定列宽。',
  },
  {
    id: 'minmax',
    name: 'minWidth / maxWidth',
    type: 'CSS minWidth / maxWidth',
    default: '—',
    description: '设置列宽上下限；窄屏下由滚动区域容纳溢出列。',
  },
]
const compositionApiRows: DocumentationRow[] = [
  {
    id: 'container',
    name: 'Table.Container / Title / Subtitle / Actions / Divider',
    type: '组合组件',
    default: '—',
    description: '组织容器、标题、描述、操作与分隔线；Title 和 Subtitle 支持 as，标题关联使用 id。',
  },
  {
    id: 'structure',
    name: 'Table / Head / Body / Row / Header / Cell',
    type: '底层组合组件',
    default: '—',
    description:
      'Table 接收 gridTemplateColumns 和 cellPadding；Header、Cell 支持 headers / scope / align，自行维护标题关联。',
  },
  {
    id: 'group',
    name: 'Table.Group',
    type: 'id / label / rowCount / colSpan / aria-label',
    default: '必填前四项',
    description: '渲染组标题及成员区，自动为成员单元格补充组标题关联。',
  },
  {
    id: 'placeholder',
    name: 'Table.CellPlaceholder',
    type: '单元格内容',
    default: '无默认内容',
    description: '以弱化样式显示传入的占位内容，例如“—”；零值仍应正常显示。',
  },
  {
    id: 'skeleton',
    name: 'Table.Skeleton',
    type: 'columns / rows / cellPadding',
    default: 'rows: 10',
    description: '复用列布局和表头，展示有加载提示的骨架屏。',
  },
  {
    id: 'pagination',
    name: 'Table.Pagination',
    type: 'totalCount / pageSize / defaultPageIndex / showPages',
    default: 'pageSize: 25；pageIndex: 0',
    description: '零基页码，内部管理当前页；@change({ pageIndex }) 通知新页，不负责切片数据。',
  },
  {
    id: 'error',
    name: 'Table.ErrorDialog',
    type: '@retry / @dismiss',
    default: '—',
    description:
      '挂载时打开错误确认弹窗，使用 Retry 与 Dismiss 操作；由调用方卸载、重试并更新加载状态。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="DataTable 数据表格"
      description="与 React DataTable 对齐的数据模型、排序、分组和 Table 组合接口。通过 Vue 渲染函数组合其他 Primer 组件。"
    />
    <ComponentDocsSection title="标题、描述与自定义单元格">
      <template #description
        >用 <code>Table.Container</code> 组织表格，用 <code>aria-labelledby</code> 和
        <code>aria-describedby</code> 关联标题与描述。单元格接收完整数据行，可组合
        Link、Label、LabelGroup 与 RelativeTime。</template
      >
      <ComponentDocsDemoBlock :code="compositionCode"
        ><Table.Container>
          <Table.Title :id="`${id}-overview-title`" as="h2">Repositories</Table.Title>
          <Table.Subtitle :id="`${id}-overview-description`"
            >Repository security coverage：展开标签可查看所有安全功能。</Table.Subtitle
          >
          <DataTable
            :aria-labelledby="`${id}-overview-title`"
            :aria-describedby="`${id}-overview-description`"
            :data="rows"
            :columns="columns"
            :get-row-id="(row) => `repository-${row.id}`"
          /> </Table.Container
      ></ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="表格操作与行操作">
      <template #description
        ><code>Table.Actions</code> 可与标题和副标题组合，也可单独使用。行操作使用独立按钮或
        ActionMenu；操作列以自定义表头提供无障碍名称。</template
      >
      <ComponentDocsDemoBlock :code="actionsCode">
        <div class="controls">
          <label
            >表格标题布局
            <select v-model="actionLayout">
              <option value="title-and-subtitle">标题、副标题与操作</option>
              <option value="title">标题与操作</option>
              <option value="actions-only">仅操作</option>
            </select></label
          >
          <label
            >表格操作数量
            <select v-model="actionCount">
              <option value="single">单个操作</option>
              <option value="multiple">多个操作</option>
            </select></label
          >
          <label
            >行操作
            <select v-model="rowActionMode" name="row-action-mode">
              <option value="single">单个按钮</option>
              <option value="multiple">多个图标按钮</option>
              <option value="menu">操作菜单</option>
            </select></label
          >
        </div>
        <Table.Container>
          <Table.Title v-if="actionLayout !== 'actions-only'" :id="`${id}-actions-title`" as="h2"
            >Repositories</Table.Title
          >
          <VisuallyHidden v-if="actionLayout === 'actions-only'" :id="`${id}-actions-title`"
            >Repositories</VisuallyHidden
          >
          <Table.Subtitle
            v-if="actionLayout === 'title-and-subtitle'"
            :id="`${id}-actions-description`"
            >管理仓库并查看最近活动。</Table.Subtitle
          >
          <Table.Actions
            ><Button :leading-visual="PlusIcon" size="small" @click="perform('创建仓库')"
              >New repository</Button
            ><IconButton
              v-if="actionCount === 'multiple'"
              :icon="DownloadIcon"
              size="small"
              aria-label="下载仓库列表"
              @click="perform('下载仓库列表')"
          /></Table.Actions>
          <DataTable
            :aria-labelledby="`${id}-actions-title`"
            :columns="actionColumns"
            :data="rows"
          />
        </Table.Container>
        <Text as="p" class="status" role="status">{{ actionMessage }}</Text>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="内置排序、自定义排序与排序事件">
      <template #description
        >支持自然排序、数字、日期和整行比较函数。点击后在升序与降序间切换，空值始终置后，<code
          >0</code
        >
        仍是有效数值。外部排序表格的初始数据已按 name 升序排列。</template
      >
      <ComponentDocsDemoBlock :code="sortingCode">
        <Table.Container
          ><Table.Title :id="`${id}-sorting-title`" as="h2">Client-side sorting</Table.Title
          ><DataTable
            :aria-labelledby="`${id}-sorting-title`"
            :data="rows"
            :columns="sortColumns"
            @toggle-sort="recordSort"
        /></Table.Container>
        <Table.Container class="following-table"
          ><Table.Title :id="`${id}-external-title`" as="h2">External sorting</Table.Title
          ><DataTable
            :aria-labelledby="`${id}-external-title`"
            :data="externalRows"
            :columns="sortColumns"
            external-sorting
            initial-sort-column="name"
            initial-sort-direction="ASC"
            @toggle-sort="externalSort"
        /></Table.Container>
        <p class="status" role="status">{{ sortEvents }}</p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="列宽、密度、右对齐与占位内容">
      <template #description
        ><code>grow</code> 分配剩余空间；<code>growCollapse</code> 允许收缩；<code>auto</code>
        使用内容宽度。固定宽度、最小与最大宽度可以混用。这里还演示容器外的
        Heading、自定义列标题与窄屏横向滚动。</template
      >
      <ComponentDocsDemoBlock :code="layoutCode">
        <div class="controls">
          <label
            >单元格密度
            <select v-model="cellPadding">
              <option value="condensed">condensed</option>
              <option value="normal">normal</option>
              <option value="spacious">spacious</option>
            </select></label
          >
        </div>
        <Heading :id="`${id}-layout-title`" as="h2" class="custom-heading"
          >Security coverage</Heading
        >
        <p :id="`${id}-layout-description`" class="status">
          调整窗口宽度可检查列宽和滚动。缺失 Stars 使用占位组件，零值保持显示。
        </p>
        <div class="overflow-demo">
          <Table.Container
            ><DataTable
              :aria-labelledby="`${id}-layout-title`"
              :aria-describedby="`${id}-layout-description`"
              :columns="widthColumns"
              :data="rows"
              :cell-padding="cellPadding"
          /></Table.Container>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="空状态">
      <template #description
        >由调用方根据数据量选择 Blankslate 或表格，并通过可执行的主要操作引导用户。</template
      >
      <ComponentDocsDemoBlock :code="emptyCode">
        <label class="check-control"><input v-model="empty" type="checkbox" />使用空数据</label>
        <Blankslate v-if="empty" border
          ><Blankslate.Visual><RepoIcon :size="32" /></Blankslate.Visual
          ><Blankslate.Heading>还没有仓库</Blankslate.Heading
          ><Blankslate.Description>创建仓库后，即可在这里查看安全覆盖情况。</Blankslate.Description
          ><Blankslate.PrimaryAction @click="empty = false"
            >创建示例仓库</Blankslate.PrimaryAction
          ></Blankslate
        >
        <Table.Container v-else
          ><VisuallyHidden :id="`${id}-empty-title`">Repositories 空状态示例</VisuallyHidden
          ><DataTable :aria-labelledby="`${id}-empty-title`" :columns="simpleColumns" :data="rows"
        /></Table.Container>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="加载与骨架屏">
      <template #description
        ><code>Table.Skeleton</code>
        使用相同的列配置保持布局，并提供加载提示。用受控开关切换，便于检查浅色、深色与不同尺寸下的显示。</template
      >
      <ComponentDocsDemoBlock :code="loadingCode">
        <label class="check-control"><input v-model="loading" type="checkbox" />显示加载状态</label>
        <Table.Container
          ><Table.Title :id="`${id}-loading-title`" as="h2">Repositories</Table.Title
          ><Table.Skeleton
            v-if="loading"
            :aria-labelledby="`${id}-loading-title`"
            :columns="simpleColumns"
            :rows="4" /><DataTable
            v-else
            :aria-labelledby="`${id}-loading-title`"
            :columns="simpleColumns"
            :data="rows"
        /></Table.Container>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="分页与默认页码">
      <template #description
        >页码从 <code>0</code> 开始，<code>change</code> 接收
        <code>{ pageIndex }</code>。分页只管理导航，调用方负责切片、总条数和整体排序；未传 pageSize
        时默认为 25。</template
      >
      <ComponentDocsDemoBlock :code="paginationCode">
        <Table.Container
          ><Table.Title :id="`${id}-pagination-title`" as="h2"
            >Pagination with page data</Table.Title
          ><DataTable
            :aria-labelledby="`${id}-pagination-title`"
            :data="currentPage"
            :columns="simpleColumns" /><Table.Pagination
            aria-label="仓库分页"
            :page-size="pageSize"
            :total-count="paginatedRows.length"
            @change="(event) => (pageIndex = event.pageIndex)"
        /></Table.Container>
        <div class="controls">
          <Button size="small" @click="changeDefaultPage"
            >将 defaultPageIndex 改为 {{ defaultPageIndex === 0 ? 1 : 0 }}</Button
          >
        </div>
        <Table.Container
          ><Table.Title :id="`${id}-default-page-title`" as="h2">Default page index</Table.Title
          ><DataTable
            :aria-labelledby="`${id}-default-page-title`"
            :data="uncontrolledPage"
            :columns="simpleColumns" /><Table.Pagination
            aria-label="默认页码仓库分页"
            :default-page-index="defaultPageIndex"
            :page-size="pageSize"
            :total-count="paginatedRows.length"
            @change="(event) => (uncontrolledPageIndex = event.pageIndex)"
        /></Table.Container>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="请求失败、重试与关闭">
      <template #description
        >本地模拟请求固定在 700ms 后完成。失败时保留骨架布局并挂载
        <code>Table.ErrorDialog</code>；Retry 会重新加载成功数据，Dismiss
        关闭弹窗并恢复触发按钮焦点。</template
      >
      <ComponentDocsDemoBlock :code="errorCode">
        <div class="controls">
          <Button @click="simulateRequest(true)">模拟请求失败</Button
          ><Button @click="simulateRequest(false)">重新加载成功数据</Button>
        </div>
        <Table.Container
          ><Table.Title :id="`${id}-network-title`" as="h2">Repositories</Table.Title
          ><Table.Skeleton
            v-if="requestState !== 'ready'"
            :aria-labelledby="`${id}-network-title`"
            :columns="simpleColumns"
            :rows="4" /><DataTable
            v-else
            :aria-labelledby="`${id}-network-title`"
            :data="rows"
            :columns="simpleColumns" /><Table.ErrorDialog
            v-if="errorOpen"
            @retry="simulateRequest(false)"
            @dismiss="dismissError"
        /></Table.Container>
        <p class="status" role="status">{{ requestMessage }}</p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="可排序分组、空组与混合分页">
      <template #description
        >每组由
        <code>groupId / label / rows</code>
        定义。表格保留组顺序、显示成员数量，并建立组、列与行标题关联。混合数据中的普通行仍保留原位置；分页总数只统计数据行。</template
      >
      <ComponentDocsDemoBlock :code="groupsCode">
        <Table.Container
          ><Table.Title :id="`${id}-groups-title`" as="h2"
            >Sortable repositories by visibility</Table.Title
          ><DataTable :aria-labelledby="`${id}-groups-title`" :data="groups" :columns="sortColumns"
        /></Table.Container>
        <Table.Container class="following-table"
          ><Table.Title :id="`${id}-mixed-title`" as="h2"
            >Paginated mixed rows and groups</Table.Title
          ><DataTable
            :aria-labelledby="`${id}-mixed-title`"
            :data="paginatedGroups"
            :columns="simpleColumns" /><Table.Pagination
            aria-label="分组仓库分页"
            :page-size="groupedPageSize"
            :total-count="totalGroupedCount"
            @change="(event) => (groupedPageIndex = event.pageIndex)"
        /></Table.Container>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="直接组合底层 Table">
      <template #description
        >需要完全控制结构时可直接组合底层组件。使用
        <code>useId</code> 创建实例专属标识，自行连接列标题与行标题；Table.Group
        自动补充组标题关联。Table.Body 也可用于不分组的数据。</template
      >
      <ComponentDocsDemoBlock :code="directCode"
        ><Table.Container>
          <Table.Title :id="`${id}-direct-title`" as="h2">Repositories by visibility</Table.Title>
          <Table
            :aria-labelledby="`${id}-direct-title`"
            grid-template-columns="minmax(0, 1fr) auto"
          >
            <Table.Head
              ><Table.Row
                ><Table.Header :id="`${id}-direct-name`">Repository</Table.Header
                ><Table.Header :id="`${id}-direct-visibility`">Visibility</Table.Header></Table.Row
              ></Table.Head
            >
            <Table.Body
              ><Table.Row
                ><Table.Cell
                  :id="`${id}-direct-standalone`"
                  scope="row"
                  :headers="`${id}-direct-name`"
                  >standalone/repository</Table.Cell
                ><Table.Cell :headers="`${id}-direct-standalone ${id}-direct-visibility`"
                  >Unassigned</Table.Cell
                ></Table.Row
              ></Table.Body
            >
            <Table.Group
              v-for="group in groups"
              :id="group.groupId"
              :key="group.groupId"
              :label="group.label"
              :row-count="group.rows.length"
              :col-span="2"
              ><Table.Row v-for="row in group.rows" :key="row.id"
                ><Table.Cell
                  :id="`${id}-direct-row-${row.id}`"
                  scope="row"
                  :headers="`${id}-direct-name`"
                  >{{ row.name }}</Table.Cell
                ><Table.Cell :headers="`${id}-direct-row-${row.id} ${id}-direct-visibility`"
                  ><Label>{{ row.visibility }}</Label></Table.Cell
                ></Table.Row
              ></Table.Group
            >
          </Table>
          <Table.Divider /><Table.Subtitle :id="`${id}-direct-description`"
            >组合组件使用与 DataTable 相同的网格布局和样式。</Table.Subtitle
          >
        </Table.Container></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <h3 :id="`${id}-api-table-title`">DataTable&lt;Data&gt;</h3>
      <ComponentDocsTable
        :aria-labelledby="`${id}-api-table-title`"
        :columns="apiColumns"
        :data="tableApiRows"
      />
      <h3 :id="`${id}-api-column-title`">Column&lt;Data&gt;</h3>
      <ComponentDocsTable
        :aria-labelledby="`${id}-api-column-title`"
        :columns="apiColumns"
        :data="columnApiRows"
      />
      <h3 :id="`${id}-api-composition-title`">Table 组合组件</h3>
      <ComponentDocsTable
        :aria-labelledby="`${id}-api-composition-title`"
        :columns="apiColumns"
        :data="compositionApiRows"
      />
      <p>
        导出的数据类型包括
        <code>DataTableProps&lt;Data&gt;</code
        >、<code>Column&lt;Data&gt;</code>、<code>UniqueRow</code>、<code>DataTableData&lt;Data&gt;</code>、<code
          >DataTableRowGroup&lt;Data&gt;</code
        >
        与 <code>ObjectPaths&lt;Data&gt;</code>。
      </p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-block: 12px;
}
.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.controls select {
  padding: 4px 8px;
  border: 1px solid var(--borderColor-default, #d1d9e0);
  border-radius: 6px;
  color: var(--fgColor-default, #1f2328);
  background: var(--bgColor-default, #fff);
}
.status {
  margin-block: 12px;
  font-size: 14px;
  color: var(--fgColor-muted, #59636e);
}
.following-table {
  margin-block-start: 24px;
}
.custom-heading {
  margin-block: 12px;
}
.overflow-demo {
  max-width: 580px;
}
.check-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-block-end: 12px;
}
:deep(.custom-header),
:deep(.row-actions) {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
:deep(.visually-hidden) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
