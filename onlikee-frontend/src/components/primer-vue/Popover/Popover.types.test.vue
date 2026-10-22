<script setup lang="ts">
import { shallowRef } from 'vue'
import Popover, {
  PopoverContent,
  type PopoverProps,
  type PopoverContentProps,
  type PopoverInstance,
} from './index'

const root: PopoverProps = {
  as: 'section',
  caret: 'right-bottom',
  open: true,
  relative: true,
  'aria-label': 'Popover',
}
const content: PopoverContentProps = {
  as: 'article',
  width: 'xlarge',
  height: 'fit-content',
  overflow: 'auto',
  ignoreClickRefs: [shallowRef<HTMLElement | null>(null)],
  onEscape: (event) => event.preventDefault(),
  onClickOutside: (event) => event.preventDefault(),
}
const rootRef = shallowRef<PopoverInstance | null>(null)
const inferredRef = shallowRef<InstanceType<typeof Popover> | null>(null)
// @ts-expect-error Unsupported caret.
const invalidCaret: PopoverProps = { caret: 'center' }
// @ts-expect-error System props are not supported.
const invalidRoot: PopoverProps = { backgroundColor: 'palegreen' }
// @ts-expect-error System props are not supported.
const invalidContent: PopoverContentProps = { backgroundColor: 'paleturquoise' }
// @ts-expect-error Content width uses named sizes.
const invalidWidth: PopoverContentProps = { width: 100 }
void [invalidCaret, invalidRoot, invalidContent, invalidWidth]
</script>

<template>
  <Popover />
  <Popover ref="rootRef" v-bind="root" @click="rootRef?.element?.focus()">
    <Popover.Content v-bind="content">Content</Popover.Content>
  </Popover>
  <Popover ref="inferredRef" @click="inferredRef?.element?.focus()">
    <PopoverContent width="auto" height="auto" overflow="visible" />
  </Popover>
  <!-- @vue-expect-error System props are not supported. -->
  <Popover v-bind="{ backgroundColor: 'palegreen' } satisfies PopoverProps" />
  <!-- @vue-expect-error System props are not supported. -->
  <Popover.Content v-bind="{ backgroundColor: 'paleturquoise' } satisfies PopoverContentProps" />
  <!-- @vue-expect-error Unsupported caret. -->
  <Popover caret="center" />
  <!-- @vue-expect-error Content width uses named sizes. -->
  <Popover.Content :width="100" />
  <!-- @vue-expect-error Height does not support initial. -->
  <Popover.Content height="initial" />
</template>
