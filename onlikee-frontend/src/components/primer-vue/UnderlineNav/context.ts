import type { Component, InjectionKey, VNode } from 'vue'

export type UnderlineNavBreakpoint = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'
export type UnderlineNavCurrent =
  'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false' | boolean

export interface UnderlineNavEntry {
  id: string
  element: HTMLLIElement | null
  as: string | Component
  attrs: Record<string, unknown>
  href: string | undefined
  target: string | undefined
  rel: string | undefined
  current: UnderlineNavCurrent | undefined
  counter: number | string | undefined
  label: () => VNode[]
  select: (event: MouseEvent | KeyboardEvent) => void
}

export interface UnderlineNavContext {
  loadingCounters: () => boolean
  isOverflowing: (id: string) => boolean
  register: (entry: UnderlineNavEntry) => void
  unregister: (id: string) => void
}

export const underlineNavKey: InjectionKey<UnderlineNavContext> = Symbol('UnderlineNav')
