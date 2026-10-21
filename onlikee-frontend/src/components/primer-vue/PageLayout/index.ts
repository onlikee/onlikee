import Root from './PageLayout.vue'
import Header from './PageLayoutHeader.vue'
import Content from './PageLayoutContent.vue'
import Pane from './PageLayoutPane.vue'
import Sidebar from './PageLayoutSidebar.vue'
import Footer from './PageLayoutFooter.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { PageLayoutPaneProps, PageLayoutSidebarProps, PageLayoutPaneInstance } from './types'

type PaneComponent = {
  new (): Omit<InstanceType<typeof Pane>, '$props'> &
    PageLayoutPaneInstance & {
      $props: PageLayoutPaneProps & AllowedComponentProps & VNodeProps
    }
}
type SidebarComponent = {
  new (): Omit<InstanceType<typeof Sidebar>, '$props'> &
    PageLayoutPaneInstance & {
      $props: PageLayoutSidebarProps & AllowedComponentProps & VNodeProps
    }
}
export const PageLayoutHeader = Object.assign(Header, { __SLOT__: Symbol('PageLayout.Header') })
export const PageLayoutContent = Object.assign(Content, { __SLOT__: Symbol('PageLayout.Content') })
export const PageLayoutPane = Object.assign(Pane as unknown as PaneComponent, {
  __SLOT__: Symbol('PageLayout.Pane'),
})
export const PageLayoutSidebar = Object.assign(Sidebar as unknown as SidebarComponent, {
  __SLOT__: Symbol('PageLayout.Sidebar'),
})
export const PageLayoutFooter = Object.assign(Footer, { __SLOT__: Symbol('PageLayout.Footer') })
export const PageLayout = Object.assign(Root, {
  Header: PageLayoutHeader,
  Content: PageLayoutContent,
  Pane: PageLayoutPane,
  Sidebar: PageLayoutSidebar,
  Footer: PageLayoutFooter,
})
export type {
  PageLayoutProps,
  PageLayoutHeaderProps,
  PageLayoutContentProps,
  PageLayoutPaneProps,
  PageLayoutPaneBaseProps,
  PageLayoutSidebarProps,
  PageLayoutSidebarBaseProps,
  PageLayoutFooterProps,
  PageLayoutPaneInstance,
  ResponsiveValue,
  PaneWidth,
  PaneWidthValue,
  CustomWidthOptions,
} from './types'
export default PageLayout
