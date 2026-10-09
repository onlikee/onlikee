<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import { FeatureFlagScope, type FeatureFlagValues } from './FeatureFlagScope'
import { DefaultFeatureFlags, featureFlagContextKey } from './context'
defineOptions({ name: 'FeatureFlags' })
const props = defineProps<{ flags: FeatureFlagValues }>()
const parent = inject(
  featureFlagContextKey,
  computed(() => DefaultFeatureFlags),
)
provide(
  featureFlagContextKey,
  computed(() => FeatureFlagScope.merge(parent.value, FeatureFlagScope.create(props.flags))),
)
</script>
<template><slot /></template>
