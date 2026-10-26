import type { HTMLAttributes } from 'vue'
import type { CellAlignment } from '../DataTable/column'

export interface ToggleSwitchProps extends /* @vue-ignore */ Omit<
  HTMLAttributes,
  'onChange' | 'onClick'
> {
  'aria-labelledby': string
  'aria-describedby'?: string
  defaultChecked?: boolean
  disabled?: boolean
  loading?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
  onClick?: (event: MouseEvent) => void
  size?: 'small' | 'medium'
  statusLabelPosition?: CellAlignment
  loadingLabelDelay?: number
  loadingLabel?: string
  buttonType?: 'button' | 'submit' | 'reset'
  buttonLabelOn?: string
  buttonLabelOff?: string
  className?: string
}

export interface ToggleSwitchInstance {
  element: HTMLButtonElement | null
}
