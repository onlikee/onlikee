import type { HTMLAttributes, VNodeChild } from 'vue'
import type { PageDataProps } from './model'

export type PageProps = {
  key: string
  children: VNodeChild
  number: number
  className: string
  'data-component': 'Pagination.Page'
} & Omit<PageDataProps['props'], 'as' | 'role'>

interface PaginationOptions {
  className?: string
  pageCount: number
  currentPage: number
  onPageChange?: (event: MouseEvent, page: number) => void
  hrefBuilder?: (page: number) => string
  marginPageCount?: number
  showPages?: boolean | { narrow?: boolean; regular?: boolean; wide?: boolean }
  surroundingPageCount?: number
  renderPage?: (props: PageProps) => VNodeChild
}

type NativeAttributes = {
  [Key in keyof HTMLAttributes as string extends Key ? never : Key]: HTMLAttributes[Key]
}

export type PaginationProps = PaginationOptions & NativeAttributes & { 'data-component'?: string }

export type PaginationComponentProps = PaginationOptions &
  /* @vue-ignore */ Omit<PaginationProps, keyof PaginationOptions>
