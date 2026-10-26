<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { GitBranchIcon } from '@onlikee/octicons-vue'
import Token, {
  IssueLabelToken,
  type TokenProps,
  type IssueLabelTokenProps,
  type TokenInstance,
} from './index'
import TextInputWithTokens, { type TextInputWithTokensProps } from '../TextInputWithTokens'

const token = shallowRef<TokenInstance | null>(null)
const props: TokenProps = {
  text: ['Text ', h('strong', 'node')],
  as: 'button',
  id: 42,
  type: 'button',
  tabindex: 0,
  leadingVisual: GitBranchIcon,
  onRemove: () => {},
  onClick: (event) => event.preventDefault(),
  onKeydown: (event) => event.preventDefault(),
  onResize: (event) => event.preventDefault(),
  onResizeCapture: (event) => event.preventDefault(),
}
const issue: IssueLabelTokenProps = { text: 'bug', fillColor: 'lightpink', href: '#issue' }
const custom: TextInputWithTokensProps<typeof IssueLabelToken> = {
  tokenComponent: IssueLabelToken,
  tokens: [issue],
}
// @ts-expect-error Text is required.
const noText: TokenProps = {}
// @ts-expect-error Leading visuals are components or native element types.
const invalidVisual: TokenProps = { text: 'Text', leadingVisual: 42 }
// @ts-expect-error IssueLabelToken has no leadingVisual.
const wrongExtension: IssueLabelTokenProps = { text: 'Text', leadingVisual: GitBranchIcon }
// @ts-expect-error Token has no system style props.
const systemProps: TokenProps = { text: 'Text', backgroundColor: 'red' }
void [token, custom, noText, invalidVisual, wrongExtension, systemProps]
</script>

<template>
  <Token ref="token" v-bind="props" />
  <Token text="Native visual" leading-visual="i" />
  <IssueLabelToken v-bind="issue" @remove="() => {}" />
  <TextInputWithTokens v-bind="custom" />
  <!-- @vue-expect-error Text is required. -->
  <Token />
  <!-- @vue-expect-error The supported root elements are span, a and button. -->
  <Token text="Text" as="div" />
  <!-- @vue-expect-error Size is restricted to the source union. -->
  <Token text="Text" size="huge" />
  <!-- @vue-expect-error Fill colors must be strings. -->
  <IssueLabelToken text="Text" :fill-color="123" />
</template>
