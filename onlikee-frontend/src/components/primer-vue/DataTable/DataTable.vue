<script
  setup
  lang="ts"
  generic="Data extends UniqueRow, Input extends DataTableData<Data> = DataTableData<Data>"
>
import type { VNodeChild } from 'vue'
import type { DataTableData, UniqueRow } from './row'
import type { DataTableProps } from './types'
import { useTable } from './useTable'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHeader,
} from './Table'
import { TableGroup } from './TableGroup'
import type { Header } from './useTable'
import RenderContent from './RenderContent'
defineOptions({ name: 'DataTable', inheritAttrs: false })
const props = defineProps<DataTableProps<Data> & { data: Input }>()
const emit = defineEmits<{
  'toggle-sort': [columnId: string | number, direction: 'ASC' | 'DESC']
}>()
const { headers, bodies, gridTemplateColumns, actions } = useTable(props)
function toggleSort(header: Header<Data>) {
  const direction = actions.sortBy(header)
  emit('toggle-sort', header.id, direction)
}
</script>
<template>
  <Table
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :cell-padding="cellPadding"
    :grid-template-columns="gridTemplateColumns"
  >
    <TableHead
      ><TableRow>
        <template v-for="header in headers" :key="header.id">
          <TableSortHeader
            v-if="header.isSortable()"
            :id="header.domId"
            :align="header.column.align"
            :direction="header.getSortDirection()"
            @toggle-sort="toggleSort(header)"
          >
            <RenderContent
              :value="
                typeof header.column.header === 'string'
                  ? header.column.header
                  : header.column.header()
              "
            />
          </TableSortHeader>
          <TableHeader v-else :id="header.domId" :align="header.column.align"
            ><RenderContent
              :value="
                typeof header.column.header === 'string'
                  ? header.column.header
                  : header.column.header()
              "
          /></TableHeader>
        </template> </TableRow
    ></TableHead>
    <template v-for="body in bodies" :key="body.key">
      <TableGroup
        v-if="body.type === 'row-group'"
        :id="body.id"
        :label="body.label"
        :row-count="body.rows.length"
        :col-span="headers.length"
        :aria-label="body['aria-label']"
      >
        <TableRow v-for="row in body.rows" :key="row.id">
          <TableCell
            v-for="cell in row.getCells()"
            :id="cell.domId"
            :key="cell.id"
            :scope="cell.rowHeader ? 'row' : undefined"
            :align="cell.column.align"
            :headers="cell.headers"
          >
            <RenderContent
              :value="
                cell.column.renderCell
                  ? cell.column.renderCell(row.getValue())
                  : (cell.getValue() as VNodeChild)
              "
            />
          </TableCell>
        </TableRow>
      </TableGroup>
      <TableBody v-else>
        <TableRow v-for="row in body.rows" :key="row.id">
          <TableCell
            v-for="cell in row.getCells()"
            :id="cell.domId"
            :key="cell.id"
            :scope="cell.rowHeader ? 'row' : undefined"
            :align="cell.column.align"
            :headers="cell.headers"
          >
            <RenderContent
              :value="
                cell.column.renderCell
                  ? cell.column.renderCell(row.getValue())
                  : (cell.getValue() as VNodeChild)
              "
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </template>
  </Table>
</template>
