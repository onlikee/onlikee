import ButtonComponent from './Button.vue'
import ButtonBaseComponent from './ButtonBase.vue'
import IconButtonComponent from './IconButton.vue'
import LinkButtonComponent from './LinkButton.vue'
import type {
  AnchorHTMLAttributes,
  AllowedComponentProps,
  ButtonHTMLAttributes,
  Component,
  HTMLAttributes,
  VNodeProps,
} from 'vue'
import type {
  ButtonBaseOptions,
  ButtonOptions,
  LinkButtonOwnOptions,
  IconButtonOwnProps,
  PolymorphicProps,
} from './types'

type ComponentConstructor = abstract new (...args: never[]) => object
type SlotMetadata<Sfc> = Sfc extends { __SLOT__: infer Slot } ? { __SLOT__: Slot } : unknown
type PropsWithoutAs<OwnProps> = OwnProps extends unknown ? Omit<OwnProps, 'as'> : never
type RemoveIndexSignature<T> = {
  [
    K in keyof T as string extends K
      ? never
      : number extends K
        ? never
        : symbol extends K
          ? never
          : K
  ]: T[K]
}
type AttributesNotSupportedByRoot<DefaultAs extends 'button' | 'a'> = DefaultAs extends 'button'
  ? Partial<Record<Exclude<keyof AnchorHTMLAttributes, keyof ButtonHTMLAttributes>, never>>
  : unknown
type ComponentProps<DefaultAs extends 'button' | 'a', OwnProps> =
  | (PolymorphicProps<DefaultAs, OwnProps> &
      AttributesNotSupportedByRoot<DefaultAs> &
      VNodeProps &
      AllowedComponentProps)
  | (PolymorphicProps<DefaultAs extends 'button' ? 'a' : 'button', OwnProps> & {
      as: DefaultAs extends 'button' ? 'a' : 'button'
    } & VNodeProps &
      AllowedComponentProps)
  | (PropsWithoutAs<OwnProps> & { as?: string } & AttributesNotSupportedByRoot<DefaultAs> &
      RemoveIndexSignature<HTMLAttributes> &
      VNodeProps &
      AllowedComponentProps)
  | (PropsWithoutAs<OwnProps> & { as: Component } & HTMLAttributes &
      VNodeProps &
      AllowedComponentProps)
type PolymorphicComponent<
  Sfc extends ComponentConstructor,
  DefaultAs extends 'button' | 'a',
  OwnProps,
> = SlotMetadata<Sfc> & {
  new (): Omit<InstanceType<Sfc>, '$props'> & {
    $props: ComponentProps<DefaultAs, OwnProps>
  }
}

export const Button = ButtonComponent as unknown as PolymorphicComponent<
  typeof ButtonComponent,
  'button',
  ButtonOptions
> & { __SLOT__: symbol }
export const ButtonBase = ButtonBaseComponent as unknown as PolymorphicComponent<
  typeof ButtonBaseComponent,
  'button',
  ButtonBaseOptions
>
export const IconButton = IconButtonComponent as unknown as PolymorphicComponent<
  typeof IconButtonComponent,
  'button',
  IconButtonOwnProps
>
export const LinkButton = LinkButtonComponent as unknown as PolymorphicComponent<
  typeof LinkButtonComponent,
  'a',
  LinkButtonOwnOptions
>

export type { ButtonBaseProps, ButtonProps, IconButtonProps, LinkButtonProps } from './types'
