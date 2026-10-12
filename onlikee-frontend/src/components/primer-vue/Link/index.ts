import LinkComponent from './Link.vue'
import type { AllowedComponentProps, Component, NativeElements, VNodeProps } from 'vue'
import type { LinkComponentProps } from './types'

export const Link = LinkComponent as <As extends keyof NativeElements | Component = 'a'>(
  props: LinkComponentProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof LinkComponent<As>>
export type { LinkOptions, LinkProps, LinkInstance } from './types'
