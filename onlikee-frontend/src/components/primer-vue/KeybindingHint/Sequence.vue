<script setup lang="ts">
import { computed } from 'vue'
import VisuallyHidden from '../internal/components/VisuallyHidden.vue'
import Chord from './Chord.vue'
import type { KeybindingHintFormat, KeybindingHintVariant } from './props'

defineOptions({ name: 'KeybindingHintSequence' })
const props = withDefaults(
  defineProps<{
    keys: string
    format?: KeybindingHintFormat
    variant?: KeybindingHintVariant
    size?: 'small' | 'normal'
    className?: string
  }>(),
  { format: undefined, variant: undefined, size: undefined, className: undefined },
)
const splitSequence = (sequence: string) => sequence.split(' ')
const chords = computed(() => splitSequence(props.keys))
</script>
<template>
  <template v-for="(c, i) in chords" :key="i">
    <!-- Since we audibly separate individual keys in chord with space, we need some other separator for chords in a sequence -->
    <template v-if="i > 0"> <VisuallyHidden>then</VisuallyHidden>{{ ' ' }} </template>
    <Chord :keys="c" :format="format" :variant="variant" :size="size" />
  </template>
</template>
