import { describe, expect, it } from 'vitest'
import { h, shallowRef } from 'vue'
import AnchoredOverlay from './AnchoredOverlay.vue'
import type { AnchoredOverlayProps, AnchorRenderProps, OverlayProps } from './types'

type ComponentProps = InstanceType<typeof AnchoredOverlay>['$props']
const renderAnchor = (props: AnchorRenderProps) => h('button', props, 'Open')
const detachedAnchor = shallowRef<HTMLElement | null>(null)
const rendered: ComponentProps = { open: false, renderAnchor }
const detached: ComponentProps = { open: false, renderAnchor: null, anchorRef: detachedAnchor }
const customOverlay: ComponentProps = {
  open: false,
  renderAnchor,
  overlayProps: { 'data-component': 'CustomOverlay', 'data-test-id': 'sample' },
}
const overlayData: OverlayProps = { 'data-component': 'CustomOverlay', 'data-test-id': 'sample' }
// @ts-expect-error Detached anchors require their external ref on the actual SFC.
const missingRef: ComponentProps = { open: false, renderAnchor: null }
// @ts-expect-error The public component requires renderAnchor.
const missingRenderer: ComponentProps = { open: false }
// @ts-expect-error The exported public type retains the same detached-anchor constraint.
const missingPublicRef: AnchoredOverlayProps = { open: false, renderAnchor: null }

// @ts-expect-error Positioning belongs to AnchoredOverlay, not the inner React Overlay contract.
const legacyAnchor: OverlayProps = { anchor: null }
// @ts-expect-error The inner Overlay does not own the independent FocusTrap.
const legacyTrap: OverlayProps = { trapFocus: true }

describe('AnchoredOverlay source type contract', () => {
  it('uses the same anchor discriminant on the public type and the SFC', () => {
    expect(customOverlay.overlayProps?.['data-component']).toBe('CustomOverlay')
    expect(overlayData['data-test-id']).toBe('sample')
    expect(rendered.renderAnchor).toBe(renderAnchor)
    expect(detached.anchorRef).toBe(detachedAnchor)
    expect(missingRef.renderAnchor).toBeNull()
    expect(missingRenderer.open).toBe(false)
    expect(missingPublicRef.renderAnchor).toBeNull()
    expect(legacyAnchor).toEqual({ anchor: null })
    expect(legacyTrap).toEqual({ trapFocus: true })
  })
})
