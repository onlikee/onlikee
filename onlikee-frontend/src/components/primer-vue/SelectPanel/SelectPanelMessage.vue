<script setup lang="ts">
import { renderNode } from '../internal/renderNode'
import { useCssModule } from 'vue'
import AlertIcon from '../../octicons-vue3/icons/alert.vue'
import type { SelectPanelMessageProps } from './types'
defineOptions({ name: 'SelectPanelMessage' })
const styles = useCssModule()
const props = withDefaults(defineProps<SelectPanelMessageProps>(), {
  body: undefined,
  action: undefined,
  icon: undefined,
})
const RenderIcon = () =>
  renderNode(props.icon || AlertIcon, {
    size: 16,
    class: styles['select-panel__message-icon'],
    'data-variant': props.variant,
    'data-component': 'SelectPanel.MessageIcon',
  })
const RenderBody = () => renderNode(props.body)
const RenderAction = () => renderNode(props.action)
</script>
<template>
  <div :class="[$style['select-panel__message'], className]" data-component="SelectPanel.Message">
    <RenderIcon v-if="icon || variant !== 'empty'" />
    <span
      :class="$style['select-panel__message-title']"
      data-component="SelectPanel.MessageTitle"
      >{{ title }}</span
    >
    <span :class="$style['select-panel__message-body']" data-component="SelectPanel.MessageBody"
      ><RenderBody v-if="body !== undefined" /><slot v-else><RenderBody /></slot
    ></span>
    <div
      v-if="action || $slots.action"
      :class="$style['select-panel__message-action']"
      data-component="SelectPanel.MessageAction"
    >
      <RenderAction v-if="action !== undefined" />
      <slot v-else name="action">
        <RenderAction />
      </slot>
    </div>
  </div>
</template>
<style module src="./SelectPanelMessage.module.css" />
