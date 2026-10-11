/* eslint-disable vue/one-component-per-file -- Type fixtures use local components to check polymorphic props. */
import { describe, expect, it } from 'vitest'
import { h, defineComponent } from 'vue'
import { Button, ButtonBase, IconButton, LinkButton } from './index'
import type { ButtonBaseComponentOptions } from './types'
import type { ButtonProps, ButtonBaseProps, IconButtonProps, LinkButtonProps } from './index'

type ActualButtonProps = InstanceType<typeof Button>['$props']
type ActualLinkProps = InstanceType<typeof LinkButton>['$props']
type ActualIconProps = InstanceType<typeof IconButton>['$props']
const Icon = defineComponent({ render: () => h('svg') })
const CustomButton = defineComponent({
  props: { customLabel: { type: String, required: true } },
  setup: () => () => h('button'),
})
const button: ActualButtonProps = {
  count: 0,
  leadingVisual: h(Icon),
  inactive: true,
  labelWrap: true,
}
const actualLinkButton: ActualLinkProps = { href: '#actual-link' }
const actualButtonAnchor: ActualButtonProps = { as: 'a', href: '#actual-button-anchor' }
// @ts-expect-error Vue children are supplied through the default slot, not a public prop.
const invalidActualButtonChildren: ActualButtonProps = { children: 0 }
// @ts-expect-error The SFC public props must keep native attributes tied to the selected root.
const invalidActualButtonRoot: ActualButtonProps = { as: 'button', href: '#invalid' }
// @ts-expect-error The default public Button type must not accept anchor-only attributes.
const actualButtonWithWrongHref: ActualButtonProps = { href: '#invalid-default-href' }
// @ts-expect-error ButtonBaseProps follows the shared React behavior-only type.
const baseWithIcon: ButtonBaseProps = { icon: h(Icon) }
const namedIcon: ActualIconProps = { icon: Icon, 'aria-label': 'Close' }
const referencedIcon: ActualIconProps = { icon: Icon, 'aria-labelledby': 'external-name' }
const publicIcon: IconButtonProps = {
  icon: Icon,
  'aria-label': 'Close',
  notificationIndicator: 'icon',
}
const base: ButtonBaseProps = {
  type: 'submit',
  onClick: (event) => event.preventDefault(),
}
// @ts-expect-error The default exported ButtonProps type is tied to a button root.
const publicButtonWithWrongHref: ButtonProps = { href: '#invalid-public-href' }
const link: LinkButtonProps = {
  href: '#save',
  target: '_blank',
  download: 'file',
  type: 'submit',
  leadingVisual: h(Icon),
  form: 'save-form',
  formaction: '/save',
}
const actualLink: ActualLinkProps = link
const actualBase: InstanceType<typeof ButtonBase>['$props'] = { ...base }
// @ts-expect-error ButtonBaseProps is the shared behavior contract, not Button visual props.
const baseWithButtonSpecificProps: ButtonBaseProps = { alignContent: 'start' }
// @ts-expect-error React's ButtonBaseProps excludes the icon-only notification placement.
const baseWithIconIndicator: ButtonBaseProps = { notificationIndicator: 'icon' }
const buttonAnchor = h(Button, { as: 'a', href: '#button-anchor' })
const buttonWithSlotChildren = h(Button, null, { default: () => 0 })
// @ts-expect-error A native button root rejects anchor-only attributes in h().
const typedHWrongButtonRoot = h(Button, { as: 'button', href: '#invalid-button-href' })
// @ts-expect-error The default button root rejects anchor-only attributes in h().
const typedHWrongDefaultRoot = h(Button, { href: '#invalid-default-href' })
// @ts-expect-error A non-anchor native root rejects anchor-only attributes in h().
const typedHWrongOtherRoot = h(Button, { as: 'div', href: '#invalid-div-href' })
const baseAnchor = h(ButtonBase, { as: 'a', href: '#base-anchor' })
// @ts-expect-error ButtonBase defaults to button and rejects anchor-only attributes.
const baseWithImplicitHref = h(ButtonBase, { href: '#invalid-base-href' })
const iconAnchor = h(IconButton, {
  as: 'a',
  href: '#icon-anchor',
  icon: Icon,
  'aria-label': 'Open',
})
const iconWithImplicitHref = h(IconButton, {
  icon: Icon,
  'aria-label': 'Open',
  // @ts-expect-error IconButton defaults to button and rejects anchor-only attributes.
  href: '#invalid-icon-href',
})
// @ts-expect-error h() must require an accessible name for IconButton.
const missingHIconName = h(IconButton, { icon: Icon })
// @ts-expect-error IconButton requires an accessible name on the actual component.
const iconWithoutName = h(IconButton, { icon: Icon })
const linkButtonType = h(LinkButton, { href: '#button-type', type: 'submit' })
// @ts-expect-error React's LinkButton type intersects with ButtonProps and keeps button type values.
const linkMimeType: LinkButtonProps = { href: '#mime-type', type: 'text/html' }
// @ts-expect-error The actual polymorphic component retains React's button type union.
const actualLinkMimeType = h(LinkButton, { href: '#mime-type', type: 'text/html' })
const buttonAnchorKeepsButtonAttributes: ButtonProps<'a'> = {
  as: 'a',
  href: '#form-action',
  form: 'native-form',
}
const iconAnchorKeepsButtonAttributes: IconButtonProps<'a'> = {
  as: 'a',
  href: '#form-action',
  form: 'native-form',
  icon: Icon,
  'aria-label': 'Submit',
}
const typedCustomComponent: ButtonProps<typeof CustomButton> = {
  as: CustomButton,
  customLabel: 'Required custom prop',
}
const customComponent = h(Button, typedCustomComponent)
const typedBaseCustomComponent: ButtonBaseComponentOptions<typeof CustomButton> = {
  as: CustomButton,
  customLabel: 'Required custom base prop',
}
const baseCustomComponent = h(ButtonBase, typedBaseCustomComponent)
const typedIconCustomComponent: IconButtonProps<typeof CustomButton> = {
  as: CustomButton,
  customLabel: 'Required custom icon prop',
  icon: Icon,
  'aria-label': 'Custom icon action',
}
const iconCustomComponent = h(IconButton, typedIconCustomComponent)
const typedLinkCustomComponent: LinkButtonProps<typeof CustomButton> = {
  as: CustomButton,
  customLabel: 'Required custom link prop',
}
const linkCustomComponent = h(LinkButton, typedLinkCustomComponent)
const typedButtonAnchor: ButtonProps<'a'> = { as: 'a', href: '#typed-anchor' }
// @ts-expect-error Button attributes stay tied to the selected native element.
const buttonWithWrongAnchorProp: ButtonProps<'button'> = { as: 'button', href: '#invalid' }
// @ts-expect-error A native button only accepts its defined type values.
const buttonWithWrongType: ButtonProps<'button'> = { type: 'text/html' }
// @ts-expect-error Polymorphic Button keeps its native button type union for anchors.
const buttonAnchorWithWrongType: ButtonProps<'a'> = { as: 'a', type: 'text/html' }
const iconAnchorWithWrongType: IconButtonProps<'a'> = {
  as: 'a',
  icon: Icon,
  'aria-label': 'Open',
  // @ts-expect-error Polymorphic IconButton keeps its native button type union for anchors.
  type: 'text/html',
}
// @ts-expect-error Props from a selected Vue component are required.
const customComponentMissingProp: ButtonProps<typeof CustomButton> = { as: CustomButton }
// @ts-expect-error Custom component props stay required for ButtonBase.
const baseCustomComponentMissingProp: ButtonBaseComponentOptions<typeof CustomButton> = {
  as: CustomButton,
}
// @ts-expect-error Custom component props stay required for IconButton.
const iconCustomComponentMissingProp: IconButtonProps<typeof CustomButton> = {
  as: CustomButton,
  icon: Icon,
  'aria-label': 'Custom icon action',
}
// @ts-expect-error Custom component props stay required for LinkButton.
const linkCustomComponentMissingProp: LinkButtonProps<typeof CustomButton> = { as: CustomButton }
// @ts-expect-error An icon is required on the actual public component.
const missingIcon: ActualIconProps = { 'aria-label': 'Close' }
// @ts-expect-error A label or labelledby is required on the actual public component.
const missingName: ActualIconProps = { icon: Icon }
// @ts-expect-error The two accessible name forms are mutually exclusive.
const twoNames: ActualIconProps = { icon: Icon, 'aria-label': 'Close', 'aria-labelledby': 'name' }
// @ts-expect-error The exported public type retains the accessible-name constraint.
const publicMissingName: IconButtonProps = { icon: Icon }
const wrongIconIndicator: IconButtonProps = {
  icon: Icon,
  'aria-label': 'Close',
  // @ts-expect-error The button visual cannot be used as an IconButton indicator placement.
  notificationIndicator: 'leadingVisual',
}
// @ts-expect-error A text button does not accept icon indicator placement.
const wrongButtonIndicator: ButtonProps = { notificationIndicator: 'icon' }
// @ts-expect-error The actual SFC does not accept arbitrary public props.
const outlandish: ActualButtonProps = { unknownButtonProperty: true }
// @ts-expect-error The exported ButtonProps type rejects arbitrary public props.
const outlandishPublicButton: ButtonProps = { unknownButtonProperty: true }
const outlandishPublicIconButton: IconButtonProps = {
  icon: Icon,
  'aria-label': 'Close',
  // @ts-expect-error The exported IconButtonProps type rejects arbitrary public props.
  unknownButtonProperty: true,
}
const outlandishPublicLinkButton: LinkButtonProps = {
  href: '#link',
  // @ts-expect-error The exported LinkButtonProps type rejects arbitrary public props.
  unknownButtonProperty: true,
}

describe('Button public component types', () => {
  it('keeps the exported types and actual SFC props aligned', () => {
    expect(button.count).toBe(0)
    expect(namedIcon['aria-label']).toBe('Close')
    expect(referencedIcon['aria-labelledby']).toBe('external-name')
    expect(publicIcon.notificationIndicator).toBe('icon')
    expect(actualLink.href).toBe('#save')
    expect(actualLinkButton.href).toBe('#actual-link')
    expect('type' in actualBase ? actualBase.type : undefined).toBe('submit')
    expect(linkButtonType).toBeDefined()
    expect([
      actualButtonAnchor,
      invalidActualButtonChildren,
      invalidActualButtonRoot,
      buttonAnchor,
      buttonWithSlotChildren,
      baseAnchor,
      iconAnchor,
      missingHIconName,
      customComponent,
      baseCustomComponent,
      iconCustomComponent,
      linkCustomComponent,
    ]).toHaveLength(12)
    expect(typedButtonAnchor.href).toBe('#typed-anchor')
    expect(typedCustomComponent.customLabel).toBe('Required custom prop')
    expect(typedLinkCustomComponent.customLabel).toBe('Required custom link prop')
    expect([
      missingIcon,
      missingName,
      iconWithoutName,
      twoNames,
      publicMissingName,
      wrongIconIndicator,
      wrongButtonIndicator,
      outlandish,
      buttonWithWrongAnchorProp,
      buttonWithWrongType,
      buttonAnchorWithWrongType,
      iconAnchorWithWrongType,
      baseWithIconIndicator,
      baseWithIcon,
      baseWithButtonSpecificProps,
      customComponentMissingProp,
      baseCustomComponentMissingProp,
      iconCustomComponentMissingProp,
      linkCustomComponentMissingProp,
      actualButtonWithWrongHref,
      typedHWrongButtonRoot,
      typedHWrongDefaultRoot,
      typedHWrongOtherRoot,
      baseWithImplicitHref,
      iconWithImplicitHref,
      linkMimeType,
      actualLinkMimeType,
      buttonAnchorKeepsButtonAttributes,
      iconAnchorKeepsButtonAttributes,
      publicButtonWithWrongHref,
      outlandishPublicButton,
      outlandishPublicIconButton,
      outlandishPublicLinkButton,
    ]).toHaveLength(33)
  })
})
