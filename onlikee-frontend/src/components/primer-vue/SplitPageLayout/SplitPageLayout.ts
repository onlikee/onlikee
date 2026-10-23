/* eslint-disable vue/one-component-per-file -- Compound wrappers share PageLayout slot markers. */
import {
  defineComponent,
  h,
  type AllowedComponentProps,
  type Component,
  type VNodeProps,
} from 'vue'
import { PageLayout } from '../PageLayout'
import type { WithSlotMarker } from '../composables/useSlots'
import type {
  SplitPageLayoutProps,
  SplitPageLayoutHeaderProps,
  SplitPageLayoutContentProps,
  SplitPageLayoutPaneProps,
  SplitPageLayoutSidebarProps,
  SplitPageLayoutFooterProps,
} from './types'

function region<Props>(
  name: string,
  component: Component & { __SLOT__: symbol },
  defaults: Record<string, unknown>,
) {
  const wrapper = defineComponent({
    name,
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      return () => {
        const values = { ...attrs }
        for (const [key, value] of Object.entries(defaults)) {
          if (values[key] === undefined) values[key] = value
        }
        return h(component, { 'data-component': name, ...values }, slots)
      }
    },
  })
  return Object.assign(wrapper, { __SLOT__: component.__SLOT__ }) as unknown as WithSlotMarker<{
    new (): Omit<InstanceType<typeof wrapper>, '$props'> & {
      $props: Props & AllowedComponentProps & VNodeProps
    }
  }>
}

export const Header = region<SplitPageLayoutHeaderProps>(
  'SplitPageLayout.Header',
  PageLayout.Header,
  {
    padding: 'normal',
    divider: 'line',
  },
)
export const Content = region<SplitPageLayoutContentProps>(
  'SplitPageLayout.Content',
  PageLayout.Content,
  {
    width: 'large',
    padding: 'normal',
  },
)
export const Pane = region<SplitPageLayoutPaneProps>('SplitPageLayout.Pane', PageLayout.Pane, {
  position: 'start',
  sticky: true,
  padding: 'normal',
  divider: 'line',
})
export const Sidebar = region<SplitPageLayoutSidebarProps>(
  'SplitPageLayout.Sidebar',
  PageLayout.Sidebar,
  {
    position: 'start',
    padding: 'normal',
    divider: 'line',
  },
)
export const Footer = region<SplitPageLayoutFooterProps>(
  'SplitPageLayout.Footer',
  PageLayout.Footer,
  {
    padding: 'normal',
    divider: 'line',
  },
)

const Root = defineComponent({
  name: 'SplitPageLayout',
  inheritAttrs: false,
  props: { className: { type: String, default: undefined } },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        PageLayout,
        {
          'data-component': 'SplitPageLayout',
          containerWidth: 'full',
          padding: 'none',
          columnGap: 'none',
          rowGap: 'none',
          _slotsConfig: { header: Header, footer: Footer, sidebar: Sidebar },
          className: props.className,
          ...attrs,
        },
        slots,
      )
  },
})

export const SplitPageLayout = Object.assign(Root, { Header, Content, Pane, Sidebar, Footer })
export type { SplitPageLayoutProps }
