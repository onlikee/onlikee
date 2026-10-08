// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, h, nextTick, type VNodeChild } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { UnderlinePanels, type UnderlinePanelsProps } from './index'

describe('SSR rendering', () => {
  async function render(
    props: UnderlinePanelsProps & Record<string, unknown>,
    children: VNodeChild[],
  ) {
    return renderToString(
      createSSRApp({
        render: () => h(UnderlinePanels, props, { default: () => children }),
      }),
    )
  }

  test('pairs tabs and panels by value and exposes the selected panel', async () => {
    const html = await render({ id: 'refs', value: 'tag', 'aria-label': 'Ref type' }, [
      h(UnderlinePanels.Tab, { value: 'branch' }, () => 'Branches'),
      h(UnderlinePanels.Tab, { value: 'tag' }, () => 'Tags'),
      h(UnderlinePanels.Panel, { value: 'branch' }, () => 'Branch panel'),
      h(UnderlinePanels.Panel, { value: 'tag' }, () => 'Tag panel'),
    ])

    expect(html).toMatch(/role="tablist"[^>]*aria-label="Ref type"/)
    expect(html).toMatch(
      /id="refs-tab-tag"[^>]*aria-controls="refs-panel-tag"[^>]*aria-selected="true"/,
    )
    expect(html).toMatch(/id="refs-panel-branch"[^>]*hidden/)
    expect(html).toMatch(/id="refs-panel-tag"[^>]*data-selected(?:\s|>)/)
  })

  test('renders a tab leadingVisual component before its label', async () => {
    const LeadingVisual = () => h('svg', { 'data-test-icon': 'code' })
    const html = await render({ id: 'visual' }, [
      h(UnderlinePanels.Tab, { value: 'code', leadingVisual: LeadingVisual }, () => 'Code'),
      h(UnderlinePanels.Panel, { value: 'code' }, () => 'Repository files'),
    ])

    expect(html).toMatch(/data-component="icon"[^>]*><svg[^>]*data-test-icon="code"/)
    expect(html).toMatch(/data-test-icon="code"[\s\S]*data-component="text"[^>]*>[\s\S]*Code/)
  })

  test('pairs omitted values by their order and honors aria-selected', async () => {
    const html = await render({ id: 'ordered' }, [
      h(UnderlinePanels.Tab, null, () => 'One'),
      h(UnderlinePanels.Tab, { 'aria-selected': true }, () => 'Two'),
      h(UnderlinePanels.Panel, null, () => 'First'),
      h(UnderlinePanels.Panel, null, () => 'Second'),
    ])

    expect(html).toMatch(/<button(?=[^>]*id="ordered-tab-1")(?=[^>]*aria-selected="true")[^>]*>/)
    expect(html).toMatch(/id="ordered-panel-0"[^>]*hidden/)
    expect(html).toMatch(/id="ordered-panel-1"[^>]*data-selected(?:\s|>)/)
  })

  test('defaultValue takes precedence over aria-selected and an unknown value falls back to the first tab', async () => {
    const children = [
      h(UnderlinePanels.Tab, { value: 'first', 'aria-selected': true }, () => 'First'),
      h(UnderlinePanels.Tab, { value: 'second' }, () => 'Second'),
      h(UnderlinePanels.Panel, { value: 'first' }, () => 'First panel'),
      h(UnderlinePanels.Panel, { value: 'second' }, () => 'Second panel'),
    ]
    const preferred = await render({ id: 'preferred', defaultValue: 'second' }, children)
    const fallback = await render({ id: 'fallback', value: 'missing' }, children)

    expect(preferred).toMatch(
      /<button(?=[^>]*id="preferred-tab-second")(?=[^>]*aria-selected="true")[^>]*>/,
    )
    expect(fallback).toMatch(
      /<button(?=[^>]*id="fallback-tab-first")(?=[^>]*aria-selected="true")[^>]*>/,
    )
  })

  test('rejects duplicate tab values in development', async () => {
    await expect(
      render({ id: 'duplicate' }, [
        h(UnderlinePanels.Tab, { value: 'same' }, () => 'One'),
        h(UnderlinePanels.Tab, { value: 'same' }, () => 'Two'),
        h(UnderlinePanels.Panel, { value: 'same' }, () => 'First'),
        h(UnderlinePanels.Panel, { value: 'other' }, () => 'Second'),
      ]),
    ).rejects.toThrow(/unique value/)
  })
})

describe('interactions', () => {
  let host: HTMLElement
  const wrappers: VueWrapper[] = []

  beforeEach(() => {
    host = document.createElement('div')
    document.body.append(host)
  })

  afterEach(() => {
    for (const wrapper of wrappers.splice(0)) wrapper.unmount()
    host.remove()
  })

  function mountPanels(props: UnderlinePanelsProps = {}, disabled: string[] = []) {
    const wrapper = mount(UnderlinePanels, {
      attachTo: host,
      props: { id: 'panels', ...props },
      slots: {
        default: () =>
          ['one', 'two', 'three'].flatMap((value) => [
            h(UnderlinePanels.Tab, { value, disabled: disabled.includes(value) }, () => value),
            h(UnderlinePanels.Panel, { value }, () => `${value} content`),
          ]),
      },
    })
    wrappers.push(wrapper)
    return wrapper
  }

  function expectSelection(wrapper: VueWrapper, value: string) {
    for (const tab of wrapper.findAll<HTMLButtonElement>('[role="tab"]')) {
      const selected = tab.element.id === `panels-tab-${value}`
      expect(tab.attributes('aria-selected')).toBe(String(selected))
      expect(tab.element.tabIndex).toBe(selected ? 0 : -1)
    }
    for (const panel of wrapper.findAll<HTMLElement>('[role="tabpanel"]')) {
      const selected = panel.element.id === `panels-panel-${value}`
      expect(panel.element.hidden).toBe(!selected)
      expect(panel.attributes('data-selected')).toBe(selected ? '' : undefined)
    }
  }

  test('click changes the visible panel and emits once per selection', async () => {
    const wrapper = mountPanels()
    expectSelection(wrapper, 'one')
    const second = wrapper.get<HTMLButtonElement>('#panels-tab-two')
    second.element.click()
    await nextTick()
    expectSelection(wrapper, 'two')
    expect(wrapper.emitted('update:value')).toStrictEqual([['two']])
    expect(wrapper.emitted('change')).toStrictEqual([[{ value: 'two' }]])
    second.element.click()
    await nextTick()
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('update:value')).toHaveLength(1)
  })

  test('controlled selection waits for a parent prop update', async () => {
    const wrapper = mountPanels({ value: 'one' })
    wrapper.get<HTMLButtonElement>('#panels-tab-two').element.click()
    await nextTick()
    expectSelection(wrapper, 'one')
    expect(wrapper.emitted('update:value')).toStrictEqual([['two']])
    expect(wrapper.emitted('change')).toStrictEqual([[{ value: 'two' }]])
    await wrapper.setProps({ value: 'two' })
    expectSelection(wrapper, 'two')
    expect(wrapper.emitted('change')).toHaveLength(1)
  })

  test('disabled tabs cannot be activated by click, focus or activation keys', async () => {
    const wrapper = mountPanels({}, ['two'])
    const second = wrapper.get<HTMLButtonElement>('#panels-tab-two')
    expect(second.attributes('aria-disabled')).toBe('true')
    second.element.click()
    second.element.focus()
    await second.trigger('keydown', { key: 'Enter' })
    await second.trigger('keydown', { key: ' ' })
    expectSelection(wrapper, 'one')
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })

  test('automatic arrow navigation wraps and skips disabled tabs', async () => {
    const wrapper = mountPanels({}, ['two'])
    const first = wrapper.get<HTMLButtonElement>('#panels-tab-one')
    const last = wrapper.get<HTMLButtonElement>('#panels-tab-three')
    first.element.focus()
    await first.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(last.element)
    expectSelection(wrapper, 'three')
    await last.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(first.element)
    expectSelection(wrapper, 'one')
    await first.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(last.element)
    expectSelection(wrapper, 'three')
    await last.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(first.element)
    expectSelection(wrapper, 'one')
    expect(wrapper.emitted('change')).toHaveLength(4)
  })

  test('Home and End focus and activate the first and last enabled tabs', async () => {
    const wrapper = mountPanels({}, ['one'])
    const second = wrapper.get<HTMLButtonElement>('#panels-tab-two')
    const last = wrapper.get<HTMLButtonElement>('#panels-tab-three')
    second.element.focus()
    await nextTick()
    await second.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(last.element)
    expectSelection(wrapper, 'three')
    await last.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(second.element)
    expectSelection(wrapper, 'two')
  })

  test('automatic mode activates a directly focused tab', async () => {
    const wrapper = mountPanels()
    const second = wrapper.get<HTMLButtonElement>('#panels-tab-two')
    second.element.focus()
    await nextTick()
    expect(document.activeElement).toBe(second.element)
    expectSelection(wrapper, 'two')
    expect(wrapper.emitted('change')).toStrictEqual([[{ value: 'two' }]])
  })

  test.each(['Enter', ' '])('manual mode moves focus without selection until %s', async (key) => {
    const wrapper = mountPanels({ activationMode: 'manual' }, ['two'])
    const first = wrapper.get<HTMLButtonElement>('#panels-tab-one')
    const last = wrapper.get<HTMLButtonElement>('#panels-tab-three')
    first.element.focus()
    await first.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(last.element)
    expect(first.attributes('aria-selected')).toBe('true')
    expect(first.element.tabIndex).toBe(-1)
    expect(last.attributes('aria-selected')).toBe('false')
    expect(last.element.tabIndex).toBe(0)
    expect(wrapper.get<HTMLElement>('#panels-panel-one').element.hidden).toBe(false)
    expect(wrapper.get<HTMLElement>('#panels-panel-three').element.hidden).toBe(true)
    expect(wrapper.emitted('change')).toBeUndefined()
    await last.trigger('keydown', { key })
    expectSelection(wrapper, 'three')
    expect(wrapper.emitted('change')).toStrictEqual([[{ value: 'three' }]])
    expect(wrapper.emitted('update:value')).toStrictEqual([['three']])
  })
})
