<script setup lang="ts">
import Admonition, { type AdmonitionProps, type AdmonitionType } from './index'

const type: AdmonitionType = 'warning'
const props: AdmonitionProps = { type, titleAs: 'h3', typeLabel: '警告', 'aria-label': '须知' }
// @ts-expect-error Native anchor-only attributes do not belong on a div.
const invalidProps: AdmonitionProps = { href: '/details' }
void invalidProps
</script>

<template>
  <Admonition v-bind="props" id="message" @click="(event: MouseEvent) => event.preventDefault()">
    <template #title>配置 <code>config.yaml</code></template>
    正文
  </Admonition>
  <Admonition title="文本标题" title-as="div" class-name="message" />

  <!-- @vue-expect-error Only the documented semantic types are supported. -->
  <Admonition type="danger" />
  <!-- @vue-expect-error Titles can only use a neutral div or a native heading. -->
  <Admonition title-as="button" />
</template>
