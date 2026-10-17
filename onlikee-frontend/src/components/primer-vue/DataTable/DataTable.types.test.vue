<script setup lang="ts">
import { defineComponent, h } from 'vue'
import {
  DataTable,
  Table,
  createColumnHelper,
  type DataTableProps,
  type Column,
  type DataTableRowGroup,
  type TableContainerProps,
} from './index'
const CustomContainer = defineComponent({
  props: { destination: { type: String, required: true } },
  setup: (props) => () => h('a', { href: props.destination }),
})
const anchorContainer: TableContainerProps<'a'> = { as: 'a', href: '/repositories' }
const customContainer: TableContainerProps<typeof CustomContainer> = {
  as: CustomContainer,
  destination: '/custom',
}
// @ts-expect-error Custom polymorphic container props preserve required component attributes.
const missingDestination: TableContainerProps<typeof CustomContainer> = { as: CustomContainer }
void [anchorContainer, customContainer, missingDestination]
interface Repository {
  id: number
  name: string
  owner: { login: string }
}
const columns: Column<Repository>[] = [
  { header: 'Name', field: 'name' },
  { header: 'Owner', field: 'owner.login' },
]
const groups: DataTableRowGroup<Repository>[] = [
  {
    groupId: 'public',
    label: 'Public',
    rows: [{ id: 1, name: 'primer/vue', owner: { login: 'primer' } }],
  },
]
const props: DataTableProps<Repository> = { data: groups, columns }
const helper = createColumnHelper<Repository>()
const custom = helper.column({
  id: 'custom',
  header: 'Custom',
  renderCell: (row) => row.owner.login,
})
const badField: Column<Repository> = {
  header: 'Invalid',
  // @ts-expect-error Fields must refer to row data rather than group metadata.
  field: 'groupId',
}
const badGroup: DataTableProps<Repository> = {
  columns,
  // @ts-expect-error Nested groups are not supported.
  data: [{ groupId: 'outer', label: 'Outer', rows: groups }],
}
const badRow: DataTableProps<Repository> = {
  columns,
  // @ts-expect-error Member rows need every required row field.
  data: [{ groupId: 'invalid', label: 'Invalid', rows: [{ id: 3 }] }],
}
const removedInterface: DataTableProps<Repository> = {
  ...props,
  // @ts-expect-error The removed compact API is replaced by cellPadding.
  compact: true,
}
void [badField, badGroup, badRow, removedInterface]
</script>
<template>
  <DataTable v-bind="props" />
  <DataTable :data="[{ id: 1, name: 'Flat', owner: { login: 'primer' } }]" :columns="columns" />
  <DataTable :data="groups" :columns="[custom]" />
  <DataTable
    :data="[{ id: 1, name: 'Standalone', owner: { login: 'primer' } }, ...groups]"
    :columns="[
      { header: 'Name', field: 'name', renderCell: (row) => row.name.toUpperCase() },
      { header: 'Owner', field: 'owner.login', renderCell: (row) => row.owner.login },
    ]"
    :get-row-id="(row) => row.id"
  />
  <DataTable
    :data="[
      { id: 1, name: 'Standalone', type: 'repository' },
      {
        id: 'extra-group-id',
        type: 'business-group',
        groupId: 'group',
        label: 'Group',
        rows: [{ id: 2, name: 'Grouped', type: 'repository' }],
      },
    ]"
    :columns="[
      { header: 'Name', field: 'name', renderCell: (row) => row.name.toUpperCase() },
      { header: 'Type', field: 'type', renderCell: (row) => row.type.toUpperCase() },
    ]"
    :get-row-id="
      (row) => {
        const id: number = row.id
        return id
      }
    "
  />
  <DataTable
    :data="[
      {
        groupId: 'inline',
        label: 'Inline',
        rows: [{ id: 2, name: 'Inline', owner: { login: 'primer' } }],
      },
    ]"
    :columns="[{ header: 'Name', field: 'name', renderCell: (row) => row.name.toUpperCase() }]"
  />
  <Table.Skeleton :columns="columns" />
  <!-- @vue-expect-error Only start/end alignment is supported. -->
  <DataTable :data="props.data" :columns="[{ header: 'Name', field: 'name', align: 'center' }]" />
  <!-- @vue-expect-error Pagination requires an accessible landmark label. -->
  <Table.Pagination :total-count="100" />
</template>
