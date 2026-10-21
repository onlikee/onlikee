<script setup lang="ts">
import { computed, h, useAttrs, useCssModule } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@onlikee/octicons-vue'
import { buildComponentData, buildPaginationModel } from './model'
import { normalizeReactStyle } from '../internal/style'
import type { PaginationComponentProps } from './types'

defineOptions({ name: 'Pagination', inheritAttrs: false })
const props = withDefaults(defineProps<PaginationComponentProps>(), {
  hrefBuilder: (page: number) => `#${page}`,
  marginPageCount: 1,
  showPages: true,
  surroundingPageCount: 2,
})
defineSlots<Record<never, never>>()
const emit = defineEmits<{ pageChange: [event: MouseEvent, page: number] }>()
const attrs = useAttrs()
const classes = useCssModule()
const model = computed(() =>
  buildPaginationModel(
    props.pageCount,
    props.currentPage,
    !!props.showPages,
    props.marginPageCount,
    props.surroundingPageCount,
  ),
)
const hiddenRanges = computed(() => {
  const showPages = props.showPages
  if (typeof showPages === 'object') {
    return Object.keys(showPages)
      .filter((range) => !showPages[range as keyof typeof showPages])
      .join(' ')
  }
  return showPages ? '' : 'narrow regular wide'
})

const Render = () => {
  const { class: classValue, ...rest } = attrs
  return h(
    'nav',
    {
      class: [classes.PaginationContainer, props.className, classValue],
      'aria-label': 'Pagination',
      'data-component': 'Pagination',
      ...rest,
      style: normalizeReactStyle(attrs.style),
    },
    [
      h(
        'div',
        { class: classes.TablePaginationSteps, 'data-hidden-viewport-ranges': hiddenRanges.value },
        model.value.map((page) => {
          const {
            props: pageProps,
            key,
            content,
          } = buildComponentData(page, props.hrefBuilder, (event) =>
            emit('pageChange', event, page.num),
          )
          const children = [
            ...(key === 'page-prev'
              ? [h(ChevronLeftIcon, { 'data-component': 'Pagination.PreviousPageIcon' })]
              : []),
            content,
            ...(key === 'page-next'
              ? [h(ChevronRightIcon, { 'data-component': 'Pagination.NextPageIcon' })]
              : []),
          ]
          if (props.renderPage && pageProps.as !== 'span') {
            return props.renderPage({
              key,
              children,
              number: page.num,
              className: classes.Page!,
              'data-component': 'Pagination.Page',
              ...pageProps,
            })
          }
          const dataComponent =
            pageProps.rel === 'prev'
              ? 'Pagination.PreviousPage'
              : pageProps.rel === 'next'
                ? 'Pagination.NextPage'
                : 'Pagination.Page'
          return h(
            pageProps.as || 'a',
            { key, class: classes.Page, 'data-component': dataComponent, ...pageProps },
            children,
          )
        }),
      ),
    ],
  )
}
</script>

<template>
  <Render />
</template>

<style module src="./Pagination.module.css" />
