// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { KebabHorizontalIcon } from '@onlikee/octicons-vue'
import { DataTable, Table, type Column } from './index'
import { ActionMenu } from '../ActionMenu'
import { ActionList } from '../ActionList'
import { IconButton } from '../Button'
import { Label } from '../Label'
import { LabelGroup } from '../LabelGroup'

const wrappers: VueWrapper[] = []
async function settle() {
  await nextTick()
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
}
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(30)
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(document.body)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 320, 32),
  )
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([
    new DOMRect(0, 0, 320, 32),
  ] as unknown as DOMRectList)
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('DataTable component compositions', () => {
  it('preserves interactive cell identity after sorting and routes row menu selection exactly once', async () => {
    interface Repository {
      id: number
      name: string
    }
    const data = [
      { id: 1, name: 'beta' },
      { id: 2, name: 'alpha' },
    ]
    const selected = vi.fn()
    const toggled = vi.fn()
    const columns: Column<Repository>[] = [
      {
        field: 'name',
        header: 'Name',
        rowHeader: true,
        sortBy: true,
        renderCell: (row) => [
          h('span', row.name),
          h('input', { 'aria-label': `Note: ${row.name}`, 'data-note': row.name }),
        ],
      },
      {
        id: 'actions',
        header: 'Actions',
        renderCell: (row) =>
          h(ActionMenu, null, {
            default: () => [
              h(ActionMenu.Anchor, null, {
                default: () =>
                  h(IconButton, {
                    icon: KebabHorizontalIcon,
                    'aria-label': `Actions: ${row.name}`,
                    variant: 'invisible',
                  }),
              }),
              h(ActionMenu.Overlay, null, {
                default: () =>
                  h(ActionList, null, {
                    default: () =>
                      h(ActionList.Item, { onSelect: () => selected(row.id) }, () => 'Copy row'),
                  }),
              }),
            ],
          }),
      },
    ]
    const wrapper = mount(Table.Container, {
      slots: {
        default: () => [
          h(Table.Title, { id: 'repositories' }, () => 'Repositories'),
          h(Table.Subtitle, { id: 'repositories-help' }, () => 'Editable repository notes'),
          h(DataTable<Repository>, {
            data,
            columns,
            'aria-labelledby': 'repositories',
            'aria-describedby': 'repositories-help',
            onToggleSort: toggled,
          }),
        ],
      },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    const note = wrapper.get<HTMLInputElement>('[data-note="beta"]').element
    note.value = 'Unsaved note'
    await wrapper.get('[data-component="Table.SortHeader.Button"]').trigger('click')
    expect(toggled).toHaveBeenCalledExactlyOnceWith('name', 'ASC')
    expect(wrapper.findAll('[role="rowheader"]').map((cell) => cell.text())).toEqual([
      'alpha',
      'beta',
    ])
    expect(wrapper.get('[data-note="beta"]').element).toBe(note)
    expect(note.value).toBe('Unsaved note')
    const trigger = wrapper.get<HTMLButtonElement>('tbody tr [data-component="IconButton"]')
    expect(document.getElementById(trigger.attributes('aria-labelledby')!)?.textContent).toBe(
      'Actions: alpha',
    )
    trigger.element.focus()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await settle()
    const item = document.querySelector<HTMLElement>('[role="menuitem"]')!
    expect(item).not.toBeNull()
    item.click()
    await settle()
    expect(selected).toHaveBeenCalledExactlyOnceWith(2)
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
    expect(data.map((row) => row.name)).toEqual(['beta', 'alpha'])
  })

  it('renders and expands a LabelGroup from a rich cell without replacing its row', async () => {
    const wrapper = mount(DataTable<{ id: number; name: string }>, {
      props: {
        data: [{ id: 1, name: 'repository' }],
        columns: [
          { header: 'Name', field: 'name' },
          {
            id: 'labels',
            header: 'Labels',
            renderCell: () =>
              h(
                LabelGroup,
                { visibleChildCount: 1, overflowStyle: 'inline' },
                {
                  default: () => ['Alerts', 'Updates'].map((label) => h(Label, null, () => label)),
                },
              ),
          },
        ],
      },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    const row = wrapper.get('tbody tr').element
    const expand = wrapper.findAll('button').find((button) => button.text().includes('+1'))!
    expect(expand).toBeDefined()
    await expand.trigger('click')
    await settle()
    expect(wrapper.text()).toContain('Show less')
    expect(wrapper.get('tbody tr').element).toBe(row)
    expect(document.activeElement?.textContent).toBe('Show less')
  })
})
