// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { CopyButton } from './index'

const wrappers: VueWrapper[] = []
const writeText = vi.fn<(text: string) => Promise<void>>()
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value })
}

function render(
  props: Partial<InstanceType<typeof CopyButton>['$props']> = {},
  attrs: Record<string, unknown> = {},
) {
  const wrapper = mount(CopyButton, {
    props: { text: 'Hello, world!', ...props },
    attrs,
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  writeText.mockReset().mockResolvedValue(undefined)
  setClipboard({ writeText })
})

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
  else Reflect.deleteProperty(navigator, 'clipboard')
  vi.useRealTimers()
})

describe('CopyButton', () => {
  it('renders an invisible button with an accessible tooltip and exposes its element', () => {
    const wrapper = render()
    const button = wrapper.get('button')
    const tooltip = wrapper.get('[data-component="Tooltip"]')

    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('data-variant')).toBe('invisible')
    expect(button.attributes('data-size')).toBe('medium')
    expect(button.attributes('aria-labelledby')).toBe(tooltip.attributes('id'))
    expect(tooltip.text()).toBe('复制')
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('[role="status"]').text()).toBe('')
    expect(wrapper.vm.element).toBe(button.element)
    expect(writeText).not.toHaveBeenCalled()
  })

  it('copies text and reports success only after the clipboard write resolves', async () => {
    let resolve!: () => void
    writeText.mockReturnValue(new Promise<void>((done) => (resolve = done)))
    const wrapper = render()
    const copyPath = wrapper.get('svg').html()

    await wrapper.get('button').trigger('click')
    expect(writeText).toHaveBeenCalledExactlyOnceWith('Hello, world!')
    expect(wrapper.get('button').attributes('aria-busy')).toBe('true')
    expect(wrapper.get('button').attributes('aria-disabled')).toBe('true')
    expect(wrapper.emitted('success')).toBeUndefined()
    expect(wrapper.get('[role="status"]').text()).toBe('')
    expect(wrapper.get('svg').html()).toBe(copyPath)

    resolve()
    await flushPromises()
    expect(wrapper.emitted('success')).toEqual([['Hello, world!']])
    expect(wrapper.emitted('error')).toBeUndefined()
    expect(wrapper.get('button').attributes('aria-busy')).toBeUndefined()
    expect(wrapper.get('button').attributes('data-copy-state')).toBe('success')
    expect(wrapper.get('[data-component="Tooltip"]').text()).toBe('已复制')
    expect(wrapper.get('[role="status"]').text()).toBe('已复制')
    expect(wrapper.get('svg').html()).not.toBe(copyPath)

    await vi.advanceTimersByTimeAsync(1999)
    expect(wrapper.get('[role="status"]').text()).toBe('已复制')
    await vi.advanceTimersByTimeAsync(1)
    expect(wrapper.get('[role="status"]').text()).toBe('')
    expect(wrapper.get('[data-component="Tooltip"]').text()).toBe('复制')
    expect(wrapper.get('svg').html()).toBe(copyPath)
  })

  it('preserves the original rejection, reports failure and allows retrying', async () => {
    const error = new DOMException('Permission denied', 'NotAllowedError')
    writeText.mockRejectedValueOnce(error)
    const wrapper = render({ label: '复制代码' })
    const copyPath = wrapper.get('svg').html()

    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('error')?.[0]?.[0]).toBe(error)
    expect(wrapper.emitted('success')).toBeUndefined()
    expect(wrapper.get('[data-component="Tooltip"]').text()).toBe('复制失败')
    expect(wrapper.get('[role="status"]').text()).toBe('复制失败')
    expect(wrapper.get('svg').html()).toBe(copyPath)

    await vi.advanceTimersByTimeAsync(2000)
    expect(wrapper.get('[data-component="Tooltip"]').text()).toBe('复制代码')
    expect(wrapper.get('[role="status"]').text()).toBe('')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('success')).toEqual([['Hello, world!']])
  })

  it('reports an unavailable Clipboard API as a failure', async () => {
    setClipboard(undefined)
    const wrapper = render()
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('error')?.[0]?.[0]).toBeInstanceOf(TypeError)
    expect(wrapper.emitted('success')).toBeUndefined()
    expect(wrapper.get('[role="status"]').text()).toBe('复制失败')
  })

  it('does not copy while disabled and retains an accessible name', async () => {
    const wrapper = render({ disabled: true, label: '复制代码' })
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button').attributes('aria-label')).toBe('复制代码')
    await wrapper.get('button').trigger('click')
    expect(writeText).not.toHaveBeenCalled()

    await wrapper.setProps({ disabled: false })
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledOnce()
  })

  it('ignores repeated clicks while a clipboard write is pending', async () => {
    let resolve!: () => void
    writeText.mockReturnValueOnce(new Promise<void>((done) => (resolve = done)))
    const wrapper = render()
    await wrapper.get('button').trigger('click')
    await wrapper.get('button').trigger('click')
    expect(writeText).toHaveBeenCalledOnce()

    resolve()
    await flushPromises()
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledTimes(2)
  })

  it('restarts the feedback duration after another successful copy', async () => {
    const wrapper = render()
    await wrapper.get('button').trigger('click')
    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000)
    await wrapper.get('button').trigger('click')
    await flushPromises()
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.get('[role="status"]').text()).toBe('已复制')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.get('[role="status"]').text()).toBe('')
  })

  it('reads the latest text, including empty text, for each click', async () => {
    const wrapper = render()
    for (const text of ['updated', '']) {
      await wrapper.setProps({ text })
      await wrapper.get('button').trigger('click')
      await flushPromises()
      expect(writeText).toHaveBeenLastCalledWith(text)
    }
    expect(wrapper.emitted('success')).toEqual([['updated'], ['']])
  })

  it('emits the text captured at the time of the click', async () => {
    let resolve!: () => void
    writeText.mockReturnValueOnce(new Promise<void>((done) => (resolve = done)))
    const wrapper = render({ text: 'original' })
    await wrapper.get('button').trigger('click')
    await wrapper.setProps({ text: 'updated' })
    resolve()
    await flushPromises()
    expect(wrapper.emitted('success')).toEqual([['original']])
  })

  it.each(['small', 'medium', 'large'] as const)('supports the %s size', (size) => {
    expect(render({ size }).get('button').attributes('data-size')).toBe(size)
  })

  it('forwards native attributes and listeners to the actual button', async () => {
    const click = vi.fn()
    const keydown = vi.fn()
    const wrapper = render(
      { label: '复制代码' },
      {
        id: 'copy-code',
        class: 'consumer',
        'data-example': 'code',
        onClick: click,
        onKeydown: keydown,
      },
    )
    const button = wrapper.get('button')
    expect(button.attributes('id')).toBe('copy-code')
    expect(button.attributes('data-example')).toBe('code')
    expect(button.classes()).toContain('consumer')
    expect(wrapper.get('[role="status"]').attributes('id')).toBeUndefined()
    expect(wrapper.get('[data-component="Tooltip"]').text()).toBe('复制代码')
    await button.trigger('keydown', { key: 'Enter' })
    expect(keydown).toHaveBeenCalledOnce()
    await button.trigger('click')
    await flushPromises()
    expect(click).toHaveBeenCalledOnce()
    expect(click.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent)
    expect(writeText).toHaveBeenCalledOnce()
  })

  it('clears the feedback timer on unmount', async () => {
    const wrapper = render()
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(vi.getTimerCount()).toBe(1)
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
    expect(wrapper.vm.element).toBeNull()
  })

  it.each(['resolve', 'reject'] as const)(
    'ignores a late clipboard %s after unmount',
    async (outcome) => {
      let resolve!: () => void
      let reject!: (error: Error) => void
      writeText.mockReturnValueOnce(
        new Promise<void>((done, fail) => {
          resolve = done
          reject = fail
        }),
      )
      const wrapper = render()
      await wrapper.get('button').trigger('click')
      wrapper.unmount()
      if (outcome === 'resolve') resolve()
      else reject(new Error('Permission denied'))
      await flushPromises()
      expect(wrapper.emitted('success')).toBeUndefined()
      expect(wrapper.emitted('error')).toBeUndefined()
      expect(vi.getTimerCount()).toBe(0)
    },
  )
})
