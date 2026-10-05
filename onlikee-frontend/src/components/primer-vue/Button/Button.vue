<template>
  <component
    :is="as"
    class="button"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    :data-loading="loading"
    :data-size="size"
    :data-variant="variant"
    :data-icon-button="hasLabel() ? 'false' : 'true'"
    :data-block="block || undefined"
    @click="handleClick"
  >
    <span
      class="button__content"
    >
      <span class="button__content-row">
        <span
          v-if="leadingVisual"
          class="button__visual"
        >
          <component :is="leadingVisual" />
        </span>
        <span
          v-if="hasLabel()"
          class="button__label"
        >
          <slot />
        </span>
        <span
          v-if="trailingVisual"
          class="button__visual"
        >
          <component :is="trailingVisual" />
        </span>
      </span>
      <!-- React ButtonBase.tsx:140-149 —— 独立 spinner（源条件为无任何可替换槽位）；Vue 适配：本组件未实现
           leading/trailing visual 的 spinner 槽位替换，故仅在 trailingAction 槽位接管 spinner 时让位，避免双 spinner -->
      <svg
        v-if="loading && !(trailingAction && !leadingVisual && !trailingVisual)"
        aria-hidden="true"
        focusable="false"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        class="button__spinner"
      >
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="none"
          stroke="currentColor"
          stroke-opacity="0.25"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M15 8a7.002 7.002 0 0 0-7-7"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </span>
    <!-- React ButtonBase.tsx:181-191 —— trailingAction 是 buttonContent 的兄弟节点（不嵌套在内容行内），
         loading && !leadingVisual && !trailingVisual 时被 Spinner 替换（renderModuleVisual :184-190/:30） -->
    <span
      v-if="trailingAction"
      class="button__trailing-action"
      data-component="trailingAction"
    >
      <svg
        v-if="loading && !leadingVisual && !trailingVisual"
        aria-hidden="true"
        focusable="false"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        class="button__spinner"
      >
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="none"
          stroke="currentColor"
          stroke-opacity="0.25"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M15 8a7.002 7.002 0 0 0-7-7"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
      </svg>
      <component
        :is="trailingAction"
        v-else
      />
    </span>
  </component>
</template>

<script setup lang="ts">
import { Comment, useSlots, type Component, type VNode } from 'vue'

interface Props {
  as?: 'button' | 'a'
  block?: boolean
  type?: 'button' | 'submit' | 'reset'
  variant?: 'default' | 'primary' | 'invisible' | 'danger' | 'link'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  leadingVisual?: Component
  trailingVisual?: Component
  trailingAction?: Component
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  block: false,
  type: 'button',
  variant: 'default',
  size: 'medium',
  loading: false,
  disabled: false,
  leadingVisual: undefined,
  trailingVisual: undefined,
  trailingAction: undefined
})

const slots = useSlots()

// React ButtonBase.tsx:155 `{children && ...}` —— 任意非注释节点都算有内容（仅忽略注释节点，
// 与 SelectPanelButton.vue 的 hasContent 同款直译；空白文本在 Vue 编译器层已被压缩，属框架差异）
function hasContent(nodes: VNode[]): boolean {
  return nodes.some(node => node.type !== Comment)
}

function hasLabel() {
  return hasContent(slots.default?.() ?? [])
}

// React ButtonBase.tsx:127 —— onClick={loading ? undefined : onClick}：loading 时不触发点击。
// Vue 适配：attrs 透传的 onClick 无法从模板移除，改用前置守卫 preventDefault + stopImmediatePropagation
// （合并事件数组中模板 handler 先执行，_stopped 会跳过 attrs 的 onClick；<a> 无原生 disabled 点击拦截，需显式阻止导航）
function handleClick(event: MouseEvent) {
  if (props.loading) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}
</script>

<style scoped>
.button {
  align-items: center;
  appearance: none;
  background-color: transparent;
  border: var(--borderWidth-thin, 0.0625rem) solid transparent;
  border-radius: var(--borderRadius-medium, 0.375rem);
  color: var(--button-default-fgColor-rest, var(--control-fgColor-rest, #25292e));
  cursor: pointer;
  display: inline-flex;
  font-size: var(--text-body-size-medium, 0.875rem);
  font-weight: var(--base-text-weight-medium, 500);
  height: var(--control-medium-size, 2rem);
  min-width: max-content;
  padding: 0 var(--control-medium-paddingInline-normal, 0.75rem);
  text-align: center;
  text-decoration: none;
  transition: 80ms cubic-bezier(0.65, 0, 0.35, 1);
  transition-property: color, background-color, border-color, box-shadow;
  user-select: none;
  vertical-align: middle;
  font-family: inherit;
}

.button:focus-visible {
  box-shadow: none;
  /* 源 ButtonBase.module.css:36-37 @mixin focusOutline 展开（双跳 + preset 注入 #0969da，
     同 SelectPanelButton/Radio/Checkbox/FAL）。外层 --focus-outline-color 从未被主题定义（死 hop）
     但为 mixin 忠实展开，保持对齐。 */
  outline: 2px solid var(--focus-outline-color, var(--focus-outlineColor, #0969da));
  outline-offset: -2px;
}

.button:disabled {
  box-shadow: none;
  cursor: not-allowed;
}

.button__content {
  display: grid;
  flex: 1 0 auto;
  grid-template-areas: 'stack';
  place-items: center;
  width: 100%;
  justify-content: center;
}

.button__content-row,
.button__spinner {
  grid-area: stack;
}

.button__content-row {
  align-items: center;
  display: inline-flex;
  gap: 0.5rem;
  max-width: 100%;
}

.button__label {
  line-height: var(--text-body-lineHeight-medium, 1.5);
  white-space: nowrap;
}

.button__visual {
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
}

.button[data-block] { display: flex; width: 100%; }
.button__trailing-action { display: inline-flex; margin-inline-end: -4px; color: var(--fgColor-muted, #59636e); }

.button[data-variant='default']:not(:disabled) .button__visual {
  color: var(--fgColor-muted, #59636e);
}

.button[data-variant='danger']:not(:disabled) .button__visual {
  color: var(--button-danger-iconColor-rest, var(--fgColor-danger, #d1242f));
}

.button[data-variant='danger']:hover:not(:disabled) .button__visual,
.button[data-variant='danger']:active:not(:disabled) .button__visual {
  color: var(--button-danger-iconColor-hover, #ffffff);
}

.button[data-variant='invisible']:not(:disabled) .button__visual {
  color: var(--button-invisible-iconColor-rest, var(--fgColor-muted, #59636e));
}

.button[data-variant='invisible']:hover:not(:disabled) .button__visual,
.button[data-variant='invisible']:active:not(:disabled) .button__visual {
  color: var(--button-invisible-iconColor-hover, var(--fgColor-muted, #59636e));
}

.button__spinner {
  animation: button-spin 1s linear infinite;
  display: block;
}

/* React ButtonBase.module.css:276-291 —— 仅独立 spinner（.LoadingSpinner + .Label 规则）渲染时隐藏标签行；
   spinner 被 trailingAction 槽位替换时标签保持可见 */
.button[data-loading='true'] .button__content:has(> .button__spinner) .button__content-row {
  visibility: hidden;
}

/* IconButton样式 */

.button[data-icon-button='true'] {
  justify-content: center;
  min-width: unset;
  padding: unset;
  width: var(--control-medium-size, 2rem);
}

.button[data-icon-button='true'][data-size='small'] {
  width: var(--control-small-size, 1.75rem);
}

.button[data-icon-button='true'][data-size='large'] {
  width: var(--control-large-size, 2.5rem);
}

.button[data-icon-button='true'][data-variant='default'] {
  color: var(--fgColor-muted, #59636e);
}

.button[data-icon-button='true'][data-variant='invisible'] {
  color: var(--fgColor-muted, #59636e);
}

/*  */

.button[data-size='small'] {
  font-size: var(--text-body-size-small, 0.75rem);
  height: var(--control-small-size, 1.75rem);
  padding: 0 var(--control-small-paddingInline-condensed, 0.5rem);
}

.button[data-size='small'] .button__label {
  line-height: var(--text-body-lineHeight-small, 1.625);
}

.button[data-size='large'] {
  height: var(--control-large-size, 2.5rem);
  padding: 0 var(--control-large-paddingInline-spacious, 1rem);
}

.button[data-variant='default'] {
  background-color: var(--button-default-bgColor-rest, var(--control-bgColor-rest, #f6f8fa));
  border-color: var(--button-default-borderColor-rest, var(--control-borderColor-rest, #d1d9e0));
  box-shadow: var(--button-default-shadow-resting, 0 1px 0 0 #1f23280a);
  color: var(--button-default-fgColor-rest, var(--control-fgColor-rest, #25292e));
}

.button[data-variant='default']:where([aria-expanded='true']):not(:disabled) {
  background-color: var(--button-default-bgColor-active, var(--control-bgColor-active, #e6eaef));
  border-color: var(--button-default-borderColor-active, var(--button-default-borderColor-rest, #d1d9e0));
}

.button[data-variant='default']:hover:not(:disabled) {
  background-color: var(--button-default-bgColor-hover, var(--control-bgColor-hover, #eff2f5));
  border-color: var(--button-default-borderColor-hover, var(--button-default-borderColor-rest, #d1d9e0));
}

.button[data-variant='default']:active:not(:disabled) {
  background-color: var(--button-default-bgColor-active, var(--control-bgColor-active, #e6eaef));
  border-color: var(--button-default-borderColor-active, var(--button-default-borderColor-rest, #d1d9e0));
}

.button[data-variant='default']:disabled {
  background-color: var(--button-default-bgColor-disabled, var(--control-bgColor-disabled, #f6f8fa));
  border-color: var(--button-default-borderColor-disabled, var(--control-borderColor-disabled, #818b981a));
  color: var(--control-fgColor-disabled, #818b98);
}

.button[data-variant='primary'] {
  background-color: var(--button-primary-bgColor-rest, var(--bgColor-success-emphasis, #1f883d));
  border-color: var(--button-primary-borderColor-rest, var(--borderColor-translucent, #1f232826));
  box-shadow: var(--shadow-resting-small, 0 1px 1px 0 #1f23280a, 0 1px 2px 0 #1f232808);
  color: var(--button-primary-fgColor-rest, var(--fgColor-white, #ffffff));
}

.button[data-variant='primary']:hover:not(:disabled) {
  background-color: var(--button-primary-bgColor-hover, #1c8139);
  border-color: var(--button-primary-borderColor-hover, var(--button-primary-borderColor-rest, #1f232826));
}

.button[data-variant='primary']:active:not(:disabled) {
  background-color: var(--button-primary-bgColor-active, #197935);
  border-color: var(--button-primary-borderColor-active, var(--button-primary-borderColor-rest, #1f232826));
  box-shadow: var(--button-primary-shadow-selected, inset 0 1px 0 0 #002d114d);
}

.button[data-variant='primary']:focus-visible {
  box-shadow: inset 0 0 0 3px var(--fgColor-onEmphasis, #ffffff);
}

.button[data-variant='primary']:disabled {
  background-color: var(--button-primary-bgColor-disabled, #95d8a6);
  border-color: var(--button-primary-borderColor-disabled, var(--button-primary-bgColor-disabled, #95d8a6));
  color: var(--button-primary-fgColor-disabled, rgba(255, 255, 255, 0.8));
}

.button[data-variant='danger'] {
  background-color: var(--button-danger-bgColor-rest, var(--control-bgColor-rest, #f6f8fa));
  border-color: var(--button-danger-borderColor-rest, var(--control-borderColor-rest, #d1d9e0));
  box-shadow: var(--button-default-shadow-resting, 0 1px 0 0 #1f23280a);
  color: var(--button-danger-fgColor-rest, var(--fgColor-danger, #d1242f));
}

.button[data-variant='danger']:hover:not(:disabled) {
  background-color: var(--button-danger-bgColor-hover, var(--bgColor-danger-emphasis, #cf222e));
  border-color: var(--button-danger-borderColor-hover, var(--button-primary-borderColor-rest, #1f232826));
  color: var(--button-danger-fgColor-hover, #ffffff);
}

.button[data-variant='danger']:active:not(:disabled) {
  background-color: var(--button-danger-bgColor-active, #a40e26);
  border-color: var(--button-danger-borderColor-active, var(--button-danger-borderColor-hover, #1f232826));
  box-shadow: var(--button-danger-shadow-selected, inset 0 1px 0 0 #4c001433);
  color: var(--button-danger-fgColor-active, #ffffff);
}

.button[data-variant='danger']:disabled {
  background-color: var(--button-danger-bgColor-disabled, var(--control-bgColor-disabled, #f6f8fa));
  border-color: var(--button-default-borderColor-disabled, var(--control-borderColor-disabled, #818b981a));
  color: var(--button-danger-fgColor-disabled, #d1242f80);
}

.button[data-variant='invisible'] {
  background-color: var(--button-invisible-bgColor-rest, transparent);
  border-color: var(--button-invisible-borderColor-rest, transparent);
  box-shadow: none;
  color: var(--button-invisible-fgColor-rest, var(--control-fgColor-rest, #25292e));
}

.button[data-variant='invisible']:where([aria-expanded='true']):not(:disabled) {
  background-color: var(--button-invisible-bgColor-active, var(--control-transparent-bgColor-active, #818b9826));
}

.button[data-variant='invisible']:hover:not(:disabled) {
  background-color: var(--button-invisible-bgColor-hover, var(--control-transparent-bgColor-hover, rgba(129, 139, 152, 0.1)));
  border-color: var(--button-invisible-borderColor-hover, transparent);
  color: var(--button-invisible-fgColor-hover, var(--control-fgColor-rest, #25292e));
}

.button[data-variant='invisible']:active:not(:disabled) {
  background-color: var(--button-invisible-bgColor-active, var(--control-transparent-bgColor-active, #818b9826));
}

.button[data-variant='invisible']:disabled {
  background-color: var(--button-invisible-bgColor-disabled, transparent);
  border-color: var(--button-invisible-borderColor-disabled, transparent);
  color: var(--button-invisible-fgColor-disabled, var(--control-fgColor-disabled, #818b98));
}

.button[data-variant='link'] {
  background-color: transparent;
  border-color: transparent;
  border-radius: 0;
  box-shadow: none;
  color: var(--fgColor-link, #0969da);
  font-size: inherit;
  height: auto;
  min-width: fit-content;
  padding: 0;
  text-align: left;
}

.button[data-variant='link']:hover:not(:disabled) {
  text-decoration: underline;
}

.button[data-variant='link']:active:not(:disabled) {
  text-decoration: underline;
}

.button[data-variant='link']:focus-visible {
  outline-offset: 2px;
}

.button[data-variant='link']:disabled {
  background-color: transparent;
  border-color: transparent;
  color: var(--control-fgColor-disabled, #818b98);
}

@keyframes button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
