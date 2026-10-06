<script setup lang="ts">
import { computed } from 'vue'
import { getResponsiveAttributes } from './responsive'
import type { StackProps } from './types'

const props = withDefaults(defineProps<StackProps>(), {
  as: 'div', direction: 'vertical', align: 'stretch', wrap: 'nowrap',
  justify: 'start', padding: 'none'
})
const responsiveAttributes = computed(() => ({
  ...getResponsiveAttributes('gap', props.gap),
  ...getResponsiveAttributes('direction', props.direction),
  ...getResponsiveAttributes('align', props.align),
  ...getResponsiveAttributes('wrap', props.wrap),
  ...getResponsiveAttributes('justify', props.justify),
  ...getResponsiveAttributes('padding', props.padding),
  ...getResponsiveAttributes('padding-block', props.paddingBlock),
  ...getResponsiveAttributes('padding-inline', props.paddingInline)
}))
</script>

<template>
  <component
    :is="as"
    class="stack"
    data-component="Stack"
    v-bind="responsiveAttributes"
  >
    <slot />
  </component>
</template>

<style scoped>
.stack {
  /* Reset local values so nested stacks do not inherit their parent's padding. */
  --stack-padding: 0;
  --stack-padding-block: initial;
  --stack-padding-inline: initial;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  align-content: flex-start;
  justify-content: flex-start;
  gap: var(--stack-gap-normal, 16px);
  padding-block: var(--stack-padding-block, var(--stack-padding, 0));
  padding-inline: var(--stack-padding-inline, var(--stack-padding, 0));
}

.stack[data-gap='none'],
.stack[data-gap-narrow='none'] { gap: 0; }

.stack[data-gap='tight'],
.stack[data-gap-narrow='tight'] { gap: var(--base-size-4, 4px); }

.stack[data-gap='condensed'],
.stack[data-gap-narrow='condensed'] { gap: var(--stack-gap-condensed, 8px); }

.stack[data-gap='cozy'],
.stack[data-gap-narrow='cozy'] { gap: var(--base-size-12, 12px); }

.stack[data-gap='normal'],
.stack[data-gap-narrow='normal'] { gap: var(--stack-gap-normal, 16px); }

.stack[data-gap='spacious'],
.stack[data-gap-narrow='spacious'] { gap: var(--stack-gap-spacious, 24px); }

.stack[data-direction='horizontal'],
.stack[data-direction-narrow='horizontal'] { flex-direction: row; }

.stack[data-direction='vertical'],
.stack[data-direction-narrow='vertical'] { flex-direction: column; }

.stack[data-align='stretch'],
.stack[data-align-narrow='stretch'] { align-items: stretch; }

.stack[data-align='start'],
.stack[data-align-narrow='start'] { align-items: flex-start; }

.stack[data-align='center'],
.stack[data-align-narrow='center'] { align-items: center; }

.stack[data-align='end'],
.stack[data-align-narrow='end'] { align-items: flex-end; }

.stack[data-align='baseline'],
.stack[data-align-narrow='baseline'] { align-items: baseline; }

.stack[data-wrap='wrap'],
.stack[data-wrap-narrow='wrap'] { flex-wrap: wrap; }

.stack[data-wrap='nowrap'],
.stack[data-wrap-narrow='nowrap'] { flex-wrap: nowrap; }

.stack[data-justify='start'],
.stack[data-justify-narrow='start'] { justify-content: flex-start; }

.stack[data-justify='center'],
.stack[data-justify-narrow='center'] { justify-content: center; }

.stack[data-justify='end'],
.stack[data-justify-narrow='end'] { justify-content: flex-end; }

.stack[data-justify='space-between'],
.stack[data-justify-narrow='space-between'] { justify-content: space-between; }

.stack[data-justify='space-evenly'],
.stack[data-justify-narrow='space-evenly'] { justify-content: space-evenly; }

.stack[data-padding='none'],
.stack[data-padding-narrow='none'] { --stack-padding: 0; }

.stack[data-padding='tight'],
.stack[data-padding-narrow='tight'] { --stack-padding: var(--base-size-4, 4px); }

.stack[data-padding='condensed'],
.stack[data-padding-narrow='condensed'] { --stack-padding: var(--stack-padding-condensed, 8px); }

.stack[data-padding='cozy'],
.stack[data-padding-narrow='cozy'] { --stack-padding: var(--base-size-12, 12px); }

.stack[data-padding='normal'],
.stack[data-padding-narrow='normal'] { --stack-padding: var(--stack-padding-normal, 16px); }

.stack[data-padding='spacious'],
.stack[data-padding-narrow='spacious'] { --stack-padding: var(--stack-padding-spacious, 24px); }

.stack[data-padding-block='none'],
.stack[data-padding-block-narrow='none'] { --stack-padding-block: 0; }

.stack[data-padding-block='tight'],
.stack[data-padding-block-narrow='tight'] { --stack-padding-block: var(--base-size-4, 4px); }

.stack[data-padding-block='condensed'],
.stack[data-padding-block-narrow='condensed'] { --stack-padding-block: var(--stack-padding-condensed, 8px); }

.stack[data-padding-block='cozy'],
.stack[data-padding-block-narrow='cozy'] { --stack-padding-block: var(--base-size-12, 12px); }

.stack[data-padding-block='normal'],
.stack[data-padding-block-narrow='normal'] { --stack-padding-block: var(--stack-padding-normal, 16px); }

.stack[data-padding-block='spacious'],
.stack[data-padding-block-narrow='spacious'] { --stack-padding-block: var(--stack-padding-spacious, 24px); }

.stack[data-padding-inline='none'],
.stack[data-padding-inline-narrow='none'] { --stack-padding-inline: 0; }

.stack[data-padding-inline='tight'],
.stack[data-padding-inline-narrow='tight'] { --stack-padding-inline: var(--base-size-4, 4px); }

.stack[data-padding-inline='condensed'],
.stack[data-padding-inline-narrow='condensed'] { --stack-padding-inline: var(--stack-padding-condensed, 8px); }

.stack[data-padding-inline='cozy'],
.stack[data-padding-inline-narrow='cozy'] { --stack-padding-inline: var(--base-size-12, 12px); }

.stack[data-padding-inline='normal'],
.stack[data-padding-inline-narrow='normal'] { --stack-padding-inline: var(--stack-padding-normal, 16px); }

.stack[data-padding-inline='spacious'],
.stack[data-padding-inline-narrow='spacious'] { --stack-padding-inline: var(--stack-padding-spacious, 24px); }

@media (min-width: 768px) {
  .stack[data-gap-regular='none'] { gap: 0; }

  .stack[data-gap-regular='tight'] { gap: var(--base-size-4, 4px); }

  .stack[data-gap-regular='condensed'] { gap: var(--stack-gap-condensed, 8px); }

  .stack[data-gap-regular='cozy'] { gap: var(--base-size-12, 12px); }

  .stack[data-gap-regular='normal'] { gap: var(--stack-gap-normal, 16px); }

  .stack[data-gap-regular='spacious'] { gap: var(--stack-gap-spacious, 24px); }

  .stack[data-direction-regular='horizontal'] { flex-direction: row; }

  .stack[data-direction-regular='vertical'] { flex-direction: column; }

  .stack[data-align-regular='stretch'] { align-items: stretch; }

  .stack[data-align-regular='start'] { align-items: flex-start; }

  .stack[data-align-regular='center'] { align-items: center; }

  .stack[data-align-regular='end'] { align-items: flex-end; }

  .stack[data-align-regular='baseline'] { align-items: baseline; }

  .stack[data-wrap-regular='wrap'] { flex-wrap: wrap; }

  .stack[data-wrap-regular='nowrap'] { flex-wrap: nowrap; }

  .stack[data-justify-regular='start'] { justify-content: flex-start; }

  .stack[data-justify-regular='center'] { justify-content: center; }

  .stack[data-justify-regular='end'] { justify-content: flex-end; }

  .stack[data-justify-regular='space-between'] { justify-content: space-between; }

  .stack[data-justify-regular='space-evenly'] { justify-content: space-evenly; }

  .stack[data-padding-regular='none'] { --stack-padding: 0; }

  .stack[data-padding-regular='tight'] { --stack-padding: var(--base-size-4, 4px); }

  .stack[data-padding-regular='condensed'] { --stack-padding: var(--stack-padding-condensed, 8px); }

  .stack[data-padding-regular='cozy'] { --stack-padding: var(--base-size-12, 12px); }

  .stack[data-padding-regular='normal'] { --stack-padding: var(--stack-padding-normal, 16px); }

  .stack[data-padding-regular='spacious'] { --stack-padding: var(--stack-padding-spacious, 24px); }

  .stack[data-padding-block-regular='none'] { --stack-padding-block: 0; }

  .stack[data-padding-block-regular='tight'] { --stack-padding-block: var(--base-size-4, 4px); }

  .stack[data-padding-block-regular='condensed'] { --stack-padding-block: var(--stack-padding-condensed, 8px); }

  .stack[data-padding-block-regular='cozy'] { --stack-padding-block: var(--base-size-12, 12px); }

  .stack[data-padding-block-regular='normal'] { --stack-padding-block: var(--stack-padding-normal, 16px); }

  .stack[data-padding-block-regular='spacious'] { --stack-padding-block: var(--stack-padding-spacious, 24px); }

  .stack[data-padding-inline-regular='none'] { --stack-padding-inline: 0; }

  .stack[data-padding-inline-regular='tight'] { --stack-padding-inline: var(--base-size-4, 4px); }

  .stack[data-padding-inline-regular='condensed'] { --stack-padding-inline: var(--stack-padding-condensed, 8px); }

  .stack[data-padding-inline-regular='cozy'] { --stack-padding-inline: var(--base-size-12, 12px); }

  .stack[data-padding-inline-regular='normal'] { --stack-padding-inline: var(--stack-padding-normal, 16px); }

  .stack[data-padding-inline-regular='spacious'] { --stack-padding-inline: var(--stack-padding-spacious, 24px); }
}

@media (min-width: 1400px) {
  .stack[data-gap-wide='none'] { gap: 0; }

  .stack[data-gap-wide='tight'] { gap: var(--base-size-4, 4px); }

  .stack[data-gap-wide='condensed'] { gap: var(--stack-gap-condensed, 8px); }

  .stack[data-gap-wide='cozy'] { gap: var(--base-size-12, 12px); }

  .stack[data-gap-wide='normal'] { gap: var(--stack-gap-normal, 16px); }

  .stack[data-gap-wide='spacious'] { gap: var(--stack-gap-spacious, 24px); }

  .stack[data-direction-wide='horizontal'] { flex-direction: row; }

  .stack[data-direction-wide='vertical'] { flex-direction: column; }

  .stack[data-align-wide='stretch'] { align-items: stretch; }

  .stack[data-align-wide='start'] { align-items: flex-start; }

  .stack[data-align-wide='center'] { align-items: center; }

  .stack[data-align-wide='end'] { align-items: flex-end; }

  .stack[data-align-wide='baseline'] { align-items: baseline; }

  .stack[data-wrap-wide='wrap'] { flex-wrap: wrap; }

  .stack[data-wrap-wide='nowrap'] { flex-wrap: nowrap; }

  .stack[data-justify-wide='start'] { justify-content: flex-start; }

  .stack[data-justify-wide='center'] { justify-content: center; }

  .stack[data-justify-wide='end'] { justify-content: flex-end; }

  .stack[data-justify-wide='space-between'] { justify-content: space-between; }

  .stack[data-justify-wide='space-evenly'] { justify-content: space-evenly; }

  .stack[data-padding-wide='none'] { --stack-padding: 0; }

  .stack[data-padding-wide='tight'] { --stack-padding: var(--base-size-4, 4px); }

  .stack[data-padding-wide='condensed'] { --stack-padding: var(--stack-padding-condensed, 8px); }

  .stack[data-padding-wide='cozy'] { --stack-padding: var(--base-size-12, 12px); }

  .stack[data-padding-wide='normal'] { --stack-padding: var(--stack-padding-normal, 16px); }

  .stack[data-padding-wide='spacious'] { --stack-padding: var(--stack-padding-spacious, 24px); }

  .stack[data-padding-block-wide='none'] { --stack-padding-block: 0; }

  .stack[data-padding-block-wide='tight'] { --stack-padding-block: var(--base-size-4, 4px); }

  .stack[data-padding-block-wide='condensed'] { --stack-padding-block: var(--stack-padding-condensed, 8px); }

  .stack[data-padding-block-wide='cozy'] { --stack-padding-block: var(--base-size-12, 12px); }

  .stack[data-padding-block-wide='normal'] { --stack-padding-block: var(--stack-padding-normal, 16px); }

  .stack[data-padding-block-wide='spacious'] { --stack-padding-block: var(--stack-padding-spacious, 24px); }

  .stack[data-padding-inline-wide='none'] { --stack-padding-inline: 0; }

  .stack[data-padding-inline-wide='tight'] { --stack-padding-inline: var(--base-size-4, 4px); }

  .stack[data-padding-inline-wide='condensed'] { --stack-padding-inline: var(--stack-padding-condensed, 8px); }

  .stack[data-padding-inline-wide='cozy'] { --stack-padding-inline: var(--base-size-12, 12px); }

  .stack[data-padding-inline-wide='normal'] { --stack-padding-inline: var(--stack-padding-normal, 16px); }

  .stack[data-padding-inline-wide='spacious'] { --stack-padding-inline: var(--stack-padding-spacious, 24px); }
}
</style>
