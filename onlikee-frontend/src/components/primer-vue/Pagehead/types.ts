import type { Component, HTMLAttributes, NativeElements } from 'vue'

export interface PageheadOptions {
  as?: keyof NativeElements | Component
  className?: string
}

/** @deprecated */
export type PageheadProps = PageheadOptions & HTMLAttributes & { 'data-component'?: string }
