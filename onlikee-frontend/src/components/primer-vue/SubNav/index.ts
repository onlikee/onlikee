import SubNavRoot from './SubNav.vue'
import LinksRoot from './SubNavLinks.vue'
import LinkRoot from './SubNavLink.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { SubNavProps, SubNavLinksProps, SubNavLinkProps } from './types'

const Root = SubNavRoot as unknown as {
  new (): Omit<InstanceType<typeof SubNavRoot>, '$props'> & {
    $props: SubNavProps & AllowedComponentProps & VNodeProps
  }
}
export const SubNavLinks = LinksRoot as unknown as {
  new (): Omit<InstanceType<typeof LinksRoot>, '$props'> & {
    $props: SubNavLinksProps & AllowedComponentProps & VNodeProps
  }
}
export const SubNavLink = LinkRoot as unknown as {
  new (): Omit<InstanceType<typeof LinkRoot>, '$props'> & {
    $props: SubNavLinkProps & AllowedComponentProps & VNodeProps
  }
}
export const SubNav = Object.assign(Root, { Links: SubNavLinks, Link: SubNavLink })
export default SubNav
export type { SubNavProps, SubNavLinksProps, SubNavLinkProps } from './types'
