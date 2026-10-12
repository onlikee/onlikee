import BranchNameComponent from './BranchName.vue'
import type { AllowedComponentProps, Component, NativeElements, VNodeProps } from 'vue'
import type { BranchNameComponentProps } from './types'

export const BranchName = BranchNameComponent as <
  As extends keyof NativeElements | Component = 'a',
>(
  props: BranchNameComponentProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof BranchNameComponent<As>>
export default BranchName
export type { BranchNameProps, BranchNameElement, BranchNameInstance } from './types'
