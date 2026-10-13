<script setup lang="ts">
import { shallowRef } from 'vue'
import { Checkbox, type CheckboxProps, type CheckboxInstance } from './index'
const checkbox = shallowRef<CheckboxInstance | null>(null)
const props: CheckboxProps = {
  value: 'one',
  name: 'choices',
  defaultChecked: true,
  required: true,
  validationStatus: 'error',
  'aria-label': 'Choice',
}
// @ts-expect-error Values are strings.
const invalidValue: CheckboxProps = { value: 1 }
// @ts-expect-error Only error and success are supported.
const invalidValidation: CheckboxProps = { validationStatus: 'warning' }
void [invalidValue, invalidValidation]
</script>

<template>
  <Checkbox ref="checkbox" v-bind="props" @change="checkbox?.element?.focus()" />
  <!-- @vue-expect-error Values are strings. -->
  <Checkbox :value="1" />
  <!-- @vue-expect-error Only error and success are supported. -->
  <Checkbox validation-status="warning" />
</template>
