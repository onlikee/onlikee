<script setup lang="ts">
import { computed, ref, watch, type HTMLAttributes } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@onlikee/octicons-vue'
import { VisuallyHidden } from '../VisuallyHidden'
import AriaStatus from '../internal/components/AriaStatus.vue'
import { buildPaginationModel } from './paginationModel'
import classes from './Pagination.module.css'
export interface PaginationState {
  pageIndex: number
}
export interface PaginationProps extends /* @vue-ignore */ Omit<HTMLAttributes, 'onChange'> {
  // eslint-disable-next-line vue/prop-name-casing -- Preserve the native accessible landmark API.
  'aria-label': string
  ariaLabel?: string
  defaultPageIndex?: number
  id?: string
  pageSize?: number
  showPages?: boolean | { narrow?: boolean; regular?: boolean; wide?: boolean }
  totalCount: number
  onChange?: (state: PaginationState) => void
}
const props = withDefaults(defineProps<PaginationProps>(), {
  pageSize: 25,
  showPages: () => ({ narrow: false }),
  ariaLabel: undefined,
  defaultPageIndex: undefined,
  id: undefined,
  onChange: undefined,
})
const emit = defineEmits<{ change: [state: PaginationState] }>()
const pageCount = computed(() => Math.ceil(props.totalCount / props.pageSize))
const isValid = (index: number | undefined): index is number =>
  index !== undefined && index >= 0 && index < pageCount.value
if (
  props.defaultPageIndex !== undefined &&
  !isValid(props.defaultPageIndex) &&
  import.meta.env.DEV
) {
  console.warn(
    `<Pagination> expected defaultPageIndex to be less than the total number of pages. Instead, received a defaultPageIndex of ${props.defaultPageIndex} with ${pageCount.value} total pages.`,
  )
}
const defaultIndex = ref(isValid(props.defaultPageIndex) ? props.defaultPageIndex : 0)
const pageIndex = ref(defaultIndex.value)
watch(
  [() => props.defaultPageIndex, pageCount],
  ([index]) => {
    if (isValid(index) && defaultIndex.value !== index) {
      defaultIndex.value = index
      pageIndex.value = index
      emit('change', { pageIndex: index })
    }
  },
  { flush: 'sync' },
)
const pageStart = computed(() => pageIndex.value * props.pageSize)
const pageEnd = computed(() => Math.min((pageIndex.value + 1) * props.pageSize, props.totalCount))
const hasPreviousPage = computed(() => pageIndex.value > 0)
const hasNextPage = computed(() => pageIndex.value + 1 < pageCount.value)
const model = computed(() =>
  buildPaginationModel(pageCount.value, pageIndex.value + 1, !!props.showPages).filter(
    (page) => page.type === 'NUM' || page.type === 'BREAK',
  ),
)
const hiddenRanges = computed(() => {
  if (typeof props.showPages === 'boolean') return props.showPages ? '' : 'narrow regular wide'
  return Object.entries(props.showPages)
    .filter(([, show]) => !show)
    .map(([range]) => range)
    .join(' ')
})
function selectPage(index: number) {
  if (index !== pageIndex.value) {
    pageIndex.value = index
    emit('change', { pageIndex: index })
  }
}
</script>
<template>
  <nav
    :id="id"
    :aria-label="ariaLabel"
    :class="['TablePagination', classes.TablePagination]"
    data-component="Table.Pagination"
  >
    <VisuallyHidden
      ><AriaStatus
        >Showing {{ pageStart + 1 }} through {{ pageEnd }} of {{ totalCount }}</AriaStatus
      ></VisuallyHidden
    >
    <p
      :class="['TablePaginationRange', classes.TablePaginationRange]"
      data-component="Table.Pagination.Range"
    >
      {{ pageStart + 1 }}<VisuallyHidden>&nbsp;through&nbsp;</VisuallyHidden
      ><span aria-hidden="true">‒</span>{{ pageEnd }} of {{ totalCount }}
    </p>
    <ol
      :class="['TablePaginationSteps', classes.TablePaginationSteps]"
      :data-hidden-viewport-ranges="hiddenRanges"
    >
      <li
        :class="['TablePaginationStep', classes.TablePaginationStep]"
        data-component="Table.Pagination.Step"
      >
        <button
          type="button"
          :class="['TablePaginationAction', classes.TablePaginationAction]"
          :data-has-page="hasPreviousPage ? true : undefined"
          :aria-disabled="!hasPreviousPage ? true : undefined"
          data-component="Table.Pagination.PreviousPageButton"
          @click="hasPreviousPage && selectPage(pageIndex - 1)"
        >
          <ChevronLeftIcon v-if="hasPreviousPage" aria-hidden="true" /><span>Previous</span
          ><VisuallyHidden>&nbsp;page</VisuallyHidden>
        </button>
      </li>
      <template v-for="(page, index) in model" :key="index">
        <li
          v-if="page.type === 'BREAK'"
          aria-hidden="true"
          :class="['TablePaginationTruncationStep', classes.TablePaginationTruncationStep]"
          data-component="Table.Pagination.TruncationStep"
        >
          …
        </li>
        <li
          v-else
          :class="['TablePaginationStep', classes.TablePaginationStep]"
          data-component="Table.Pagination.Step"
        >
          <button
            type="button"
            :class="['TablePaginationPage', classes.TablePaginationPage]"
            :data-active="page.selected ? true : undefined"
            :aria-current="page.selected ? true : undefined"
            data-component="Table.Pagination.Page"
            @click="selectPage(page.num - 1)"
          >
            <VisuallyHidden>Page&nbsp;</VisuallyHidden>{{ page.num
            }}<VisuallyHidden v-if="page.precedesBreak">…</VisuallyHidden>
          </button>
        </li>
      </template>
      <li
        :class="['TablePaginationStep', classes.TablePaginationStep]"
        data-component="Table.Pagination.Step"
      >
        <button
          type="button"
          :class="['TablePaginationAction', classes.TablePaginationAction]"
          :data-has-page="hasNextPage ? true : undefined"
          :aria-disabled="!hasNextPage ? true : undefined"
          data-component="Table.Pagination.NextPageButton"
          @click="hasNextPage && selectPage(pageIndex + 1)"
        >
          <span>Next</span><VisuallyHidden>&nbsp;page</VisuallyHidden
          ><ChevronRightIcon v-if="hasNextPage" aria-hidden="true" />
        </button>
      </li>
    </ol>
  </nav>
</template>
