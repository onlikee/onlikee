<script setup lang="ts">
import { Text } from './index'
import { Button } from '../Button'
import { StateLabel } from '../StateLabel'
</script>

<template>
  <Text as="a" href="#content">Link</Text>
  <Text as="label" for="field">Label</Text>
  <Text :as="Button" variant="primary">Save</Text>
  <Text :as="StateLabel" status="issueOpened">Open</Text>
  <!-- @vue-expect-error unsupported size -->
  <Text size="huge" />
  <!-- @vue-expect-error invalid native button type -->
  <Text as="button" type="invalid" />
  <!-- @vue-expect-error required custom component prop -->
  <Text :as="StateLabel" />
</template>
