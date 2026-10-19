import type { CSSProperties } from 'vue'

type Viewport = 'narrow' | 'regular' | 'wide'

export interface HiddenProps {
  when: Viewport[] | Viewport
  className?: string
  style?: CSSProperties
}
