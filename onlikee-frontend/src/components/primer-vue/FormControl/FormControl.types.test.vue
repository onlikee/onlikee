<script setup lang="ts">
import { FormControl, FormControlLabel } from './index'
</script>

<template>
  <FormControl required layout="vertical">
    <FormControl.Label html-for="field">Name</FormControl.Label>
    <input id="field" />
    <FormControl.Caption>Help</FormControl.Caption>
    <FormControl.Validation variant="error">Invalid</FormControl.Validation>
  </FormControl>
  <FormControl.Label as="span">Name</FormControl.Label>
  <FormControlLabel as="legend">Options</FormControlLabel>
  <!-- @vue-expect-error Only labels support htmlFor. -->
  <FormControl.Label as="span" html-for="field">Name</FormControl.Label>
  <!-- @vue-expect-error Legends do not support htmlFor. -->
  <FormControlLabel as="legend" html-for="field">Options</FormControlLabel>
  <!-- @vue-expect-error Validation requires an explicit status. -->
  <FormControl.Validation>Invalid</FormControl.Validation>
  <!-- @vue-expect-error Layout is limited to horizontal and vertical. -->
  <FormControl layout="inline" />
</template>
