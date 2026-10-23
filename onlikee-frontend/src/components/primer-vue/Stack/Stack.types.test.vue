<script setup lang="ts">
import { Stack } from './index'
import { Button } from '../Button'
import { StateLabel } from '../StateLabel'
</script>

<template>
  <Stack as="a" href="#target" direction="horizontal">
    <Stack.Item as="button" type="button" :grow="{ regular: true }">Action</Stack.Item>
  </Stack>
  <Stack :as="Button" variant="primary">Action</Stack>
  <Stack :as="StateLabel" status="issueOpened">Open</Stack>
  <!-- @vue-expect-error invalid spacing -->
  <Stack gap="huge" />
  <!-- @vue-expect-error invalid native button type -->
  <Stack.Item as="button" type="invalid" />
  <!-- @vue-expect-error StateLabel requires a status -->
  <Stack :as="StateLabel" />
</template>
