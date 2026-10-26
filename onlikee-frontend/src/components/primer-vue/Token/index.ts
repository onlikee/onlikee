import TokenRoot from './Token.vue'
import IssueLabelTokenRoot from './IssueLabelToken.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { TokenProps, IssueLabelTokenProps, TokenInstance } from './types'

type TokenComponent<
  Component extends abstract new (...args: never[]) => object,
  Props,
> = new () => Omit<InstanceType<Component>, '$props'> &
  TokenInstance & {
    $props: Props & AllowedComponentProps & VNodeProps
  }

export const Token = TokenRoot as unknown as TokenComponent<typeof TokenRoot, TokenProps>
export const IssueLabelToken = IssueLabelTokenRoot as unknown as TokenComponent<
  typeof IssueLabelTokenRoot,
  IssueLabelTokenProps
>
export default Token
export type { TokenProps, IssueLabelTokenProps, TokenSizeKeys, TokenInstance } from './types'
