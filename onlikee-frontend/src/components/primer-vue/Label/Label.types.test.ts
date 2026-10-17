import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { Label, type LabelProps } from './index'
import { Heading, type HeadingProps } from '../Heading'
import { ScrollableRegion, type ScrollableRegionProps } from '../ScrollableRegion'
import { SkeletonBox, type SkeletonBoxProps } from '../Skeleton'
import { SkeletonText, type SkeletonTextProps } from '../SkeletonText'
import { LabelGroup, type LabelGroupProps } from '../LabelGroup'

const label: LabelProps = { size: 'large', variant: 'success', id: 'status' }
const linkedLabel: LabelProps<'a'> = { as: 'a', href: '/labels', target: '_blank' }
const CustomLabel = defineComponent({ props: { status: { type: String, required: true } } })
const customLabel: LabelProps<typeof CustomLabel> = { as: CustomLabel, status: 'open' }
// @ts-expect-error The chosen anchor element does not have a disabled attribute.
const invalidAnchor: LabelProps<'a'> = { as: 'a', disabled: true }
// @ts-expect-error Only the two documented sizes are supported.
const invalidSize: LabelProps = { size: 'medium' }
const heading: HeadingProps = { as: 'h4', variant: 'medium', id: 'heading' }
// @ts-expect-error A Heading always uses one of the six semantic heading elements.
const invalidHeading: HeadingProps = { as: 'div' }
const labelled: ScrollableRegionProps = { 'aria-label': 'Repositories', id: 'scroll' }
const referenced: ScrollableRegionProps = { 'aria-labelledby': 'heading' }
// @ts-expect-error A scrollable region requires an accessible name.
const unnamed: ScrollableRegionProps = { id: 'scroll' }
// @ts-expect-error Use one naming strategy for a scrollable region.
const duplicatedName: ScrollableRegionProps = {
  'aria-label': 'Repositories',
  'aria-labelledby': 'heading',
}
const box: SkeletonBoxProps = { height: 30, width: '100%', delay: 'short', 'aria-hidden': true }
const text: SkeletonTextProps = { lines: 3, size: 'titleLarge', maxWidth: 250, id: 'loading' }
const group: LabelGroupProps = {
  as: 'ol',
  visibleChildCount: 'auto',
  overflowStyle: 'inline',
  id: 'labels',
}

describe('table dependency public types', () => {
  it('supports native attributes, polymorphic labels and documented option unions', () => {
    expect([
      label,
      linkedLabel,
      customLabel,
      invalidAnchor,
      invalidSize,
      heading,
      invalidHeading,
      labelled,
      referenced,
      unnamed,
      duplicatedName,
      box,
      text,
      group,
    ]).toHaveLength(14)
    expect([
      h(Label, { variant: 'accent', id: 'label' }),
      h(Label, { as: 'a', href: '/labels', target: '_blank' }),
      h(Heading, { as: 'h3', id: 'heading' }),
      h(ScrollableRegion, { 'aria-label': 'Data', id: 'scroll' }),
      h(SkeletonBox, { delay: 'long', id: 'box' }),
      h(SkeletonText, { size: 'bodySmall', id: 'text' }),
      h(LabelGroup, { visibleChildCount: 2, id: 'labels' }),
    ]).toHaveLength(7)
  })
})
