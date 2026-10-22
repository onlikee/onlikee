// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { DataTable, Table, type Column } from './index'

it('hydrates groups, skeleton and pagination with the same IDs and accessible names', async () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
  const columns: Column<{ id: number; name: string }>[] = [
    { field: 'name', header: 'Name', rowHeader: true, sortBy: true },
    { id: 'copy', field: 'name', header: 'Copy' },
  ]
  const create = () =>
    createSSRApp({
      render: () =>
        h('main', [
          h(DataTable<{ id: number; name: string }>, {
            columns,
            'aria-labelledby': 'title',
            data: [{ groupId: 'group', label: 'Group', rows: [{ id: 1, name: 'One' }] }],
          }),
          h(DataTable<{ id: number; name: string }>, {
            columns,
            'aria-labelledby': 'second-title',
            data: [{ groupId: 'group', label: 'Another group', rows: [{ id: 1, name: 'Two' }] }],
          }),
          h(Table.Skeleton<{ id: number; name: string }>, { columns, rows: 1 }),
          h(Table.Pagination, { 'aria-label': 'Repositories', totalCount: 100 }),
        ]),
    })
  const host = document.createElement('div')
  host.innerHTML = await renderToString(create())
  document.body.append(host)
  const idsBefore = Array.from(host.querySelectorAll('[id]'), (element) => element.id)
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const app = create()
  try {
    app.mount(host)
    await nextTick()
    expect(Array.from(host.querySelectorAll('[id]'), (element) => element.id)).toEqual(idsBefore)
    expect(new Set(idsBefore).size).toBe(idsBefore.length)
    for (const cell of host.querySelectorAll('[headers]')) {
      for (const id of cell.getAttribute('headers')!.split(' ')) expect(idsBefore).toContain(id)
    }
    expect(host.querySelector('table')?.getAttribute('aria-labelledby')).toBe('title')
    expect(host.querySelector('nav')?.getAttribute('aria-label')).toBe('Repositories')
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  } finally {
    app.unmount()
    host.remove()
  }
})
