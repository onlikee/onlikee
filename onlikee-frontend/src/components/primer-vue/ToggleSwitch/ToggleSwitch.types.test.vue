<script setup lang="ts">
import { shallowRef } from 'vue'
import { ToggleSwitch, type ToggleSwitchProps, type ToggleSwitchInstance } from './index'

const toggle = shallowRef<ToggleSwitchInstance | null>(null)
const props: ToggleSwitchProps = {
  'aria-labelledby': 'label',
  'aria-describedby': 'caption',
  defaultChecked: true,
  checked: false,
  size: 'small',
  statusLabelPosition: 'end',
  buttonType: 'submit',
  loadingLabelDelay: 500,
  onChange: (checked) => checked.valueOf(),
  onClick: (event) => event.preventDefault(),
  onKeydown: (event) => event.preventDefault(),
  title: 'Setting',
}
// @ts-expect-error A labeling ID is required.
const missingLabel: ToggleSwitchProps = {}
// @ts-expect-error The source has only small and medium sizes.
const invalidSize: ToggleSwitchProps = { 'aria-labelledby': 'label', size: 'large' }
const invalidChange: ToggleSwitchProps = {
  'aria-labelledby': 'label',
  // @ts-expect-error Changes carry a boolean rather than a DOM change event.
  onChange: (_event: Event) => {},
}
const invalidPosition: ToggleSwitchProps = {
  'aria-labelledby': 'label',
  // @ts-expect-error Position follows DataTable CellAlignment.
  statusLabelPosition: 'center',
}
void [toggle, missingLabel, invalidSize, invalidChange, invalidPosition]
</script>

<template>
  <ToggleSwitch ref="toggle" v-bind="props" />
  <ToggleSwitch aria-labelledby="label" @change="(checked) => checked.valueOf()" />
  <!-- @vue-expect-error The accessible labeling ID is required. -->
  <ToggleSwitch />
  <!-- @vue-expect-error Only source sizes are accepted. -->
  <ToggleSwitch aria-labelledby="label" size="large" />
  <!-- @vue-expect-error Invalid native button type. -->
  <ToggleSwitch aria-labelledby="label" button-type="switch" />
</template>
