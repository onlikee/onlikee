<script setup lang="ts">
import { computed } from 'vue'
import VisuallyHidden from '../internal/components/VisuallyHidden.vue'
import { accessibleKeyName, condensedKeyName, fullKeyName } from './key-names'
import { usePlatformRef } from './platform'
import type { KeybindingHintFormat } from './props'

defineOptions({ name: 'KeybindingHintKey' })
const props = defineProps<{ name: string; format: KeybindingHintFormat }>()
const platform = usePlatformRef()
const accessible = computed(() => accessibleKeyName(props.name, platform.value))
const visible = computed(() =>
  props.format === 'condensed' ? condensedKeyName(props.name, platform.value) : fullKeyName(props.name, platform.value),
)
</script>
<template>
  <VisuallyHidden>{{ accessible }}</VisuallyHidden>
  <span aria-hidden="true">{{ visible }}</span>
</template>
