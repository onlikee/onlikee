import { inject, shallowRef, type InjectionKey, type Ref } from 'vue'
import type { Spacing } from './types'

export interface PageLayoutContext {
  padding: Ref<Spacing>
  rowGap: Ref<Spacing>
  columnGap: Ref<Spacing>
  paneRef: Ref<HTMLDivElement | null>
  contentWrapperRef: Ref<HTMLElement | null>
  sidebarRef: Ref<HTMLDivElement | null>
  sidebarContentWrapperRef: Ref<HTMLDivElement | null>
}
export const pageLayoutContextKey: InjectionKey<PageLayoutContext> = Symbol('PageLayout')
export function usePageLayoutContext(): PageLayoutContext {
  return (
    inject(pageLayoutContextKey, null) ?? {
      padding: shallowRef('normal'),
      rowGap: shallowRef('normal'),
      columnGap: shallowRef('normal'),
      paneRef: shallowRef(null),
      contentWrapperRef: shallowRef(null),
      sidebarRef: shallowRef(null),
      sidebarContentWrapperRef: shallowRef(null),
    }
  )
}
