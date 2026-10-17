import type { Column } from './column'
import type { DataTableData, UniqueRow } from './row'
import type { SortDirection } from './sorting'
import type { ObjectPaths } from './utils'

export interface DataTableProps<Data extends UniqueRow> {
  'aria-describedby'?: string
  'aria-labelledby'?: string
  /** Vue normalizes native ARIA prop names to camel case on the component instance. */
  ariaDescribedby?: string
  ariaLabelledby?: string
  cellPadding?: 'condensed' | 'normal' | 'spacious'
  columns: Column<Data>[]
  data: DataTableData<Data>
  initialSortColumn?: ObjectPaths<Data> | string | number
  initialSortDirection?: Exclude<SortDirection, 'NONE'>
  externalSorting?: boolean
  getRowId?: (rowData: Data) => string | number
  onToggleSort?: (
    columnId: ObjectPaths<Data> | string | number,
    direction: Exclude<SortDirection, 'NONE'>,
  ) => void
}
