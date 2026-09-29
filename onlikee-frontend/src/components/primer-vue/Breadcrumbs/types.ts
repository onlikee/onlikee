import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

export interface BreadcrumbsProps {
  overflow?: 'wrap' | 'menu' | 'menu-with-root'
  variant?: 'normal' | 'spacious'
}

export interface BreadcrumbsItemProps {
  as?: string | Component
  to?: RouteLocationRaw
  selected?: boolean
}
