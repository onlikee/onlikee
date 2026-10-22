import type { InjectionKey } from 'vue'

export const segmentedControlActionContext: InjectionKey<'inline' | 'menu'> =
  Symbol('SegmentedControl.Action')
