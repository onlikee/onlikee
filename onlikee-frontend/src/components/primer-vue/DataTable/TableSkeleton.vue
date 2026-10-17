<script setup lang="ts" generic="Data extends UniqueRow">
import { computed, type TableHTMLAttributes } from 'vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table'
import { SkeletonText } from '../SkeletonText'
import { VisuallyHidden } from '../VisuallyHidden'
import type { UniqueRow } from './row'
import type { Column } from './column'
import { getGridTemplateFromColumns } from './useTable'
import RenderContent from './RenderContent'
import classes from './Table.module.css'
export interface TableSkeletonProps<
  Data extends UniqueRow,
> extends /* @vue-ignore */ TableHTMLAttributes {
  columns: Column<Data>[]
  cellPadding?: 'condensed' | 'normal' | 'spacious'
  rows?: number
}
const props = withDefaults(defineProps<TableSkeletonProps<Data>>(), {
  rows: 10,
  cellPadding: undefined,
})
const gridTemplateColumns = computed(() => getGridTemplateFromColumns(props.columns).join(' '))
</script>
<template>
  <Table :cell-padding="cellPadding" :grid-template-columns="gridTemplateColumns">
    <TableHead
      ><TableRow>
        <TableHeader v-for="(column, index) in columns" :key="index"
          ><RenderContent
            :value="typeof column.header === 'string' ? column.header : column.header()"
        /></TableHeader> </TableRow
    ></TableHead>
    <TableBody
      ><TableRow>
        <TableCell
          v-for="(_, index) in columns"
          :key="index"
          :class="['TableCellSkeleton', classes.TableCellSkeleton]"
        >
          <VisuallyHidden>Loading</VisuallyHidden>
          <div :class="['TableCellSkeletonItems', classes.TableCellSkeletonItems]">
            <div
              v-for="row in rows"
              :key="row"
              :class="['TableCellSkeletonItem', classes.TableCellSkeletonItem]"
            >
              <SkeletonText />
            </div>
          </div>
        </TableCell> </TableRow
    ></TableBody>
  </Table>
</template>
