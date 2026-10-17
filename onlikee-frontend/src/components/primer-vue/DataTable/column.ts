import type { CSSProperties, VNodeChild } from 'vue'
import type { ObjectPaths } from './utils'
import type { UniqueRow } from './row'
import type { SortStrategy, CustomSortStrategy } from './sorting'

export type ColumnWidth = 'grow' | 'growCollapse' | 'auto' | CSSProperties['width']
export type CellAlignment = 'start' | 'end' | undefined

export interface Column<Data extends UniqueRow> {
  id?: string
  align?: CellAlignment
  header: string | (() => VNodeChild)
  field?: ObjectPaths<Data>
  maxWidth?: CSSProperties['maxWidth']
  minWidth?: CSSProperties['minWidth']
  renderCell?: (data: Data) => VNodeChild
  rowHeader?: boolean
  sortBy?: boolean | SortStrategy | CustomSortStrategy<Data>
  width?: ColumnWidth
}

export function createColumnHelper<Data extends UniqueRow>() {
  return {
    column(column: Column<Data>): Column<Data> {
      // Preserve numeric object paths at runtime, matching the reference helper's fallback.
      return { ...column, id: column.id ?? column.field } as Column<Data>
    },
  }
}
