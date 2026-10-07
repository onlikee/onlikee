<script setup lang="ts">
import AriaStatus from './AriaStatus.vue'
import VisuallyHidden from './VisuallyHidden.vue'
import Text from '../../Text/Text.vue'
import { SCREEN_READER_DELAY, type getCharacterCountState } from '../characterCounter'
defineProps<{ limit: number; counter: ReturnType<typeof getCharacterCountState>; staticMessageId: string; counterId: string; component?: string }>()
</script>

<template>
  <AriaStatus
    :announce-on-show="false"
    :delay-ms="SCREEN_READER_DELAY"
    class="internal-visually-hidden"
  >
    {{ counter.message }}
  </AriaStatus>
  <VisuallyHidden :id="staticMessageId">You can enter up to {{ limit }} {{ limit === 1 ? 'character' : 'characters' }}</VisuallyHidden>
  <Text
    size="small"
    :id="counterId"
    :class="[$style['character-counter'], { [$style['character-counter-error']]: counter.isOverLimit }]"
    v-bind="component !== undefined ? { 'data-component': component } : {}"
    aria-hidden="true"
  ><svg
    v-if="counter.isOverLimit"
    data-component="Octicon"
    aria-hidden="true"
    focusable="false"
    class="octicon octicon-alert-fill"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="currentColor"
    display="inline-block"
    overflow="visible"
    style="vertical-align: text-bottom"
  ><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575ZM8 5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8 5Zm1 6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z" /></svg>{{ counter.message }}</Text>
</template>

<style module src="./CharacterCounter.module.css"></style>
