<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  Dialog,
  type DialogSectionProps,
  type DialogHeadingProps,
  type DialogSectionInstance,
  type DialogProps,
  type DialogInstance,
} from './index'
import { Button } from '../Button'
import type { ButtonInstance } from '../Button/types'
import { ActionList } from '../ActionList'
import { AnchoredOverlay, type FocusTrapSettings } from '../AnchoredOverlay'

const body = shallowRef<DialogSectionInstance | null>(null)
void body.value
const linkBody: DialogSectionProps<'a'> = { as: 'a', href: '#section' }
// @ts-expect-error Native div props do not include href.
const invalidBody: DialogSectionProps = { href: '#section' }
// @ts-expect-error Title and Subtitle have fixed heading tags.
const invalidTitle: DialogHeadingProps = { as: 'div' }
void invalidBody
void invalidTitle
type ActualProps = InstanceType<typeof Dialog>['$props']
const onClose: DialogProps['onClose'] = () => {}
const root = shallowRef<DialogInstance | null>(null)
const componentTarget = shallowRef<ButtonInstance | null>(null)
const itemTarget = shallowRef<InstanceType<typeof ActionList.LinkItem> | null>(null)
const focusProps: Pick<DialogProps, 'initialFocusRef' | 'returnFocusRef'> = {
  initialFocusRef: itemTarget,
  returnFocusRef: componentTarget,
}
const focusTrapSettings: FocusTrapSettings = focusProps
// @ts-expect-error A focus method alone does not identify the DOM element for containment checks.
const invalidFocus: DialogProps = { onClose, initialFocusRef: shallowRef({ focus() {} }) }
const invalidDirectFocus: DialogProps = {
  onClose,
  // @ts-expect-error A direct element must be wrapped in a ref.
  returnFocusRef: document.createElement('button'),
}
void [invalidFocus, invalidDirectFocus]
void root.value
const valid: ActualProps = {
  onClose,
  position: { narrow: 'bottom', regular: 'right', wide: 'fullscreen' },
  width: 420,
  'data-component': 'Custom',
}
// @ts-expect-error The close callback is required on the SFC.
const missingClose: ActualProps = {}
// @ts-expect-error Dialog is conditionally mounted and has no open prop.
const invalidOpen: ActualProps = { onClose, open: true }
// @ts-expect-error bottom is only allowed in the responsive object.
const invalidPosition: ActualProps = { onClose, position: 'bottom' }
// @ts-expect-error Source close gestures do not contain backdrop.
const invalidClose: DialogProps['onClose'] = (_gesture: 'backdrop') => {}
void [missingClose, invalidOpen, invalidPosition, invalidClose]
</script>

<template>
  <Dialog ref="root" v-bind="valid">Body</Dialog>
  <Button ref="componentTarget">Return focus</Button>
  <Dialog :on-close="onClose" v-bind="focusProps">
    <ActionList
      ><ActionList.LinkItem ref="itemTarget" href="#item"
        >Initial focus</ActionList.LinkItem
      ></ActionList
    >
  </Dialog>
  <AnchoredOverlay
    :open="true"
    :render-anchor="() => null"
    :focus-trap-settings="focusTrapSettings"
  />
  <!-- @vue-expect-error onClose is required. -->
  <Dialog title="Missing close" />
  <Dialog.Header id="header" as="section"><Dialog.Title>Title</Dialog.Title></Dialog.Header>
  <Dialog.Body ref="body" v-bind="linkBody">Link body</Dialog.Body>
  <Dialog.Footer as="section"><button>Close</button></Dialog.Footer>
  <!-- @vue-expect-error as accepts a native element name or component. -->
  <Dialog.Body :as="42">Invalid</Dialog.Body>
</template>
