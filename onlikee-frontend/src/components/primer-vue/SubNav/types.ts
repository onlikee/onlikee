import type { AnchorHTMLAttributes, HTMLAttributes, VNodeChild } from 'vue'

export interface SubNavOptions {
  actions?: VNodeChild
  align?: 'right'
  full?: boolean
  label?: string
  className?: string
}
export type SubNavProps = SubNavOptions & HTMLAttributes
export interface SubNavLinksOptions {
  className?: string
}
export type SubNavLinksProps = SubNavLinksOptions & HTMLAttributes
export interface SubNavLinkOptions {
  className?: string
  selected?: boolean
  to?: string | { pathname?: string; search?: string; hash?: string }
}
export type SubNavLinkProps = SubNavLinkOptions & AnchorHTMLAttributes
