import type { HTMLAttributes } from 'vue'
import type { NodeProp } from '../internal/renderNode'

interface InlineMessageOptions {
  size?: 'small' | 'medium'
  variant?: 'critical' | 'success' | 'unavailable' | 'warning'
  leadingVisual?: NodeProp
  className?: string
}

type NativeAttributes = {
  [Key in keyof HTMLAttributes as string extends Key ? never : Key]: HTMLAttributes[Key]
}

export type InlineMessageProps = InlineMessageOptions & NativeAttributes

// Native attributes remain in the public type and are forwarded through $attrs.
export type InlineMessageComponentProps = InlineMessageOptions &
  /* @vue-ignore */ Omit<InlineMessageProps, keyof InlineMessageOptions>
