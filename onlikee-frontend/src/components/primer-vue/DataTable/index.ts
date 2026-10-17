import {
  Table as TableImpl,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableSortHeader,
  TableCell,
  TableCellPlaceholder,
  TableContainer,
  TableTitle,
  TableSubtitle,
  TableActions,
  TableDivider,
} from './Table'
import { TableGroup } from './TableGroup'
import TableSkeleton from './TableSkeleton.vue'
import Pagination from './Pagination.vue'
import ErrorDialog from './ErrorDialog.vue'

export const Table = Object.assign(TableImpl, {
  Container: TableContainer,
  Title: TableTitle,
  Subtitle: TableSubtitle,
  Actions: TableActions,
  Divider: TableDivider,
  Skeleton: TableSkeleton,
  Head: TableHead,
  Body: TableBody,
  Group: TableGroup,
  Header: TableHeader,
  Row: TableRow,
  Cell: TableCell,
  CellPlaceholder: TableCellPlaceholder,
  Pagination,
  ErrorDialog,
})
export { default as DataTable } from './DataTable.vue'
export {
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableSortHeader,
  TableCell,
  TableCellPlaceholder,
  TableContainer,
  TableTitle,
  TableSubtitle,
  TableActions,
  TableDivider,
  TableGroup,
  TableSkeleton,
  Pagination,
  ErrorDialog,
}
export type { DataTableProps } from './types'
export type {
  TableProps,
  TableInstance,
  TableHeadProps,
  TableBodyProps,
  TableRowProps,
  TableHeaderProps,
  TableSortHeaderProps,
  TableCellProps,
  TableContainerProps,
  TableTitleProps,
  TableSubtitleProps,
  TableActionsProps,
} from './Table'
export type { TableGroupProps } from './TableGroup'
export type { TableSkeletonProps } from './TableSkeleton.vue'
export type { PaginationProps, PaginationState } from './Pagination.vue'
export type { TableErrorDialogProps } from './ErrorDialog.vue'
export { createColumnHelper } from './column'
export type { Column, CellAlignment, ColumnWidth } from './column'
export type { DataTableData, DataTableRowGroup, UniqueRow } from './row'
export type { ObjectPaths } from './utils'
export { SortDirection } from './sorting'
export type { SortStrategy, CustomSortStrategy } from './sorting'
