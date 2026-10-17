import { expect, expectTypeOf, it } from 'vitest'
import { createColumnHelper, type Column, type ObjectPaths } from './index'

it('preserves nested, optional, union and tuple paths without expanding arrays and dates', () => {
  expectTypeOf<ObjectPaths<{ id: number; owner: { login: string } }>>().toEqualTypeOf<
    'id' | 'owner' | 'owner.login'
  >()
  expectTypeOf<ObjectPaths<{ owner?: { login: string } }>>().toEqualTypeOf<
    'owner' | 'owner.login'
  >()
  expectTypeOf<ObjectPaths<{ id: number } | { name: string }>>().toEqualTypeOf<'id' | 'name'>()
  expectTypeOf<ObjectPaths<{ owners: readonly [string, { login: string }] }>>().toEqualTypeOf<
    'owners' | 'owners.0' | 'owners.1' | 'owners.1.login'
  >()
  expectTypeOf<ObjectPaths<{ createdAt: Date; names: string[] }>>().toEqualTypeOf<
    'createdAt' | 'names'
  >()
  expectTypeOf<ObjectPaths<unknown>>().toEqualTypeOf<never>()
  expectTypeOf<ObjectPaths<never>>().toEqualTypeOf<never>()
})

it('preserves dynamic object paths without recursive any expansion', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectTypeOf<ObjectPaths<any>>().toEqualTypeOf<string | number>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectTypeOf<ObjectPaths<{ id: number; metadata: any }>>().toEqualTypeOf<
    'id' | 'metadata' | `metadata.${string}`
  >()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectTypeOf<Column<any>['field']>().toEqualTypeOf<string | number | undefined>()
})

it('normalizes column helper IDs without changing render callbacks', () => {
  const helper = createColumnHelper<{ id: number; owner: { login: string } }>()
  const renderCell = (row: { id: number; owner: { login: string } }) => row.owner.login
  const input = { header: 'Owner', field: 'owner.login' as const, renderCell }
  const column = helper.column(input)
  expect(column.id).toBe('owner.login')
  expect(column.renderCell).toBe(renderCell)
  expect(input).not.toHaveProperty('id')
  expect(helper.column({ id: 'explicit', header: 'Owner', field: 'owner.login' }).id).toBe(
    'explicit',
  )
  const numericHelper = createColumnHelper<{ id: number; 0: string }>()
  expect(numericHelper.column({ header: 'Numeric path', field: 0 }).id).toBe(0)
})
