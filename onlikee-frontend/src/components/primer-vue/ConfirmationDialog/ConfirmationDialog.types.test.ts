import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  ConfirmationDialog,
  useConfirm,
  type ConfirmationDialogProps,
  type ConfirmOptions,
} from './index'

type ActualProps = InstanceType<typeof ConfirmationDialog>['$props']
const onClose: ConfirmationDialogProps['onClose'] = () => {}
const valid: ActualProps = {
  title: h('strong', 'Delete?'),
  onClose,
  width: '80rem',
  height: 'small',
  confirmButtonType: 'danger',
  overrideButtonFocus: 'cancel',
}
// @ts-expect-error The title remains required on the actual SFC.
const missingTitle: ActualProps = { onClose }
// @ts-expect-error The close callback remains required on the actual SFC.
const missingOnClose: ActualProps = { title: 'Delete?' }
// @ts-expect-error The original component has no open prop; mount conditionally.
const extraOpen: ActualProps = { title: 'Delete?', onClose, open: true }
// @ts-expect-error ConfirmationDialog only accepts normal, primary, and danger.
const invalidVariant: ActualProps = { title: 'Delete?', onClose, confirmButtonType: 'default' }
// @ts-expect-error Initial focus can only target the cancel or confirm button.
const invalidFocus: ActualProps = { title: 'Delete?', onClose, overrideButtonFocus: 'close' }
// @ts-expect-error Height uses Dialog's three preset values.
const invalidHeight: ActualProps = { title: 'Delete?', onClose, height: 'medium' }
const validOptions: ConfirmOptions = {
  title: 'Delete?',
  content: h('p', 'Content'),
  confirmButtonLoading: true,
}
// @ts-expect-error Programmatic confirmations require content.
const missingContent: ConfirmOptions = { title: 'Delete?' }
// @ts-expect-error The hook owns the close callback and Promise settlement.
const extraCallback: ConfirmOptions = { title: 'Delete?', content: 'Content', onClose }
const confirm: (options: ConfirmOptions) => Promise<boolean> = useConfirm()

describe('ConfirmationDialog type contract', () => {
  it('keeps the required props, restricted unions and Promise options', () => {
    expect(valid.title).toBeDefined()
    expect(validOptions.content).toBeDefined()
    expect(typeof confirm).toBe('function')
    void [
      missingTitle,
      missingOnClose,
      extraOpen,
      invalidVariant,
      invalidFocus,
      invalidHeight,
      missingContent,
      extraCallback,
    ]
  })
})
