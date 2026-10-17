import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { DataTable, Table, type Column } from './index'
const columns: Column<{ id: number; name: string }>[] = [
  { header: 'Name', field: 'name', rowHeader: true },
]
describe('DataTable SSR', () => {
  it('renders with stable, isolated group/column/cell ids and no browser globals', async () => {
    const app = () =>
      createSSRApp({
        render: () =>
          h('main', [
            h(DataTable<{ id: number; name: string }>, {
              columns,
              data: [{ groupId: 'first', label: 'First', rows: [{ id: 1, name: 'One' }] }],
            }),
            h(DataTable<{ id: number; name: string }>, {
              columns,
              data: [{ groupId: 'second', label: 'Second', rows: [{ id: 2, name: 'Two' }] }],
            }),
            h(Table.Pagination, { totalCount: 100, 'aria-label': 'Repositories' }),
            h(Table.Skeleton<{ id: number; name: string }>, { columns, rows: 2 }),
          ]),
      })
    const first = await renderToString(app())
    expect(await renderToString(app())).toBe(first)
    const ids = [...first.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
    expect(new Set(ids).size).toBe(ids.length)
    for (const headers of first.matchAll(/\sheaders="([^"]+)"/g)) {
      for (const id of headers[1]!.split(' ')) expect(ids).toContain(id)
    }
    expect(first).toContain('data-component="SkeletonText"')
    expect(first).toContain('Showing 1 through 25 of 100')
  })
})
