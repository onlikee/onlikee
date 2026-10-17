<script lang="ts">
import type { Column, DataTableProps } from '@/components/primer-vue/DataTable'

/** Shared row shape for component property, event, and slot reference tables. */
export interface DocumentationRow {
  id: string
  name: string
  type?: string
  default?: string
  description?: string
  options?: string
  component?: string
  signature?: string
  payload?: string
  publicProps?: string
  params?: string
  slot?: string
}

export type DocumentationColumn = Column<DocumentationRow>
</script>

<script setup lang="ts">
import { DataTable } from '@/components/primer-vue/DataTable'

const props = withDefaults(defineProps<DataTableProps<DocumentationRow>>(), {
  cellPadding: 'condensed',
})
</script>

<template>
  <DataTable v-bind="props" />
</template>
