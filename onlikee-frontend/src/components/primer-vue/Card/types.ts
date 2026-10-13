import type { Component, HTMLAttributes, ImgHTMLAttributes } from 'vue'

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

export interface CardElementComponentProps extends /* @vue-ignore */ HTMLAttributes {
  className?: string
}

export interface CardComponentProps extends CardElementComponentProps {
  as?: 'div' | 'section'
  padding?: 'none' | 'condensed' | 'normal'
  borderRadius?: 'medium' | 'large'
  layout?: 'default' | 'compact'
}

export interface CardHeadingComponentProps extends CardElementComponentProps {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  id?: string
}

export interface CardImageComponentProps extends /* @vue-ignore */ ImgHTMLAttributes {
  src: string
  alt?: string
  className?: string
}

export interface CardIconProps {
  icon: Component | string
  'aria-label'?: string
  className?: string
}

export type CardProps = RemoveIndexSignature<CardComponentProps>
export type CardHeadingProps = RemoveIndexSignature<CardHeadingComponentProps>
export type CardDescriptionProps = RemoveIndexSignature<CardElementComponentProps>
export type CardMetadataProps = RemoveIndexSignature<CardElementComponentProps>
export type CardImageProps = RemoveIndexSignature<CardImageComponentProps>
export type CardActionProps = Record<string, never>

/** Vue component refs expose the DOM node through element. */
export interface CardInstance {
  element: HTMLElement | null
}
