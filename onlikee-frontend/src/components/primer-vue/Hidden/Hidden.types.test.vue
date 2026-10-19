<script setup lang="ts">
import { Hidden, type HiddenProps } from './index'

const props: HiddenProps = { when: ['narrow', 'wide'], style: { '--hiddenDisplay-wide': 'flex' } }
</script>

<template>
  <Hidden when="narrow">Content</Hidden>
  <Hidden :when="['regular', 'wide']" class="vue-class" class-name="source-class">Content</Hidden>
  <Hidden v-bind="props" />
  <Hidden :when="[]" />
  <!-- @vue-expect-error The when prop is required. -->
  <Hidden />
  <!-- @vue-expect-error Only the source viewport names are supported. -->
  <Hidden when="small" />
  <!-- @vue-expect-error Every array item must be a supported viewport. -->
  <Hidden :when="['narrow', 'large']" />
  <!-- @vue-expect-error Hidden does not accept responsive objects. -->
  <Hidden :when="{ narrow: true }" />
</template>
