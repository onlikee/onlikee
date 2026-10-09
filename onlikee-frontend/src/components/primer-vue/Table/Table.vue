<template>
  <div :class="[$style['table'], tableClasses]">
    <div :class="$style['table__container']">
      <table :class="$style['table__table']" :aria-label="ariaLabel">
        <caption v-if="caption" :class="$style['table__sr-caption']">
          {{
            caption
          }}
        </caption>
        <thead :class="$style['table__head']">
          <tr :class="$style['table__row']">
            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                $style['table__cell'],
                $style['table__cell--head'],
                alignClass(column.align),
                column.headerClassName,
                { [$style['is-wrap']]: column.wrap },
              ]"
              :style="columnStyle(column)"
              scope="col"
            >
              <span :class="$style['table__header-label']">
                {{ column.label }}
              </span>
            </th>
          </tr>
        </thead>

        <tbody v-if="displayRows.length > 0">
          <tr
            v-for="(row, rowIndex) in displayRows"
            :key="resolveRowKey(row, rowIndex)"
            :class="[
              $style['table__row'],
              $style['table__row--body'],
              { [$style['is-clickable']]: rowClickable },
            ]"
            @click="onRowClick(row, rowIndex)"
          >
            <template v-for="column in columns" :key="column.key">
              <component
                :is="column.rowHeader ? 'th' : 'td'"
                :class="[
                  $style['table__cell'],
                  alignClass(column.align),
                  column.className,
                  { [$style['is-row-header']]: column.rowHeader, [$style['is-wrap']]: column.wrap },
                ]"
                :style="columnStyle(column)"
                :scope="column.rowHeader ? 'row' : undefined"
              >
                {{ formatValue(getValue(row, column), row, column, rowIndex) }}
              </component>
            </template>
          </tr>
        </tbody>

        <tbody v-else>
          <tr :class="$style['table__row']">
            <td :class="$style['table__cell--empty']" :colspan="colspan">
              {{ emptyText }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'

const styles = useCssModule()

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
    rowClickable: false,
  },
)

const emit = defineEmits<{
  'row-click': [{ row: RowData; rowIndex: number }]
}>()

const colspan = computed(() => Math.max(props.columns.length, 1))

const tableClasses = computed(() => ({
  [styles['is-bordered']]: props.bordered,
  [styles['is-hoverable']]: props.hoverable,
  [styles['is-compact']]: props.compact,
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
  return align ? styles[`is-align-${align}`] : styles['is-align-left']
}

function columnStyle(column: TableColumn) {
  const style: Record<string, string> = {}
  if (column.width) style.width = column.width
  if (column.minWidth) style.minWidth = column.minWidth
  return style
}
</script>
<style module src="./Table.module.css" />
