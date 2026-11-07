<script setup lang="ts">
import { Banner } from './index'
</script>

<template>
  <Banner title="Information" variant="info" layout="compact" actions-layout="stacked" flush>
    <template #description> Read the <a href="#guide">guide</a>. </template>
    <template #primaryAction>
      <Banner.PrimaryAction type="submit" loading>Continue</Banner.PrimaryAction>
    </template>
    <template #secondaryAction>
      <Banner.SecondaryAction as="a" href="#later">Later</Banner.SecondaryAction>
    </template>
  </Banner>
  <Banner aria-labelledby="custom-title">
    <Banner.Title id="custom-title" as="h3">Custom title</Banner.Title>
    <Banner.Description>Description</Banner.Description>
  </Banner>
  <!-- @vue-expect-error The old service variant is not supported. -->
  <Banner title="Invalid" variant="error" />
  <!-- @vue-expect-error Banner.Title only supports h2 through h6. -->
  <Banner.Title as="h1">Invalid heading</Banner.Title>
  <!-- @vue-expect-error Banner action variants are owned by the wrappers. -->
  <Banner.PrimaryAction variant="danger">Invalid variant</Banner.PrimaryAction>
  <!-- @vue-expect-error The default button root rejects anchor-only attributes. -->
  <Banner.PrimaryAction href="#invalid">Invalid href</Banner.PrimaryAction>
</template>
