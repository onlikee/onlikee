import type { ButtonHTMLAttributes, HTMLAttributes } from 'vue'

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

export interface BlankslateElementComponentProps extends /* @vue-ignore */ HTMLAttributes {
  className?: string
}
export interface BlankslateComponentProps extends BlankslateElementComponentProps {
  border?: boolean
  narrow?: boolean
  spacious?: boolean
  size?: 'small' | 'medium' | 'large'
}
export interface BlankslateHeadingComponentProps extends BlankslateElementComponentProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export type BlankslateProps = RemoveIndexSignature<BlankslateComponentProps>
export type BlankslateVisualProps = RemoveIndexSignature<BlankslateElementComponentProps>
export type BlankslateHeadingProps = RemoveIndexSignature<BlankslateHeadingComponentProps>
export type BlankslateDescriptionProps = RemoveIndexSignature<BlankslateElementComponentProps>
export type BlankslatePrimaryActionProps =
  | (RemoveIndexSignature<ButtonHTMLAttributes> & { href?: never; className?: string })
  | ({ href: string } & Partial<
      Record<keyof RemoveIndexSignature<ButtonHTMLAttributes> | 'className', never>
    >)
export type BlankslateSecondaryActionProps = { href: string }
