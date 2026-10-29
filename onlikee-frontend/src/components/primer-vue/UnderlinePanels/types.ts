import type { Component, HTMLAttributes, ButtonHTMLAttributes } from 'vue'

export interface UnderlinePanelsProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  value?: string
  defaultValue?: string
  onChange?: (selection: { value: string }) => void
  activationMode?: 'automatic' | 'manual'
  id?: string
  loadingCounters?: boolean
  className?: string
  as?: string | Component
}
export type UnderlinePanelsTabProps = {
  value?: string
  counter?: number | string
  icon?: Component
  className?: string
  'aria-selected'?: boolean
  onSelect?: (event: MouseEvent | KeyboardEvent) => void
} & Omit<ButtonHTMLAttributes, 'value' | 'onSelect'>
export type UnderlinePanelsPanelProps = { value?: string; className?: string } & HTMLAttributes
export type UnderlinePanelsPanelComponentProps = {
  value?: string
  className?: string
} & /* @vue-ignore */ HTMLAttributes
