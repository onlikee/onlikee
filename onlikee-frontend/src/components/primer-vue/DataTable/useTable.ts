import { computed, shallowRef, useId, watch } from 'vue'
import type { Column } from './column'
import { isDataTableRowGroup, type DataTableData, type UniqueRow } from './row'
import { strategies, type SortDirection } from './sorting'
import type { DataTableProps } from './types'
import { getValueByPath } from './utils'

export interface Header<Data extends UniqueRow> {
  id: string | number
  domId?: string
  column: Column<Data>
  isSortable: () => boolean
  getSortDirection: () => SortDirection
}
export interface Cell<Data extends UniqueRow> {
  id: string
  domId?: string
  headers?: string
  column: Column<Data>
  rowHeader: boolean
  getValue: () => unknown
}
export interface Row<Data extends UniqueRow> {
  type: 'row'
  id: string
  getCells: () => Cell<Data>[]
  getValue: () => Data
}
export interface RowBody<Data extends UniqueRow> {
  type: 'row-body'
  key: string
  rows: Row<Data>[]
}
export interface RowGroup<Data extends UniqueRow> {
  type: 'row-group'
  key: string
  id: string | number
  label: string
  rows: Row<Data>[]
  'aria-label'?: string
}
type SortState = { id: string | number; direction: Exclude<SortDirection, 'NONE'> } | null

/** A reactive model; initialSort* describes the supplied order and never reorders the initial input. */
export function useTable<Data extends UniqueRow>(props: DataTableProps<Data>) {
  const tableId = useId()
  const rowOrder = shallowRef<DataTableData<Data>>(props.data)
  const sortState = shallowRef<SortState>(getInitialSortState(props))
  const headers = computed<Header<Data>[]>(() => {
    const hasGroups = rowOrder.value.some(isDataTableRowGroup)
    return props.columns.map((column, index) => {
      const id = column.id ?? column.field
      if (id === undefined)
        throw new Error('Expected either an `id` or `field` to be defined for a Column')
      return {
        id,
        domId: hasGroups ? `${tableId}-column-${index}` : undefined,
        column,
        isSortable: () => column.sortBy !== undefined && column.sortBy !== false,
        getSortDirection: () => (sortState.value?.id === id ? sortState.value.direction : 'NONE'),
      }
    })
  })
  watch(
    () => props.columns,
    (columns) => {
      if (
        sortState.value &&
        !columns.some((column) => (column.id ?? column.field) === sortState.value?.id)
      ) {
        sortState.value = null
      }
    },
    { flush: 'sync' },
  )
  watch(
    () => props.data,
    (data) => {
      rowOrder.value = getSortedRowOrder(
        data,
        props.columns,
        sortState.value,
        props.externalSorting,
      )
    },
    { flush: 'sync' },
  )

  function sortBy(header: Header<Data>) {
    const direction =
      sortState.value?.id === header.id && sortState.value.direction === 'ASC' ? 'DESC' : 'ASC'
    sortState.value = { id: header.id, direction }
    rowOrder.value = getSortedRowOrder(
      rowOrder.value,
      props.columns,
      sortState.value,
      props.externalSorting,
    )
    return direction
  }

  const bodies = computed<Array<RowBody<Data> | RowGroup<Data>>>(() => {
    const result: Array<RowBody<Data> | RowGroup<Data>> = []
    const hasGroups = rowOrder.value.some(isDataTableRowGroup)
    let rowIndex = 0
    function createRow(row: Data): Row<Data> {
      const index = rowIndex++
      const id = String(props.getRowId ? props.getRowId(row) : row.id)
      const rowHeaderIds = hasGroups
        ? headers.value.flatMap((header, columnIndex) =>
            header.column.rowHeader ? [`${tableId}-row-${index}-header-${columnIndex}`] : [],
          )
        : []
      return {
        type: 'row',
        id,
        getValue: () => row,
        getCells: () =>
          headers.value.map((header, columnIndex) => {
            const rowHeader = header.column.rowHeader ?? false
            return {
              id: `${id}:${header.id}`,
              domId:
                hasGroups && rowHeader
                  ? `${tableId}-row-${index}-header-${columnIndex}`
                  : undefined,
              headers: hasGroups
                ? (rowHeader ? [header.domId] : [...rowHeaderIds, header.domId]).join(' ')
                : undefined,
              column: header.column,
              rowHeader,
              getValue: () => {
                if (header.column.field !== undefined)
                  return getValueByPath(row, header.column.field)
                throw new Error(`Unable to get value for column header ${header.id}`)
              },
            }
          }),
      }
    }
    let body: RowBody<Data> = { type: 'row-body', key: 'rows:start', rows: [] }
    for (const item of rowOrder.value) {
      if (isDataTableRowGroup(item)) {
        if (body.rows.length) result.push(body)
        result.push({
          type: 'row-group',
          key: `group:${item.groupId}`,
          id: item.groupId,
          label: item.label,
          rows: item.rows.map(createRow),
          'aria-label': item['aria-label'],
        })
        body = { type: 'row-body', key: `rows:after:${item.groupId}`, rows: [] }
      } else body.rows.push(createRow(item))
    }
    if (body.rows.length || !result.length) result.push(body)
    return result
  })
  return {
    headers,
    bodies,
    actions: { sortBy },
    gridTemplateColumns: computed(() => getGridTemplateFromColumns(props.columns).join(' ')),
  }
}

function getInitialSortState<Data extends UniqueRow>(props: DataTableProps<Data>): SortState {
  const { columns, initialSortColumn, initialSortDirection } = props
  if (initialSortColumn !== undefined) {
    const column = columns.find(
      (column) => column.id === initialSortColumn || column.field === initialSortColumn,
    )
    if (!column) {
      if (import.meta.env.DEV)
        console.warn(
          `Warning: Unable to find a column with id or field set to: ${initialSortColumn}. Please provide an initialSortColumn which corresponds to an id or field value in a column.`,
        )
      return null
    }
    if (column.sortBy === undefined || column.sortBy === false) {
      if (import.meta.env.DEV)
        console.warn(
          `Warning: The column specified by initialSortColumn={${initialSortColumn}} is not sortable. Please set sortBy to true or provide a sort strategy.`,
        )
      return null
    }
    return { id: String(initialSortColumn), direction: initialSortDirection ?? 'ASC' }
  }
  if (initialSortDirection !== undefined) {
    const column = columns.find((column) => column.sortBy !== false && column.sortBy !== undefined)
    if (!column) {
      if (import.meta.env.DEV)
        console.warn(
          'Warning: An initialSortDirection value was provided but no columns are sortable. Please set sortBy to true or provide a sort strategy to a column.',
        )
      return null
    }
    const id = column.id ?? column.field
    if (id === undefined) return null
    return { id, direction: initialSortDirection }
  }
  return null
}

export function getSortedRowOrder<Data extends UniqueRow>(
  data: DataTableData<Data>,
  columns: Column<Data>[],
  state: SortState,
  externalSorting = false,
): DataTableData<Data> {
  if (!state || externalSorting) return data
  const column = columns.find((column) => (column.id ?? column.field) === state.id)
  if (!column) throw new Error(`Unable to find header with id: ${state.id}`)
  if (column.sortBy === undefined || column.sortBy === false)
    throw new Error('The column for this header is not sortable')
  function sortRows(rows: Data[]): Data[] {
    return rows.slice().sort((a, b) => {
      if (column!.field === undefined) return 0
      if (typeof column!.sortBy === 'function')
        return state!.direction === 'ASC' ? column!.sortBy(a, b) : column!.sortBy(b, a)
      const left = getValueByPath(a, column!.field)
      const right = getValueByPath(b, column!.field)
      const blank = (value: unknown) => value === undefined || value === null || value === ''
      if (blank(left) || blank(right)) return blank(left) ? (blank(right) ? 0 : 1) : -1
      const strategy =
        column!.sortBy === true
          ? strategies.basic
          : strategies[column!.sortBy as keyof typeof strategies]
      // Built-in strategies take field values; custom strategies above take complete rows.
      const compare = strategy as (a: unknown, b: unknown) => number
      return state!.direction === 'ASC' ? compare(left, right) : compare(right, left)
    })
  }
  const result: DataTableData<Data> = []
  let ungrouped: Data[] = []
  const append = () => {
    result.push(...sortRows(ungrouped))
    ungrouped = []
  }
  for (const item of data) {
    if (isDataTableRowGroup(item)) {
      append()
      result.push({ ...item, rows: sortRows(item.rows) })
    } else ungrouped.push(item)
  }
  append()
  return result
}

export function getGridTemplateFromColumns<Data extends UniqueRow>(
  columns: Column<Data>[],
): string[] {
  return columns.map((column) => {
    const width = column.width ?? 'grow'
    let min =
      width === 'grow' && !column.maxWidth ? 'max-content' : width === 'growCollapse' ? '0' : 'auto'
    let max = width === 'auto' ? 'auto' : '1fr'
    if (column.minWidth)
      min = typeof column.minWidth === 'number' ? `${column.minWidth}px` : column.minWidth
    if (column.maxWidth)
      max = typeof column.maxWidth === 'number' ? `${column.maxWidth}px` : column.maxWidth
    if (typeof width !== 'number' && ['grow', 'growCollapse', 'auto'].includes(width))
      return min === max ? min : `minmax(${min}, ${max})`
    return typeof width === 'number' ? `${width}px` : width
  })
}

export function useTableLayout<Data extends UniqueRow>(columns: Column<Data>[]) {
  return { gridTemplateColumns: getGridTemplateFromColumns(columns).join(' ') }
}
