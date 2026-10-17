<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import { FeatureFlagScope, type FeatureFlagValues } from './FeatureFlagScope'
import { DefaultFeatureFlags, featureFlagContextKey } from './context'
defineOptions({ name: 'FeatureFlags' })
export interface FeatureFlagsProps {
  flags: FeatureFlagValues
}
const props = defineProps<FeatureFlagsProps>()
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
