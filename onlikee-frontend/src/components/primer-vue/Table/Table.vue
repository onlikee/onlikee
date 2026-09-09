<template>
  <div
    class="table"
    :class="tableClasses"
  >
    <div class="table__container">
      <table
        class="table__table"
        :aria-label="ariaLabel"
      >
        <caption
          v-if="caption"
          class="table__sr-caption"
        >
          {{ caption }}
        </caption>
        <thead class="table__head">
          <tr class="table__row table__row--head">
            <th
              v-for="column in columns"
              :key="column.key"
              class="table__cell table__cell--head"
              :class="[alignClass(column.align), column.headerClassName, { 'is-wrap': column.wrap }]"
              :style="columnStyle(column)"
              scope="col"
            >
              <span class="table__header-label">
                {{ column.label }}
              </span>
            </th>
          </tr>
        </thead>

        <tbody
          v-if="displayRows.length > 0"
          class="table__body"
        >
          <tr
            v-for="(row, rowIndex) in displayRows"
            :key="resolveRowKey(row, rowIndex)"
            class="table__row table__row--body"
            :class="{ 'is-clickable': rowClickable }"
            @click="onRowClick(row, rowIndex)"
          >
            <template
              v-for="column in columns"
              :key="column.key"
            >
              <component
                :is="column.rowHeader ? 'th' : 'td'"
                class="table__cell table__cell--body"
                :class="[
                  alignClass(column.align),
                  column.className,
                  { 'is-row-header': column.rowHeader, 'is-wrap': column.wrap }
                ]"
                :style="columnStyle(column)"
                :scope="column.rowHeader ? 'row' : undefined"
              >
                {{ formatValue(getValue(row, column), row, column, rowIndex) }}
              </component>
            </template>
          </tr>
        </tbody>

        <tbody
          v-else
          class="table__body"
        >
          <tr class="table__row table__row--empty">
            <td
              class="table__cell--empty"
              :colspan="colspan"
            >
              {{ emptyText }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type RowData = object
export type TableAlign = 'left' | 'center' | 'right'

export interface TableColumn {
  key: string
  label: string
  align?: TableAlign
  width?: string
  minWidth?: string
  rowHeader?: boolean
  wrap?: boolean
  className?: string
  headerClassName?: string
  formatter?: (value: unknown, row: RowData, column: TableColumn, rowIndex: number) => unknown
}

const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    data: RowData[]
    rowKey?: string | ((row: RowData, index: number) => string | number)
    caption?: string
    ariaLabel?: string
    emptyText?: string
    placeholderText?: string
    hoverable?: boolean
    bordered?: boolean
    compact?: boolean
    rowClickable?: boolean
  }>(),
  {
    rowKey: 'id',
    caption: '',
    ariaLabel: 'Data table',
    emptyText: '暂无数据',
    placeholderText: '',
    hoverable: true,
    bordered: true,
    compact: false,
    rowClickable: false
  }
)

const emit = defineEmits<{
  'row-click': [{ row: RowData; rowIndex: number }]
}>()

const colspan = computed(() => Math.max(props.columns.length, 1))

const tableClasses = computed(() => ({
  'is-bordered': props.bordered,
  'is-hoverable': props.hoverable,
  'is-compact': props.compact
}))

const displayRows = computed(() => props.data.slice())

function asRecord(row: RowData): Record<string, unknown> {
  return row as Record<string, unknown>
}

function resolveRowKey(row: RowData, index: number): string | number {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, index)
  }

  const key = props.rowKey
  const record = asRecord(row)
  const value = key ? record[key] : undefined
  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  return index
}

function getValue(row: RowData, column: TableColumn): unknown {
  return getValueByPath(row, column.key)
}

function formatValue(value: unknown, row: RowData, column: TableColumn, rowIndex: number): unknown {
  if (column.formatter) {
    return column.formatter(value, row, column, rowIndex)
  }
  if (value === null || value === undefined || value === '') {
    return props.placeholderText
  }
  return value
}

function getValueByPath(row: RowData, path: string): unknown {
  const record = asRecord(row)
  if (!path.includes('.')) {
    return record[path]
  }
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[segment]
    }
    return undefined
  }, record)
}

function onRowClick(row: RowData, rowIndex: number) {
  if (!props.rowClickable) return
  emit('row-click', { row, rowIndex })
}

function alignClass(align: TableAlign | undefined) {
  return align ? `is-align-${align}` : 'is-align-left'
}

function columnStyle(column: TableColumn) {
  const style: Record<string, string> = {}
  if (column.width) style.width = column.width
  if (column.minWidth) style.minWidth = column.minWidth
  return style
}

</script>

<style scoped>
.table {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  outline: 1px solid var(--borderColor-default, #d1d9e0);
  border-radius: 6px;
  background: var(--bgColor-default, #ffffff);
  color: var(--fgColor-default, #1f2328);
  overflow: hidden;
}

.table:not(.is-bordered) {
  border: none;
  border-radius: 0;
}


.table__container {
  width: 100%;
  overflow-x: auto;
  background: var(--bgColor-default, #ffffff);
}

.table__table {
  width: 100%;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
}

.table__sr-caption {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.table__head {
  background: var(--bgColor-muted, #f6f8fa);
}

.table__cell {
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--borderColor-default, #d1d9e0);
  vertical-align: middle;
  background-clip: padding-box;
  white-space: nowrap;
}

.table__cell.is-wrap {
  white-space: normal;
  overflow-wrap: break-word;
}

.table__cell--head {
  font-weight: 600;
  color: var(--fgColor-default, #1f2328);
  background: var(--bgColor-muted, #f6f8fa);
  position: relative;
}

.table__row--body:last-child .table__cell {
  border-bottom: none;
}

.table.is-hoverable .table__row--body:hover {
  background: var(--bgColor-muted, #f6f8fa);
}

.table__row.is-clickable {
  cursor: pointer;
}

.table__row.is-clickable:active {
  background: var(--bgColor-muted, #f6f8fa);
}

.table__cell--empty {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--fgColor-muted, #59636e);
  font-weight: 500;
}


.table.is-compact .table__cell {
  padding: 0.6rem 0.75rem;
  font-size: 0.8125rem;
}

.table__header-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  white-space: inherit;
}

.is-row-header {
  font-weight: 600;
  color: var(--fgColor-default, #1f2328);
}

.is-align-left {
  text-align: left;
}

.is-align-center {
  text-align: center;
}

.is-align-right {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .table__cell {
    padding: 0.65rem 0.85rem;
  }
}
</style>
