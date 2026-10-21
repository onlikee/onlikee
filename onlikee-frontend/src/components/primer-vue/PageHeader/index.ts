import Root from './PageHeader.vue'
import ContextArea from './PageHeaderContextArea.vue'
import ParentLinkRoot from './PageHeaderParentLink.vue'
import ContextBar from './PageHeaderContextBar.vue'
import TitleArea from './PageHeaderTitleArea.vue'
import ContextAreaActions from './PageHeaderContextAreaActions.vue'
import LeadingAction from './PageHeaderLeadingAction.vue'
import Breadcrumbs from './PageHeaderBreadcrumbs.vue'
import LeadingVisual from './PageHeaderLeadingVisual.vue'
import Title from './PageHeaderTitle.vue'
import TrailingVisual from './PageHeaderTrailingVisual.vue'
import TrailingAction from './PageHeaderTrailingAction.vue'
import Actions from './PageHeaderActions.vue'
import Description from './PageHeaderDescription.vue'
import Navigation from './PageHeaderNavigation.vue'
import type { AllowedComponentProps, Component, NativeElements, VNodeProps } from 'vue'
import type { ParentLinkComponentProps } from './types'

const ParentLink = ParentLinkRoot as <As extends keyof NativeElements | Component = 'a'>(
  props: ParentLinkComponentProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof ParentLinkRoot<As>>

export const PageHeader = Object.assign(Root, {
  ContextArea,
  ParentLink,
  ContextBar,
  TitleArea,
  ContextAreaActions,
  LeadingAction,
  Breadcrumbs,
  LeadingVisual,
  Title,
  TrailingVisual,
  TrailingAction,
  Actions,
  Description,
  Navigation,
})
export {
  ContextArea as PageHeaderContextArea,
  ParentLink as PageHeaderParentLink,
  ContextBar as PageHeaderContextBar,
  TitleArea as PageHeaderTitleArea,
  ContextAreaActions as PageHeaderContextAreaActions,
  LeadingAction as PageHeaderLeadingAction,
  Breadcrumbs as PageHeaderBreadcrumbs,
  LeadingVisual as PageHeaderLeadingVisual,
  Title as PageHeaderTitle,
  TrailingVisual as PageHeaderTrailingVisual,
  TrailingAction as PageHeaderTrailingAction,
  Actions as PageHeaderActions,
  Description as PageHeaderDescription,
  Navigation as PageHeaderNavigation,
}
export default PageHeader
export type {
  PageHeaderProps,
  ChildrenPropTypes,
  ParentLinkProps,
  TitleAreaProps,
  TitleProps,
  ActionsProps,
  NavigationProps,
  ResponsiveValue,
  PageHeaderInstance,
  TitleAreaInstance,
  ParentLinkInstance,
} from './types'
