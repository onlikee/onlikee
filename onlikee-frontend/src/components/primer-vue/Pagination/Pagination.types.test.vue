<script setup lang="ts">
import { h } from 'vue'
import { Pagination, type PaginationProps, type PageProps } from './index'

const native: PaginationProps = {
  currentPage: 1,
  pageCount: 15,
  className: 'pagination',
  class: { selected: true },
  style: { marginTop: 12 },
  id: 'pages',
  'aria-label': 'Issue pages',
  'data-component': 'CustomPagination',
  showPages: { narrow: false, regular: true, wide: false },
  onPageChange: (event: MouseEvent, page: number) => {
    event.preventDefault()
    console.log(page)
  },
}
function renderPage({ key, number, className, children, ...props }: PageProps) {
  return h('a', { key, class: className, 'data-page': number, ...props }, [children])
}
// @ts-expect-error Pagination has no system style props.
const system: PaginationProps = { currentPage: 1, pageCount: 2, backgroundColor: 'red' }
// @ts-expect-error Pagination has no root polymorphism API.
const polymorphic: PaginationProps = { currentPage: 1, pageCount: 2, as: 'div' }
// @ts-expect-error The source uses one-based currentPage, not pageIndex.
const pageIndex: PaginationProps = { pageIndex: 0, pageCount: 2 }
// @ts-expect-error Only the source viewport ranges are supported.
const viewport: PaginationProps = { currentPage: 1, pageCount: 2, showPages: { small: false } }
// @ts-expect-error The renderPage type does not expose the internal as property.
const internal: PageProps['as'] = 'a'
void system
void polymorphic
void pageIndex
void viewport
void internal
</script>

<template>
  <Pagination :current-page="1" :page-count="2" />
  <Pagination v-bind="native" :render-page="renderPage" />
  <Pagination
    :current-page="1"
    :page-count="2"
    @page-change="
      (event, page) => {
        event.preventDefault()
        console.log(page)
      }
    "
  />
  <!-- @vue-expect-error currentPage is required. -->
  <Pagination :page-count="2" />
  <!-- @vue-expect-error showPages must be a boolean or a source responsive value. -->
  <Pagination :current-page="1" :page-count="2" show-pages="false" />
</template>
