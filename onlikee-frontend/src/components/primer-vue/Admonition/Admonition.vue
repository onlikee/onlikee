<template>
  <div
    class="admonition"
    :data-type="type"
    :data-has-title="title ? 'true' : 'false'"
    role="note"
  >
    <div
      class="admonition-icon"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="currentColor"
      >
        <path :d="ICON_PATH[type]" />
      </svg>
    </div>
    <div class="admonition-body">
      <div
        v-if="title"
        class="admonition-title"
      >
        {{ title }}
      </div>
      <div class="admonition-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type AdmonitionType = 'critical' | 'info' | 'success' | 'upsell' | 'warning'

withDefaults(defineProps<{
  type?: AdmonitionType
  title?: string
}>(), {
  type: 'info',
  title: undefined,
})

const ICON_PATH: Record<AdmonitionType, string> = {
  critical: 'M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  info: 'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  success: 'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm1.5 0a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm10.28-1.72-4.5 4.5a.75.75 0 0 1-1.06 0l-2-2a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l1.47 1.47 3.97-3.97a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z',
  upsell: 'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  warning: 'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
}
</script>

<style scoped>
.admonition {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-left: 4px solid var(--borderColor-accent-muted, #54aeff66);
  background: var(--bgColor-accent-muted, #ddf4ff);
  color: var(--fgColor-default, #1f2328);
  font-size: 14px;
}

.admonition[data-type='critical'] {
  border-left-color: var(--borderColor-danger-muted, #ff818266);
  background: var(--bgColor-danger-muted, #ffebe9);
}

.admonition[data-type='info'] {
  border-left-color: var(--borderColor-accent-muted, #54aeff66);
  background: var(--bgColor-accent-muted, #ddf4ff);
}

.admonition[data-type='success'] {
  border-left-color: var(--borderColor-success-muted, #4ac26b66);
  background: var(--bgColor-success-muted, #dafbe1);
}

.admonition[data-type='upsell'] {
  border-left-color: var(--borderColor-done-muted, #c297ff66);
  background: var(--bgColor-done-muted, #fbefff);
}

.admonition[data-type='warning'] {
  border-left-color: var(--borderColor-attention-muted, #d4a72c66);
  background: var(--bgColor-attention-muted, #fff8c5);
}

.admonition[data-type='critical'] .admonition-icon {
  color: var(--fgColor-danger, #d1242f);
}

.admonition[data-type='info'] .admonition-icon {
  color: var(--fgColor-link, #0969da);
}

.admonition[data-type='success'] .admonition-icon {
  color: var(--fgColor-success, #1a7f37);
}

.admonition[data-type='upsell'] .admonition-icon {
  color: var(--fgColor-done, #8250df);
}

.admonition[data-type='warning'] .admonition-icon {
  color: var(--fgColor-attention, #9a6700);
}

.admonition-icon {
  flex-shrink: 0;
  padding-top: 3px;
  color: var(--fgColor-link, #0969da);
}

.admonition-body {
  flex: 1;
  min-width: 0;
}

.admonition-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.admonition-content {
  color: var(--fgColor-muted, #59636e);
  overflow-wrap: anywhere;
}

.admonition[data-has-title='false'] .admonition-content {
  color: var(--fgColor-default, #1f2328);
}
</style>
