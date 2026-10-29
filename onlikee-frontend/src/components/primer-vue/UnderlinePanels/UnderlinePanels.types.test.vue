<script setup lang="ts">
import { CodeIcon } from '@onlikee/octicons-vue'
import { UnderlinePanels, type UnderlinePanelsProps, type UnderlinePanelsTabProps } from './index'
import { Tabs, type TabsProps } from '../Tabs'

const root: UnderlinePanelsProps = { value: 'code', onChange: ({ value }) => void value, as: 'nav' }
const tab: UnderlinePanelsTabProps = { value: 'code', icon: CodeIcon, counter: 0 }
const controlled: TabsProps = { value: 'a', onValueChange: ({ value }) => void value }
const uncontrolled: TabsProps = { defaultValue: 'a' }
// @ts-expect-error Controlled Tabs requires a change handler.
const missingHandler: TabsProps = { value: 'a' }
// @ts-expect-error Controlled and default values are exclusive.
const conflicting: TabsProps = { value: 'a', defaultValue: 'b', onValueChange: () => {} }
// @ts-expect-error Use the source icon API.
const oldIcon: UnderlinePanelsTabProps = { leadingVisual: CodeIcon }
void missingHandler
void conflicting
void oldIcon
</script>

<template>
  <UnderlinePanels v-bind="root">
    <UnderlinePanels.Tab v-bind="tab" @select="(event) => event.preventDefault()"
      >Code</UnderlinePanels.Tab
    >
    <UnderlinePanels.Panel value="code" class-name="panel" aria-label="Files" />
  </UnderlinePanels>
  <Tabs v-bind="controlled" />
  <Tabs v-bind="uncontrolled" />
  <!-- @vue-expect-error Activation mode is a closed union. -->
  <UnderlinePanels activation-mode="invalid" />
  <!-- @vue-expect-error Counter must be a number or string. -->
  <UnderlinePanels.Tab :counter="{}" />
  <!-- @vue-expect-error Controlled Tabs requires a change handler. -->
  <Tabs value="a" />
</template>
