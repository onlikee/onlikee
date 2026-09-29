import BreadcrumbsRoot from './Breadcrumbs.vue'
import BreadcrumbsItem from './BreadcrumbsItem.vue'

export const Breadcrumbs = Object.assign(BreadcrumbsRoot, { Item: BreadcrumbsItem })
export { BreadcrumbsItem }
export type { BreadcrumbsProps, BreadcrumbsItemProps } from './types'
