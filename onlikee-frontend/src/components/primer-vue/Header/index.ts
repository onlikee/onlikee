import HeaderRoot from './Header.vue'
import HeaderItemComponent from './HeaderItem.vue'
import HeaderLinkComponent from './HeaderLink.vue'
import type { AllowedComponentProps, Component, NativeElements, VNodeProps } from 'vue'
import type { HeaderComponentProps, HeaderItemProps, HeaderLinkComponentProps } from './types'

export const HeaderItem = HeaderItemComponent as new () => Omit<
  InstanceType<typeof HeaderItemComponent>,
  '$props'
> & {
  $props: HeaderItemProps & VNodeProps & AllowedComponentProps
}

export const HeaderLink = HeaderLinkComponent as <
  As extends keyof NativeElements | Component = 'a',
>(
  props: HeaderLinkComponentProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof HeaderLinkComponent<As>>

const HeaderComponent = HeaderRoot as <As extends keyof NativeElements | Component = 'header'>(
  props: HeaderComponentProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof HeaderRoot<As>>

export const Header = Object.assign(HeaderComponent, { Link: HeaderLink, Item: HeaderItem })
export default Header
export type {
  HeaderProps,
  HeaderItemProps,
  HeaderLinkProps,
  HeaderInstance,
  HeaderItemInstance,
  HeaderLinkInstance,
} from './types'
