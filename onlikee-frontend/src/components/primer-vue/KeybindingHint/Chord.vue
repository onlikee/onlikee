<script setup lang="ts">
import { computed } from 'vue'
import Text from '../Text/Text.vue'
import Key from './Key.vue'
import { splitChord } from './chordUtils'
import type { KeybindingHintFormat, KeybindingHintVariant } from './props'

defineOptions({ name: 'KeybindingHintChord' })
const props = withDefaults(
  defineProps<{
    keys: string
    format?: KeybindingHintFormat
    variant?: KeybindingHintVariant
    size?: 'small' | 'normal'
  }>(),
  { format: 'condensed', variant: 'normal', size: 'normal' },
)
const chordKeys = computed(() => splitChord(props.keys))
</script>
<template>
  <Text
    :data-kbd-chord="true"
    :class="[
      $style['keybinding-chord'],
      {
        [$style['keybinding-chord--normal']]: variant === 'normal',
        [$style['keybinding-chord--on-emphasis']]: variant === 'onEmphasis',
        [$style['keybinding-chord--on-primary']]: variant === 'onPrimary',
        [$style['keybinding-chord--small']]: size === 'small',
      },
    ]"
  >
    <template v-for="(k, i) in chordKeys" :key="i">
      <!-- hiding the plus sign helps screen readers be more concise -->
      <span v-if="i > 0 && format === 'full'" aria-hidden="true"> + </span>
      <!-- space is nonvisual due to flex layout but critical for labelling / screen readers -->
      <template v-else>
        {{ ' ' }}
      </template>
      <Key :name="k" :format="format" />
    </template>
  </Text>
</template>
<style module src="./Chord.module.css" />
