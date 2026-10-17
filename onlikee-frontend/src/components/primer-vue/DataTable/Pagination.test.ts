// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { Pagination, type PaginationProps } from './index'
const wrappers: VueWrapper[] = []
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))
function render(props: Partial<PaginationProps> = {}) {
  const onChange = vi.fn()
  const wrapper = mount(Pagination, {
    props: { 'aria-label': 'Repositories', totalCount: 100, ...props, onChange },
  })
  wrappers.push(wrapper)
  return { wrapper, onChange }
}
const page = (wrapper: VueWrapper, num: number) =>
  wrapper
    .findAll('[data-component="Table.Pagination.Page"]')
    .find((button) => button.text().replace('Page', '').replace('…', '').trim() === String(num))!
const range = (wrapper: VueWrapper) =>
  wrapper.get('[data-component="Table.Pagination.Range"]').text().replace(/\s+/g, ' ')
const next = (wrapper: VueWrapper) =>
  wrapper.get('[data-component="Table.Pagination.NextPageButton"]')
const previous = (wrapper: VueWrapper) =>
  wrapper.get('[data-component="Table.Pagination.PreviousPageButton"]')
describe('Table.Pagination', () => {
  it('provides a named landmark, native attributes, default size, range and responsive page defaults', () => {
    const { wrapper, onChange } = render({ id: 'pagination' })
    expect(wrapper.get('nav').attributes()).toMatchObject({
      id: 'pagination',
      'aria-label': 'Repositories',
    })
    expect(page(wrapper, 1).attributes('aria-current')).toBe('true')
    expect(range(wrapper)).toBe('1 through ‒25 of 100')
    expect(previous(wrapper).attributes('aria-disabled')).toBe('true')
    expect(next(wrapper).attributes('aria-disabled')).toBeUndefined()
    expect(wrapper.get('ol').attributes('data-hidden-viewport-ranges')).toBe('narrow')
    expect(wrapper.text()).toContain('Showing 1 through 25 of 100')
    expect(onChange).not.toHaveBeenCalled()
  })
  it('selects zero-based pages and emits once, while selected/disabled actions do not emit', async () => {
    const { wrapper, onChange } = render()
    await previous(wrapper).trigger('click')
    await page(wrapper, 1).trigger('click')
    expect(onChange).not.toHaveBeenCalled()
    await next(wrapper).trigger('click')
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ pageIndex: 1 })
    expect(page(wrapper, 2).attributes('aria-current')).toBe('true')
    await page(wrapper, 4).trigger('click')
    expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 3 })
    expect(next(wrapper).attributes('aria-disabled')).toBe('true')
    await next(wrapper).trigger('click')
    expect(onChange).toHaveBeenCalledTimes(2)
    await previous(wrapper).trigger('click')
    expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 2 })
  })
  it('initializes and updates valid defaultPageIndex without resetting user navigation every render', async () => {
    const { wrapper, onChange } = render({ defaultPageIndex: 1 })
    expect(page(wrapper, 2).attributes('aria-current')).toBe('true')
    await next(wrapper).trigger('click')
    expect(page(wrapper, 3).attributes('aria-current')).toBe('true')
    await wrapper.setProps({ totalCount: 101 })
    expect(page(wrapper, 3).attributes('aria-current')).toBe('true')
    await wrapper.setProps({ defaultPageIndex: 0 })
    expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 0 })
    expect(page(wrapper, 1).attributes('aria-current')).toBe('true')
    expect(onChange).toHaveBeenCalledTimes(2)
    await wrapper.setProps({ defaultPageIndex: 999 })
    expect(page(wrapper, 1).attributes('aria-current')).toBe('true')
  })
  it.each([-1, 4])(
    'warns for invalid default index %s and falls back to zero',
    (defaultPageIndex) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { wrapper } = render({ defaultPageIndex })
      expect(page(wrapper, 1).attributes('aria-current')).toBe('true')
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('expected defaultPageIndex'))
    },
  )
  it('keeps the reference empty range and both boundary controls inert', async () => {
    const { wrapper, onChange } = render({ totalCount: 0 })
    expect(range(wrapper)).toBe('1 through ‒0 of 0')
    expect(wrapper.findAll('[data-component="Table.Pagination.Page"]')).toHaveLength(0)
    await next(wrapper).trigger('click')
    await previous(wrapper).trigger('click')
    expect(onChange).not.toHaveBeenCalled()
  })
  it('renders first/last page windows, double truncation and a partial last-page range', async () => {
    const { wrapper } = render({ totalCount: 1000, defaultPageIndex: 19 })
    const pages = wrapper
      .findAll('[data-component="Table.Pagination.Page"]')
      .map((button) => button.text().replace(/\s/g, ' '))
    expect(pages).toEqual([
      'Page 1…',
      'Page 18',
      'Page 19',
      'Page 20',
      'Page 21',
      'Page 22…',
      'Page 40',
    ])
    expect(wrapper.findAll('[data-component="Table.Pagination.TruncationStep"]')).toHaveLength(2)
    await wrapper.setProps({ totalCount: 100, pageSize: 15, defaultPageIndex: 6 })
    expect(range(wrapper)).toBe('91 through ‒100 of 100')
  })
  it('supports boolean and responsive page visibility', async () => {
    const { wrapper } = render({ showPages: false })
    expect(wrapper.findAll('[data-component="Table.Pagination.Page"]')).toHaveLength(0)
    expect(wrapper.get('ol').attributes('data-hidden-viewport-ranges')).toBe('narrow regular wide')
    await wrapper.setProps({ showPages: { narrow: true, regular: false, wide: true } })
    expect(wrapper.findAll('[data-component="Table.Pagination.Page"]')).toHaveLength(4)
    expect(wrapper.get('ol').attributes('data-hidden-viewport-ranges')).toBe('regular')
    await wrapper.setProps({ showPages: true })
    expect(wrapper.get('ol').attributes('data-hidden-viewport-ranges')).toBe('')
  })
})
