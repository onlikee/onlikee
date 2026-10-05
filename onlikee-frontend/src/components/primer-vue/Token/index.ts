/* 源 Token/index.ts 导出面镜像（tokenSizes/defaultTokenSize 额外经 index 导出为
   良性超集——源只从 constants.ts 导出，审计 G1 已核）。 */
export { default } from './Token.vue'
export { default as Token } from './Token.vue'
export { default as IssueLabelToken } from './IssueLabelToken.vue'
export type { TokenBaseProps, TokenProps, IssueLabelTokenProps, TokenSizeKeys } from './types'
export { tokenSizes, defaultTokenSize } from './types'
