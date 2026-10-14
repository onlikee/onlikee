import { createApp, h } from 'vue'
import ConfirmationDialog from './ConfirmationDialog.vue'
import type { ConfirmOptions, ConfirmationDialogProps } from './types'
import classes from './BaseStyles.module.css'

let confirmationRootId = 0

/** Return a function that resolves true only when the confirm button is used. */
export function useConfirm() {
  return async (options: ConfirmOptions): Promise<boolean> => {
    const { content, ...props } = options
    return new Promise((resolve) => {
      const hostElement = document.createElement('div')
      document.body.append(hostElement)
      const onClose: ConfirmationDialogProps['onClose'] = (gesture) => {
        app.unmount()
        hostElement.remove()
        resolve(gesture === 'confirm')
      }
      const app = createApp({
        render: () =>
          h(
            'div',
            { class: classes.BaseStyles, 'data-component': 'BaseStyles', 'data-portal-root': '' },
            [h(ConfirmationDialog, { ...props, onClose }, { default: () => content })],
          ),
      })
      // Vue's useId counter is per app; independent roots need distinct prefixes.
      app.config.idPrefix = `confirmation-${confirmationRootId++}`
      app.mount(hostElement)
    })
  }
}
