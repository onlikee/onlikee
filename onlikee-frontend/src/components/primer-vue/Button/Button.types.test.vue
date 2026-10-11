<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { Button, ButtonBase, IconButton, LinkButton } from './index'

const Icon = defineComponent({ render: () => h('svg') })
</script>

<template>
  <Button>Save</Button>
  <Button as="a" href="/save">Save</Button>
  <ButtonBase>Base button</ButtonBase>
  <ButtonBase as="a" href="/base">Base link</ButtonBase>
  <LinkButton href="/save">Save</LinkButton>
  <IconButton :icon="Icon" aria-label="Close" />
  <IconButton as="a" href="/open" :icon="Icon" aria-label="Open" />

  <!-- @vue-expect-error The default Button root is a button and rejects anchor-only attributes. -->
  <Button href="/save" />
  <!-- @vue-expect-error Selecting a native button keeps its native attributes. -->
  <Button as="button" href="/save" />
  <!-- @vue-expect-error ButtonBase defaults to a button and rejects anchor-only attributes. -->
  <ButtonBase href="/base" />
  <!-- @vue-expect-error IconButton defaults to a button and rejects anchor-only attributes. -->
  <IconButton :icon="Icon" aria-label="Open" href="/open" />
  <!-- @vue-expect-error IconButton requires an accessible name. -->
  <IconButton :icon="Icon" />
</template>
