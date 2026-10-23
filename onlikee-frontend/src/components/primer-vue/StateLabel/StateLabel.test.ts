// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { h } from 'vue'
import StateLabel, { StateLabel as NamedStateLabel, type StateLabelStatus } from './index'
import { Link } from '../Link'

const labels: Record<StateLabelStatus, string | null> = {
  issueOpened: 'Issue',
  pullOpened: 'Pull request',
  issueClosed: 'Issue',
  issueClosedNotPlanned: 'Issue, not planned',
  pullClosed: 'Pull request',
  pullMerged: 'Pull request',
  draft: 'Pull request',
  issueDraft: 'Issue',
  pullQueued: 'Pull request',
  unavailable: '',
  alertOpened: 'Alert',
  alertFixed: 'Alert',
  alertDismissed: 'Alert',
  alertClosed: 'Alert',
  open: null,
  closed: null,
  archived: 'Archived',
}
const wrappers: VueWrapper[] = []
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))

describe('StateLabel', () => {
  it('exports stable default and named components', () => expect(StateLabel).toBe(NamedStateLabel))

  it.each(Object.entries(labels) as Array<[StateLabelStatus, string | null]>)(
    'renders %s with the matching accessible icon',
    (status, label) => {
      const wrapper = mount(StateLabel, { props: { status }, slots: { default: 'Status' } })
      wrappers.push(wrapper)
      expect(wrapper.attributes()).toMatchObject({
        'data-component': 'StateLabel',
        'data-size': 'medium',
        'data-status': status,
      })
      expect(wrapper.text()).toBe('Status')
      if (label === null) expect(wrapper.find('svg').exists()).toBe(false)
      else {
        const icon = wrapper.get('svg')
        expect(icon.attributes('aria-label')).toBe(label)
        expect(icon.attributes('width')).toBe('16')
        expect(icon.attributes('role')).toBe(label ? 'img' : undefined)
        expect(icon.attributes('aria-hidden')).toBe(label ? undefined : 'true')
      }
      expect(wrapper.vm.element).toBe(wrapper.element)
    },
  )

  it.each([
    [undefined, undefined, 'medium'],
    [undefined, 'small', 'small'],
    [undefined, 'normal', 'medium'],
    ['medium', 'small', 'medium'],
    ['small', 'normal', 'small'],
  ] as const)('prefers size %s over variant %s', (size, variant, expected) => {
    const wrapper = mount(StateLabel, { props: { status: 'issueOpened', size, variant } })
    wrappers.push(wrapper)
    expect(wrapper.attributes('data-size')).toBe(expected)
    expect(wrapper.get('svg').attributes('data-size-small')).toBe(
      expected === 'small' ? '' : undefined,
    )
  })

  it('forwards native attributes and children while protecting status metadata', async () => {
    const wrapper = mount(StateLabel, {
      props: { status: 'pullMerged', className: 'custom' },
      attrs: {
        class: 'native',
        id: 'state',
        'data-component': 'override',
        'data-size': 'override',
        'data-status': 'override',
        style: { marginTop: 4 },
      },
      slots: { default: () => h(Link, { href: '#changes' }, () => 'Changes') },
    })
    wrappers.push(wrapper)
    expect(wrapper.attributes()).toMatchObject({
      id: 'state',
      'data-component': 'StateLabel',
      'data-size': 'medium',
      'data-status': 'pullMerged',
    })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['custom', 'native']))
    expect(wrapper.attributes('style')).toContain('margin-top: 4px')
    expect(wrapper.get('a').attributes('href')).toBe('#changes')
    await wrapper.setProps({ status: 'open' })
    expect(wrapper.find('svg').exists()).toBe(false)
    await wrapper.setProps({ status: 'alertFixed' })
    expect(wrapper.get('svg').attributes('aria-label')).toBe('Alert')
  })
})
