import type { ButtonHTMLAttributes, HTMLAttributes, Ref } from 'vue'

export type TabsProps = {
  id?: string
  activationMode?: 'automatic' | 'manual'
} & (
  | { value: string; defaultValue?: never; onValueChange: (selection: { value: string }) => void }
  | { value?: never; defaultValue: string; onValueChange?: (selection: { value: string }) => void }
)

export type TabListProps = HTMLAttributes &
  ({ 'aria-label': string } | { 'aria-labelledby': string })
export type TabProps = ButtonHTMLAttributes & { value: string; disabled?: boolean }
export type TabPanelProps = { value: string }
export type TabListHookProps<T extends HTMLElement> = TabListProps & {
  ref?: Ref<T | null> | ((element: T | null) => void)
}
