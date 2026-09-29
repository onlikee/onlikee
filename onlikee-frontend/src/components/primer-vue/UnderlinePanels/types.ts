import type { Component } from 'vue'

export interface UnderlinePanelsProps {
  value?: string
  defaultValue?: string
  activationMode?: 'automatic' | 'manual'
  id?: string
  loadingCounters?: boolean
  as?: string
}

export interface UnderlinePanelsTabProps {
  value?: string
  counter?: number | string
  leadingVisual?: Component
  disabled?: boolean
}

export interface UnderlinePanelsPanelProps {
  value?: string
}
