import type { Component, HTMLAttributes, VNodeChild } from 'vue'
import type { ButtonProps } from '../Button'
import type { NodeProp } from '../internal/renderNode'

type NativeAttributes = {
  [Key in keyof HTMLAttributes as string extends Key ? never : Key]: HTMLAttributes[Key]
}

export type BannerVariant = 'critical' | 'info' | 'success' | 'upsell' | 'warning'

interface BannerOptions {
  className?: string
  description?: VNodeChild
  hideTitle?: boolean
  /** @deprecated Use leadingVisual instead. */
  icon?: NodeProp
  leadingVisual?: NodeProp
  onDismiss?: () => void
  primaryAction?: VNodeChild
  secondaryAction?: VNodeChild
  title?: VNodeChild
  variant?: BannerVariant
  layout?: 'default' | 'compact'
  actionsLayout?: 'inline' | 'stacked' | 'default'
  flush?: boolean
}

export type BannerProps = BannerOptions & Omit<NativeAttributes, keyof BannerOptions>
export type BannerComponentProps = BannerOptions &
  /* @vue-ignore */ Omit<NativeAttributes, keyof BannerOptions>

export type BannerHeadingElement = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type BannerTitleProps<As extends BannerHeadingElement = 'h2'> = {
  as?: As
  className?: string
} & NativeAttributes
export type BannerTitleComponentProps<As extends BannerHeadingElement = 'h2'> = {
  as?: As
  className?: string
} & /* @vue-ignore */ NativeAttributes

export type BannerDescriptionProps = { className?: string } & NativeAttributes
export type BannerPrimaryActionProps<As extends string | Component = 'button'> = Omit<
  ButtonProps<As>,
  'variant'
>
export type BannerSecondaryActionProps<As extends string | Component = 'button'> =
  BannerPrimaryActionProps<As>

export interface BannerInstance {
  element: HTMLElement | null
}
