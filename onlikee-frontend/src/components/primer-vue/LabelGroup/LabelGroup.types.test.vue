<script setup lang="ts">
import { LabelGroup, type LabelGroupProps } from './index'
const props: LabelGroupProps = {
  as: 'ol',
  visibleChildCount: 'auto',
  overflowStyle: 'inline',
  className: 'labels',
}
// @ts-expect-error LabelGroup does not accept native attributes.
const native: LabelGroupProps = { id: 'labels' }
// @ts-expect-error LabelGroup does not accept a style prop.
const styled: LabelGroupProps = { style: { gap: '8px' } }
// @ts-expect-error LabelGroup does not expose native event handlers.
const event: LabelGroupProps = { onClick: () => {} }
void native
void styled
void event
</script>
<template>
  <LabelGroup v-bind="props" />
  <LabelGroup class="labels" />
  <!-- @vue-expect-error The container must be an intrinsic element or component. -->
  <LabelGroup :as="42" />
  <!-- @vue-expect-error Only inline and overlay overflow modes exist. -->
  <LabelGroup overflow-style="dialog" />
</template>
