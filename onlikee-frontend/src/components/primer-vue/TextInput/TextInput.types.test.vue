<script setup lang="ts">
import { shallowRef } from 'vue'
import { SearchIcon } from '@onlikee/octicons-vue'
import { TextInput } from './index'
import { Textarea } from '../Textarea'
const value = shallowRef('')
</script>

<template>
  <TextInput
    v-model:value="value"
    name="search"
    autocomplete="off"
    aria-label="Search"
    :leading-visual="SearchIcon"
  >
    <template #trailingAction><TextInput.Action :icon="SearchIcon" aria-label="Find" /></template>
  </TextInput>
  <Textarea v-model:value="value" name="description" :maxlength="100" auto-size :min-height="60" />
  <!-- @vue-expect-error input sizing is semantic -->
  <TextInput :size="5" />
  <!-- @vue-expect-error unsupported resize -->
  <Textarea resize="auto" />
  <!-- @vue-expect-error native button type -->
  <TextInput.Action type="invalid" />
</template>
