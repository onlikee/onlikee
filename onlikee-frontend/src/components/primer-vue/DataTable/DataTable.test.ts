// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures exercise mixed groups and nested tables. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { DataTable, Table, type Column, type DataTableData, type TableInstance } from './index'
import { getGridTemplateFromColumns } from './useTable'
import { alphanumeric, basic, datetime } from './sorting'

interface Repository {
  id: number
  name: string | null
  count: number
  owner?: { login: string }
}
const columns: Column<Repository>[] = [
  { header: 'Repository', field: 'name', rowHeader: true, sortBy: true },
  { header: () => h('strong', 'Count'), field: 'count', align: 'end', sortBy: true },
]
const data: Repository[] = [
  { id: 1, name: 'Beta', count: 2 },
  { id: 2, name: 'Alpha', count: 0 },
  { id: 3, name: null, count: 1 },
]
const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})
function render(
  props: {
    data?: DataTableData<Repository>
    columns?: Column<Repository>[]
    externalSorting?: boolean
    initialSortColumn?: string
    initialSortDirection?: 'ASC' | 'DESC'
    onToggleSort?: (...args: unknown[]) => void
    getRowId?: (row: Repository) => string | number
  } = {},
) {
  const wrapper = mount(DataTable<Repository>, {
    props: { data, columns, ...props },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
const rowNames = (wrapper: VueWrapper) =>
  wrapper.findAll('[role="rowheader"]').map((cell) => cell.text())

describe('DataTable', () => {
  it('renders semantic headers/cells, zero values, VNodes, labels, density and native attributes', async () => {
    const wrapper = render()
    expect(wrapper.get('table').attributes('role')).toBe('table')
    expect(wrapper.get('table').attributes('data-cell-padding')).toBe('normal')
    expect(wrapper.findAll('[role="columnheader"]')).toHaveLength(2)
    expect(wrapper.findAll('[role="row"]')).toHaveLength(4)
    expect(wrapper.get('strong').text()).toBe('Count')
    expect(wrapper.findAll('[role="cell"]')[1]!.text()).toBe('0')
    expect(wrapper.findAll('[role="cell"]')[0]!.attributes('data-cell-align')).toBe('end')
    expect(wrapper.get('th[scope="row"]').attributes('headers')).toBeUndefined()
    await wrapper.setProps({
      cellPadding: 'spacious',
      'aria-labelledby': 'title',
      'aria-describedby': 'description',
    })
    expect(wrapper.get('table').attributes()).toMatchObject({
      'data-cell-padding': 'spacious',
      'aria-labelledby': 'title',
      'aria-describedby': 'description',
    })
  })

  it('supports full-row rendering and preserves keyed components while sorting', async () => {
    let mounts = 0
    const Cell = defineComponent({
      props: { name: { type: String, default: undefined } },
      setup: (props) => {
        mounts++
        return () => h('button', props.name)
      },
    })
    const wrapper = render({
      columns: [{ ...columns[0]!, renderCell: (row) => h(Cell, { name: row.name ?? '' }) }],
    })
    const original = wrapper.findAll('tbody button').map((button) => button.element)
    await wrapper.get('thead button').trigger('click')
    expect(rowNames(wrapper)).toEqual(['Alpha', 'Beta', ''])
    expect(mounts).toBe(3)
    expect(wrapper.findAll('tbody button')[1]!.element).toBe(original[0])
  })

  it('uses custom row IDs to preserve cell instances when the source id changes', async () => {
    const wrapper = render({
      data: data.slice(0, 2),
      getRowId: (row) => row.name!,
      columns: [{ ...columns[0]!, renderCell: (row) => h('button', row.name ?? '') }],
    })
    const original = wrapper.findAll('tbody button').map((button) => button.element)
    await wrapper.setProps({
      data: [
        { id: 100, name: 'Alpha', count: 0 },
        { id: 200, name: 'Beta', count: 2 },
      ],
    })
    expect(wrapper.findAll('tbody button').map((button) => button.element)).toEqual([
      original[1],
      original[0],
    ])
    await wrapper.get('thead button').trigger('click')
    expect(wrapper.findAll('tbody button').map((button) => button.element)).toEqual([
      original[1],
      original[0],
    ])
  })

  it('consumes only the canonical source props rather than forwarding removed table props', () => {
    const wrapper = mount(DataTable<Repository>, {
      props: { data, columns },
      attrs: {
        compact: true,
        bordered: true,
        hoverable: true,
        rowClickable: true,
        emptyText: 'Empty',
        formatter: 'unused',
      },
    })
    wrappers.push(wrapper)
    for (const attribute of [
      'compact',
      'bordered',
      'hoverable',
      'rowclickable',
      'emptytext',
      'formatter',
    ]) {
      expect(wrapper.get('table').attributes(attribute)).toBeUndefined()
    }
  })

  it('toggles sorting and emits exactly once, orders blanks last in both directions, does not mutate input', async () => {
    const onToggleSort = vi.fn()
    const wrapper = render({ onToggleSort })
    const button = wrapper.get('thead button')
    await button.trigger('click')
    expect(rowNames(wrapper)).toEqual(['Alpha', 'Beta', ''])
    expect(onToggleSort).toHaveBeenCalledExactlyOnceWith('name', 'ASC')
    expect(wrapper.get('thead th').attributes('aria-sort')).toBe('ascending')
    expect(button.attributes('aria-description')).toBe('Sort descending')
    await button.trigger('click')
    expect(rowNames(wrapper)).toEqual(['Beta', 'Alpha', ''])
    expect(onToggleSort).toHaveBeenLastCalledWith('name', 'DESC')
    expect(onToggleSort).toHaveBeenCalledTimes(2)
    expect(data.map((row) => row.id)).toEqual([1, 2, 3])
    await wrapper.findAll('thead button')[1]!.trigger('click')
    expect(rowNames(wrapper)).toEqual(['Alpha', '', 'Beta'])
    expect(wrapper.get('thead th').attributes('aria-sort')).toBeUndefined()
  })

  it('treats initialSort as a declaration and sorts replacements using current state', async () => {
    const wrapper = render({ initialSortColumn: 'name', initialSortDirection: 'DESC' })
    expect(rowNames(wrapper)).toEqual(['Beta', 'Alpha', ''])
    await wrapper.setProps({
      data: [
        { id: 5, name: 'A', count: 0 },
        { id: 6, name: 'Z', count: 1 },
      ],
    })
    expect(rowNames(wrapper)).toEqual(['Z', 'A'])
    await wrapper.setProps({ columns: [{ header: 'Count', field: 'count', sortBy: true }] })
    expect(wrapper.get('thead th').attributes('aria-sort')).toBeUndefined()
    await wrapper.setProps({
      data: [
        { id: 7, name: 'A', count: 3 },
        { id: 8, name: 'B', count: 0 },
      ],
    })
    expect(wrapper.findAll('[role="cell"]').map((cell) => cell.text())).toEqual(['3', '0'])
  })

  it('does not sort initial input even when declared ascending and supports direction-only initialization', () => {
    expect(rowNames(render({ initialSortColumn: 'name' }))).toEqual(['Beta', 'Alpha', ''])
    expect(render({ initialSortDirection: 'DESC' }).get('thead th').attributes('aria-sort')).toBe(
      'descending',
    )
  })

  it('warns for invalid initial sorting and throws for columns missing an id and field', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render({ initialSortColumn: 'missing' })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Unable to find a column'))
    render({ initialSortColumn: 'name', columns: [{ header: 'Name', field: 'name' }] })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('is not sortable'))
    expect(() => render({ columns: [{ header: 'Missing' }] })).toThrow(
      'Expected either an `id` or `field`',
    )
  })

  it('supports nested fields, custom sort functions, custom row IDs and external sorting', async () => {
    const onToggleSort = vi.fn()
    const getRowId = vi.fn((row: Repository) => `custom-${row.id}`)
    const nested = [
      { id: 1, name: 'B', count: 2, owner: { login: 'second' } },
      { id: 2, name: 'A', count: 1, owner: { login: 'first' } },
    ]
    const wrapper = render({
      data: nested,
      getRowId,
      columns: [
        {
          header: 'Owner',
          field: 'owner.login',
          sortBy: (a, b) => a.count - b.count,
          rowHeader: true,
        },
      ],
    })
    expect(getRowId).toHaveBeenCalledWith(nested[0])
    await wrapper.get('thead button').trigger('click')
    expect(rowNames(wrapper)).toEqual(['first', 'second'])
    const external = render({ externalSorting: true, onToggleSort })
    await external.get('thead button').trigger('click')
    expect(rowNames(external)).toEqual(['Beta', 'Alpha', ''])
    expect(onToggleSort).toHaveBeenCalledExactlyOnceWith('name', 'ASC')
    await external.setProps({ data: data.slice().reverse() })
    expect(rowNames(external)).toEqual(['', 'Alpha', 'Beta'])
  })

  it('renders an empty body without inventing empty-state copy', () => {
    const wrapper = render({ data: [] })
    expect(wrapper.findAll('tbody')).toHaveLength(1)
    expect(wrapper.findAll('tbody tr')).toHaveLength(0)
  })
})

describe('grouped DataTable', () => {
  const mixed: DataTableData<Repository> = [
    { id: 11, name: 'Before Z', count: 1 },
    { id: 12, name: 'Before A', count: 2 },
    { groupId: 'one', label: 'First', rows: data.slice(0, 2), 'aria-label': 'Localized group' },
    { groupId: 'empty', label: 'Empty', rows: [] },
    { id: 13, name: 'After Z', count: 3 },
    { id: 14, name: 'After A', count: 4 },
  ]
  it('preserves each body, empty groups and ordinary row boundaries while sorting', async () => {
    const wrapper = render({ data: mixed })
    const bodies = wrapper.findAll('tbody')
    expect(bodies).toHaveLength(6)
    expect(
      wrapper.findAll('[data-component="Table.Group.Header"]')[0]!.attributes('aria-label'),
    ).toBe('Localized group')
    expect(wrapper.findAll('[data-component="Table.Group.Header"]')[1]!.text()).toBe('Empty,0 rows')
    await wrapper.get('thead button').trigger('click')
    expect(rowNames(wrapper)).toEqual([
      'Before A',
      'Before Z',
      'Alpha',
      'Beta',
      'After A',
      'After Z',
    ])
    expect((mixed[2] as { rows: Repository[] }).rows[0]!.id).toBe(1)
  })

  it('associates cells with the group, column and every row header without leaking to ordinary rows', async () => {
    const wrapper = render({ data: mixed })
    const groupHeader = wrapper.get('[data-component="Table.Group.Header"]').attributes('id')
    const columnHeaders = wrapper.findAll('thead th').map((header) => header.attributes('id'))
    const groupBody = wrapper.findAll('[data-component="Table.Group.Body"]')[0]!
    const firstRow = groupBody.findAll('tr')[0]!
    const rowHeader = firstRow.get('th')
    expect(rowHeader.attributes('headers')).toBe(`${groupHeader} ${columnHeaders[0]}`)
    expect(firstRow.get('td').attributes('headers')).toBe(
      `${groupHeader} ${rowHeader.attributes('id')} ${columnHeaders[1]}`,
    )
    expect(wrapper.get('tbody td').attributes('headers')).not.toContain(groupHeader)
    const ids = wrapper.findAll('[id]').map((element) => element.attributes('id'))
    expect(new Set(ids).size).toBe(ids.length)
    await wrapper.setProps({
      columns: [...columns, { id: 'second-name', header: 'Again', field: 'name', rowHeader: true }],
    })
    const row = wrapper.findAll('[data-component="Table.Group.Body"]')[0]!.findAll('tr')[0]!
    const rowHeaders = row.findAll('th').map((header) => header.attributes('id'))
    expect(row.get('td').attributes('headers')).toBe(
      `${groupHeader} ${rowHeaders.join(' ')} ${columnHeaders[1]}`,
    )
  })

  it('sorts replacement groups and preserves their accessible associations', async () => {
    const wrapper = render({ data: mixed })
    await wrapper.get('thead button').trigger('click')
    await wrapper.setProps({ data: [{ groupId: 'new', label: 'New', rows: [data[0]!, data[1]!] }] })
    expect(rowNames(wrapper)).toEqual(['Alpha', 'Beta'])
    const header = wrapper.get('[data-component="Table.Group.Header"]').attributes('id')
    expect(wrapper.get('tbody td').attributes('headers')).toContain(header)
  })
})

describe('Table composition and layout', () => {
  it('exposes the native table element through its component ref', () => {
    const wrapper = mount(Table)
    wrappers.push(wrapper)
    expect((wrapper.vm as unknown as TableInstance).element).toBe(wrapper.get('table').element)
    expect(wrapper.element).not.toBe(wrapper.get('table').element)
  })
  it('composes semantic layout, native attributes and placeholders', () => {
    const wrapper = mount(Table.Container, {
      props: { as: 'section' },
      attrs: { id: 'container' },
      slots: {
        default: () => [
          h(Table.Title, { id: 'title', as: 'h3' }, () => 'Repositories'),
          h(Table.Subtitle, { id: 'subtitle', as: 'p' }, () => 'Description'),
          h(Table.Actions, null, () => h('button', 'Create')),
          h(Table.Divider),
          h(
            Table,
            {
              'aria-labelledby': 'title',
              'aria-describedby': 'subtitle',
              gridTemplateColumns: '1fr',
              class: 'custom',
            },
            () => [
              h(Table.Head, null, () =>
                h(Table.Row, null, () =>
                  h(
                    Table.Header,
                    { 'aria-label': 'Name', 'aria-labelledby': 'name' },
                    () => 'Name',
                  ),
                ),
              ),
              h(Table.Body, null, () =>
                h(Table.Row, null, () =>
                  h(Table.Cell, { scope: 'row', class: 'custom-cell' }, () =>
                    h(Table.CellPlaceholder, null, () => 'No value'),
                  ),
                ),
              ),
            ],
          ),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.get('h3').attributes('id')).toBe('title')
    expect(wrapper.get('p').attributes('id')).toBe('subtitle')
    expect(wrapper.get('table').classes()).toContain('custom')
    expect(wrapper.get('table').attributes('style')).toContain('--grid-template-columns: 1fr')
    expect(wrapper.get('[role="columnheader"]').attributes()).toMatchObject({
      scope: 'col',
      'aria-label': 'Name',
      'aria-labelledby': 'name',
    })
    expect(wrapper.get('[role="rowheader"]').classes()).toContain('custom-cell')
    expect(wrapper.get('[data-component="Table.CellPlaceholder"]').text()).toBe('No value')
  })

  it('isolates nested tables from enclosing groups, including a group inside the inner table', () => {
    const wrapper = mount(Table, {
      slots: {
        default: () =>
          h(Table.Group, { id: 'outer', label: 'Outer', rowCount: 1, colSpan: 1 }, () =>
            h(Table.Row, null, () =>
              h(Table.Cell, null, () =>
                h(Table, { id: 'inner' }, () => [
                  h(Table.Body, null, () =>
                    h(Table.Row, null, () => h(Table.Cell, null, () => 'Ungrouped')),
                  ),
                  h(
                    Table.Group,
                    { id: 'inner-group', label: 'Inner', rowCount: 1, colSpan: 1 },
                    () => h(Table.Row, null, () => h(Table.Cell, null, () => 'Grouped')),
                  ),
                ]),
              ),
            ),
          ),
      },
    })
    wrappers.push(wrapper)
    const inner = wrapper.get('#inner')
    expect(inner.get('[data-component="Table.Body"] td').attributes('headers')).toBeUndefined()
    expect(
      inner
        .get('[data-component="Table.Group.Body"][data-group-id="inner-group"]')
        .get('td')
        .attributes('headers'),
    ).toBe(inner.get('[data-component="Table.Group.Header"]').attributes('id'))
  })

  it('renders requested skeleton rows per column, with loading text and density', () => {
    const wrapper = mount(Table.Skeleton<Repository>, {
      props: { columns, rows: 3, cellPadding: 'condensed' },
    })
    wrappers.push(wrapper)
    expect(wrapper.get('table').attributes('data-cell-padding')).toBe('condensed')
    expect(wrapper.findAll('[data-component="SkeletonText"]')).toHaveLength(6)
    expect(wrapper.findAll('tbody td')).toHaveLength(2)
    expect(wrapper.findAll('tbody td')[0]!.text()).toBe('Loading')
  })

  it('calculates grow, growCollapse, auto, explicit and bounded widths exactly', () => {
    const widths: Array<Partial<Column<Repository>>> = [
      {},
      { width: 'growCollapse' },
      { width: 'auto' },
      { width: 80 },
      { width: '25%' },
      { minWidth: 100, maxWidth: 200 },
      { width: 'grow', maxWidth: '30rem' },
      { width: 'auto', minWidth: '10rem' },
    ]
    expect(
      getGridTemplateFromColumns(
        widths.map((width) => ({ ...width, header: 'Name', field: 'name' })),
      ),
    ).toEqual([
      'minmax(max-content, 1fr)',
      'minmax(0, 1fr)',
      'auto',
      '80px',
      '25%',
      'minmax(100px, 200px)',
      'minmax(auto, 30rem)',
      'minmax(10rem, auto)',
    ])
  })
  it('keeps numeric, date and natural sort strategies', () => {
    expect([10, 1, 2].sort(basic)).toEqual([1, 2, 10])
    expect(['item10', 'item2', 'item1'].sort(alphanumeric)).toEqual(['item1', 'item2', 'item10'])
    expect(datetime(new Date(10), new Date(20))).toBe(-1)
    expect(datetime(20, 10)).toBe(1)
  })
  it('updates reactive data without replacing the table element', async () => {
    const rows = ref(data)
    const wrapper = mount(
      defineComponent({
        setup: () => () => h(DataTable<Repository>, { data: rows.value, columns }),
      }),
    )
    wrappers.push(wrapper)
    const table = wrapper.get('table').element
    rows.value = [{ id: 4, name: 'New', count: 1 }]
    await nextTick()
    expect(rowNames(wrapper)).toEqual(['New'])
    expect(wrapper.get('table').element).toBe(table)
  })
})
