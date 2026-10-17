export interface UniqueRow {
  id: string | number
}

export interface DataTableRowGroup<Data extends UniqueRow> {
  groupId: string | number
  label: string
  rows: Data[]
  'aria-label'?: string
}

/** The combination of groupId and array-valued rows is reserved for groups. */
export type DataTableData<Data extends UniqueRow> = Array<Data | DataTableRowGroup<Data>>

export type DataFromItem<Item> =
  Item extends DataTableRowGroup<infer Data> ? Data : Item extends UniqueRow ? Item : never

export type DataFromInput<Input extends DataTableData<UniqueRow>> = DataFromItem<Input[number]>

export function isDataTableRowGroup<Data extends UniqueRow>(
  item: Data | DataTableRowGroup<Data>,
): item is DataTableRowGroup<Data> {
  return 'groupId' in item && 'rows' in item && Array.isArray(item.rows)
}
