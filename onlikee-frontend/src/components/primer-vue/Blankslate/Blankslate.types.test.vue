<script setup lang="ts">
import {
  Blankslate,
  type BlankslatePrimaryActionProps,
  type BlankslateSecondaryActionProps,
} from './index'

const primaryButton: BlankslatePrimaryActionProps = {
  type: 'submit',
  disabled: true,
  onClick: (event) => event.preventDefault(),
}
const primaryLink: BlankslatePrimaryActionProps = { href: '/primary' }
const secondary: BlankslateSecondaryActionProps = { href: '/secondary' }
// @ts-expect-error The link branch accepts href and children only.
const invalidLink: BlankslatePrimaryActionProps = { href: '/primary', disabled: true }
// @ts-expect-error Removed newTab is not part of the native button contract.
const invalidButton: BlankslatePrimaryActionProps = { newTab: true }
// @ts-expect-error A secondary action requires href.
const invalidSecondary: BlankslateSecondaryActionProps = {}
void invalidLink
void invalidButton
void invalidSecondary
</script>

<template>
  <Blankslate border narrow spacious size="small" class-name="custom">
    <Blankslate.Visual aria-hidden="true">Visual</Blankslate.Visual>
    <Blankslate.Heading as="h1">Heading</Blankslate.Heading>
    <Blankslate.Heading as="h6">Heading</Blankslate.Heading>
    <Blankslate.Description>Description</Blankslate.Description>
    <Blankslate.PrimaryAction v-bind="primaryButton">Button</Blankslate.PrimaryAction>
    <Blankslate.PrimaryAction v-bind="primaryLink">Link</Blankslate.PrimaryAction>
    <Blankslate.SecondaryAction v-bind="secondary">Secondary</Blankslate.SecondaryAction>
    <!-- @vue-expect-error Heading supports heading elements only. -->
    <Blankslate.Heading as="div" />
    <!-- @vue-expect-error SecondaryAction requires href. -->
    <Blankslate.SecondaryAction />
    <!-- @vue-expect-error The primary link branch rejects button attributes. -->
    <Blankslate.PrimaryAction href="/primary" disabled />
    <!-- @vue-expect-error Only the three source sizes are supported. -->
    <Blankslate size="extra-large" />
  </Blankslate>
</template>
