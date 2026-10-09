import { describe, expect, expectTypeOf, it } from 'vitest'
import { shallowRef } from 'vue'
import type { ItemInput } from '../FilteredActionList/types'
import type { SelectPanelProps } from './types'
describe('SelectPanel source contracts', () => {
  it('ties selection callbacks to their single or multi shape', () => {
    const single: SelectPanelProps = {
      open: false,
      items: [],
      selected: undefined,
      onSelectedChange: (selection: ItemInput | undefined) => selection,
    }
    const multi: SelectPanelProps = {
      open: false,
      items: [],
      selected: [],
      onSelectedChange: (selection: ItemInput[]) => selection,
    }
    // @ts-expect-error Single selection must not require an array callback.
    const invalid: SelectPanelProps = {
      open: false,
      items: [],
      selected: undefined,
      onSelectedChange: (selection: ItemInput[]) => selection,
    }
    expect(single.selected).toBeUndefined()
    expect(multi.selected).toEqual([])
    expect(invalid.onSelectedChange).toBeTypeOf('function')
  })
  it('retains single/multi selected shapes and requires modal cancel and detached anchors', () => {
    const single = { open: false, items: [], selected: undefined } satisfies SelectPanelProps
    const multi = { open: false, items: [], selected: [] as ItemInput[] } satisfies SelectPanelProps
    const modal = {
      open: true,
      items: [],
      selected: undefined,
      variant: 'modal',
      onCancel: () => undefined,
    } satisfies SelectPanelProps
    const detached = {
      open: true,
      items: [],
      selected: undefined,
      renderAnchor: null,
      anchorRef: shallowRef<HTMLElement | null>(null),
    } satisfies SelectPanelProps
    expectTypeOf(multi.selected).toEqualTypeOf<ItemInput[]>()
    expect(single.open).toBe(false)
    expect(modal.variant).toBe('modal')
    expect(detached.anchorRef.value).toBeNull()
    // @ts-expect-error Modal variants require a cancellation handler.
    const invalidModal: SelectPanelProps = {
      open: true,
      items: [],
      selected: undefined,
      variant: 'modal',
    }
    // @ts-expect-error Detached anchors require a DOM ref.
    const invalidDetached: SelectPanelProps = {
      open: true,
      items: [],
      selected: undefined,
      renderAnchor: null,
    }
    expect(invalidModal.variant).toBe('modal')
    expect(invalidDetached.renderAnchor).toBeNull()
  })
})
