<script setup lang="ts">
import { renderNode } from '../internal/renderNode'
import AlertIcon from '../../octicons-vue3/icons/alert.vue'
import type { SelectPanelMessageProps } from './types'
defineOptions({ name: 'SelectPanelMessage' })
const props = withDefaults(defineProps<SelectPanelMessageProps>(), { body: undefined, action: undefined, icon: undefined })
const RenderIcon = () => renderNode(props.icon || AlertIcon, { size: 16, class: 'select-panel__message-icon', 'data-variant': props.variant, 'data-component': 'SelectPanel.MessageIcon' })
const RenderBody = () => renderNode(props.body)
const RenderAction = () => renderNode(props.action)
</script>
<template>
  <div
    :class="['select-panel__message', className]"
    data-component="SelectPanel.Message"
  >
    <RenderIcon v-if="icon || variant !== 'empty'" />
    <span
      class="select-panel__message-title"
      data-component="SelectPanel.MessageTitle"
    >{{ title }}</span>
    <span
      class="select-panel__message-body"
      data-component="SelectPanel.MessageBody"
    ><RenderBody v-if="body !== undefined" /><slot v-else><RenderBody /></slot></span>
    <div
      v-if="action || $slots.action"
      class="select-panel__message-action"
      data-component="SelectPanel.MessageAction"
    >
      <RenderAction v-if="action !== undefined" />
      <slot
        v-else
        name="action"
      >
        <RenderAction />
      </slot>
    </div>
  </div>
</template>
<style scoped>
.select-panel__message { display: flex; height: 100%; flex-direction: column; align-items: center; justify-content: center; flex-grow: 1; padding: var(--base-size-24, 24px); text-align: center; gap: var(--base-size-4, 4px); }
.select-panel__message :deep(a) { color: inherit; text-decoration: underline; }
.select-panel__message-icon { margin-bottom: var(--base-size-8, 8px); color: var(--fgColor-attention, #9a6700); }
.select-panel__message-icon[data-variant='error'] { color: var(--fgColor-danger, #d1242f); }
.select-panel__message-title { font-size: var(--text-body-size-medium, 14px); font-weight: var(--base-text-weight-semibold, 600); }
.select-panel__message-body { color: var(--fgColor-muted, #59636e); font-size: var(--text-body-size-small, 12px); align-items: center; gap: var(--stack-gap-condensed, 8px); }
.select-panel__message-action { margin-block-start: var(--base-size-8, 8px); }
</style>
