import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  Banner,
  type BannerProps,
  type BannerTitleProps,
  type BannerDescriptionProps,
  type BannerPrimaryActionProps,
  type BannerSecondaryActionProps,
} from './index'

const CustomAction = defineComponent({
  props: { destination: { type: String, required: true } },
  setup: (props) => () => h('a', { href: props.destination }, 'Custom action'),
})
const richBanner: BannerProps = {
  title: h('strong', 'Important'),
  description: h('a', { href: '#details' }, 'Details'),
  variant: 'warning',
  actionsLayout: 'stacked',
  layout: 'compact',
  hideTitle: true,
  flush: true,
  onDismiss: () => {},
  'aria-label': 'Notice',
  'aria-labelledby': 'notice-title',
}
const actualRichBanner: InstanceType<typeof Banner>['$props'] = {
  title: h('strong', 'Rich native-prop override'),
  description: h('em', 'Rich description'),
}
const richBannerNode = h(Banner, actualRichBanner)
const heading: BannerTitleProps<'h3'> = { as: 'h3', id: 'notice-title', className: 'heading' }
const description: BannerDescriptionProps = { id: 'notice-description', className: 'description' }
const primary: BannerPrimaryActionProps = { type: 'submit', loading: true, count: 0 }
const secondary = {
  as: 'a',
  href: '#later',
  target: '_blank',
} satisfies BannerSecondaryActionProps<'a'>
const custom: BannerPrimaryActionProps<typeof CustomAction> = {
  as: CustomAction,
  destination: '#custom',
}
// @ts-expect-error The old notification type is not a Banner variant.
const wrongVariant: BannerProps = { variant: 'error' }
// @ts-expect-error Layout follows the source's default/compact union.
const wrongLayout: BannerProps = { layout: 'inline' }
// @ts-expect-error Banner.Title supports headings h2 through h6.
const wrongHeading: BannerTitleProps<'h1'> = { as: 'h1' }
// @ts-expect-error The wrapper owns the primary Button variant.
const wrongPrimaryVariant: BannerPrimaryActionProps = { variant: 'danger' }
// @ts-expect-error The wrapper owns the secondary Button variant.
const wrongSecondaryVariant: BannerSecondaryActionProps = { variant: 'primary' }
// @ts-expect-error An implicit button root rejects anchor-only href.
const wrongButtonHref: BannerPrimaryActionProps = { href: '#invalid' }
// @ts-expect-error Custom action props remain required.
const wrongCustomAction: BannerPrimaryActionProps<typeof CustomAction> = { as: CustomAction }

const titleNode = h(Banner.Title, heading, () => 'Title')
const descriptionNode = h(Banner.Description, description, () => 'Description')
const primaryNode = h(Banner.PrimaryAction, primary, () => 'Continue')
const secondaryNode = h(Banner.SecondaryAction, secondary, () => 'Later')
const customNode = h(Banner.PrimaryAction, custom, () => 'Custom')
// @ts-expect-error The actual action component also rejects href without as="a".
const wrongActualHref = h(Banner.PrimaryAction, { href: '#invalid' })
// @ts-expect-error The actual action component owns its Button variant.
const wrongActualVariant = h(Banner.PrimaryAction, { variant: 'danger' })
// @ts-expect-error The removed service does not remain as a compatibility API.
const removedInfoService = () => Banner.info('Message')
// @ts-expect-error Banner instances expose their element rather than show().
const removedInstanceService = (instance: InstanceType<typeof Banner>) => instance.show('Message')

describe('Banner public types', () => {
  it('retains rich content, compound components and native/custom action props', () => {
    expect(richBanner.title).toBeTruthy()
    expect(richBannerNode.props?.title).toBe(actualRichBanner.title)
    expect([titleNode, descriptionNode, primaryNode, secondaryNode, customNode]).toHaveLength(5)
    expect([
      wrongVariant,
      wrongLayout,
      wrongHeading,
      wrongPrimaryVariant,
      wrongSecondaryVariant,
      wrongButtonHref,
      wrongCustomAction,
      wrongActualHref,
      wrongActualVariant,
      removedInfoService,
      removedInstanceService,
    ]).toHaveLength(11)
  })
})
