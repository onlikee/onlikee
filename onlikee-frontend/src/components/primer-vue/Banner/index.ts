import BannerRoot from './Banner.vue'
import BannerTitleRoot from './BannerTitle.vue'
import BannerDescriptionRoot from './BannerDescription.vue'
import BannerPrimaryActionRoot from './BannerPrimaryAction.vue'
import BannerSecondaryActionRoot from './BannerSecondaryAction.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { Button } from '../Button'
import type { BannerDescriptionProps } from './types'

type WithoutVariant<Props> = Props extends unknown
  ? Omit<Props, 'variant'> & { variant?: never }
  : never
type ActionComponent<Sfc extends abstract new (...args: never[]) => object> = {
  new (): Omit<InstanceType<Sfc>, '$props'> & {
    $props: WithoutVariant<InstanceType<typeof Button>['$props']>
  }
}

export const BannerTitle = BannerTitleRoot
export const BannerDescription = BannerDescriptionRoot as unknown as {
  new (): Omit<InstanceType<typeof BannerDescriptionRoot>, '$props'> & {
    $props: BannerDescriptionProps & AllowedComponentProps & VNodeProps
  }
}
export const BannerPrimaryAction = BannerPrimaryActionRoot as unknown as ActionComponent<
  typeof BannerPrimaryActionRoot
>
export const BannerSecondaryAction = BannerSecondaryActionRoot as unknown as ActionComponent<
  typeof BannerSecondaryActionRoot
>

export const Banner = Object.assign(BannerRoot, {
  Title: BannerTitle,
  Description: BannerDescription,
  PrimaryAction: BannerPrimaryAction,
  SecondaryAction: BannerSecondaryAction,
})

export type {
  BannerProps,
  BannerVariant,
  BannerTitleProps,
  BannerDescriptionProps,
  BannerPrimaryActionProps,
  BannerSecondaryActionProps,
  BannerInstance,
} from './types'
