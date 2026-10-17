// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import DataTableDocumentation from './data-table.vue'

let wrapper: VueWrapper | undefined
async function render() {
  wrapper = mount(DataTableDocumentation, {
    attachTo: document.body,
    global: {
      // Code highlighting and copy controls are independent of the examples.
      stubs: { ComponentDocsDemoBlock: { template: '<div><slot /></div>' } },
    },
  })
  await nextTick()
  await flushPromises()
  return wrapper
}
function containerForPage(label: string) {
  const nav = wrapper!.get(`nav[aria-label="${label}"]`)
  const element = nav.element.closest('[data-component="Table.Container"]')!
  return { nav, element }
}
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })),
  )
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('DataTable documentation combinations', () => {
  it('renders the examples with unique IDs and valid table/header associations', async () => {
    const page = await render()
    expect(page.findAll('table').length).toBeGreaterThan(10)
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const element of document.querySelectorAll(
      '[headers], table[aria-labelledby], table[aria-describedby]',
    )) {
      for (const attribute of ['headers', 'aria-labelledby', 'aria-describedby']) {
        for (const id of (element.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean)) {
          expect(document.getElementById(id), `${attribute}="${id}"`).not.toBeNull()
        }
      }
    }
    expect(page.findAll('[data-component="Table.CellPlaceholder"]').length).toBeGreaterThan(0)
    expect(page.findAll('[data-component="Table.Cell"]').some((cell) => cell.text() === '0')).toBe(
      true,
    )
  })

  it('composes row buttons and menus with the same action feedback', async () => {
    const page = await render()
    const mode = page.get('select[name="row-action-mode"]')
    await mode.setValue('single')
    await page.get('button[aria-label="编辑 codeql-dca-worker"]').trigger('click')
    expect(page.get('.status[role="status"]').text()).toBe('编辑：codeql-dca-worker')
    await mode.setValue('menu')
    await page.get('button[aria-label="codeql-dca-worker 的操作"]').trigger('click')
    await flushPromises()
    const download = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
      (item) => item.textContent?.trim() === '下载',
    )!
    expect(download).toBeDefined()
    download.click()
    await nextTick()
    expect(page.get('.status[role="status"]').text()).toBe('下载：codeql-dca-worker')
  })

  it('updates page data and preserves mixed rows and group membership', async () => {
    await render()
    const regular = containerForPage('仓库分页')
    expect(regular.element.textContent).toContain('repository-1')
    await regular.nav.get('[data-component="Table.Pagination.NextPageButton"]').trigger('click')
    expect(regular.element.textContent).toContain('repository-6')
    expect(
      regular.element.querySelector('[data-component="Table.Cell"][scope="row"]')?.textContent,
    ).toBe('repository-6')
    const grouped = containerForPage('分组仓库分页')
    expect(grouped.element.textContent).toContain('standalone/before')
    await grouped.nav.get('[data-component="Table.Pagination.NextPageButton"]').trigger('click')
    expect(grouped.element.textContent).not.toContain('standalone/before')
    expect(grouped.element.textContent).toContain('standalone/after')
    expect(
      grouped.element.querySelectorAll(
        '[data-group-id="public"][data-component="Table.Group.Body"] tr',
      ),
    ).toHaveLength(2)
  })

  it('changes the default page and keeps navigation and rows synchronized', async () => {
    const page = await render()
    const pagination = containerForPage('默认页码仓库分页')
    expect(pagination.element.textContent).toContain('repository-6')
    const reset = page
      .findAll('button')
      .find((button) => button.text().startsWith('将 defaultPageIndex 改为'))!
    await reset.trigger('click')
    expect(
      pagination.element.querySelector('[data-component="Table.Cell"][scope="row"]')?.textContent,
    ).toBe('repository-1')
    expect(pagination.nav.get('[aria-current]').text()).toContain('1')
  })

  it('simulates failure, retries locally, and restores the loaded table', async () => {
    vi.useFakeTimers()
    const page = await render()
    const fail = page.findAll('button').find((button) => button.text() === '模拟请求失败')!
    ;(fail.element as HTMLButtonElement).focus()
    await fail.trigger('click')
    await vi.advanceTimersByTimeAsync(700)
    await nextTick()
    const dialog = document.querySelector('[role="alertdialog"], [role="dialog"]')!
    expect(dialog).not.toBeNull()
    const retry = [...dialog.querySelectorAll<HTMLButtonElement>('button')].find(
      (button) => button.textContent?.trim() === 'Retry',
    )!
    retry.click()
    await nextTick()
    await vi.advanceTimersByTimeAsync(700)
    await nextTick()
    expect(document.querySelector('[role="alertdialog"], [role="dialog"]')).toBeNull()
    expect(page.text()).toContain('请求成功，已恢复数据。')
  })
})
