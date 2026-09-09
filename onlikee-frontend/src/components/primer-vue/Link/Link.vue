<template>
  <span class="link-wrapper">
    <span
      v-if="prefixText"
      class="link-prefix"
    >{{ prefixText }}</span>
    <a 
      :href="href" 
      :target="target" 
      :rel="(external || target === '_blank') ? 'noopener noreferrer' : undefined"
      class="link"
      :class="{
        'link-external': external,
        'link-primary': variant === 'primary',
        'link-secondary': variant === 'secondary',
        'link-danger': variant === 'danger'
      }"
    >
      {{ linkText }}
    </a>
    <span
      v-if="suffixText"
      class="link-suffix"
    >{{ suffixText }}</span>
  </span>
</template>

<script setup lang="ts">
interface Props {
  /** 链接地址 */
  href: string
  /** 链接文本 */
  linkText: string
  /** 前置文本 */
  prefixText?: string
  /** 后置文本 */
  suffixText?: string
  /** 是否为外部链接 */
  external?: boolean
  /** 链接打开方式 */
  target?: '_blank' | '_self' | '_parent' | '_top'
  /** 链接样式变体 */
  variant?: 'primary' | 'secondary' | 'danger' | 'default'
}

withDefaults(defineProps<Props>(), {
  external: false,
  prefixText: '',
  suffixText: '',
  target: '_self',
  variant: 'primary'
})
</script>

<style scoped>
.link-wrapper {
  display: inline;
}

.link-prefix,
.link-suffix {
  color: inherit;
}

.link {
  color: var(--fgColor-link, #0969da);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 3px;
  padding: 0 2px;
}

.link:hover {
  color: var(--fgColor-link, #0969da);
  text-decoration: underline;
}

.link:active {
  color: var(--fgColor-link, #0969da);
}

/* 变体样式 */
.link-primary {
  color: var(--fgColor-link, #0969da);
}

.link-primary:hover {
  color: var(--fgColor-link, #0969da);
}

.link-secondary {
  color: var(--fgColor-muted, #59636e);
}

.link-secondary:hover {
  color: var(--fgColor-default, #1f2328);
}

.link-danger {
  color: var(--fgColor-danger, #d1242f);
}

.link-danger:hover {
  color: var(--fgColor-danger, #d1242f);
}

/* 外部链接样式 */
.link-external::after {
  content: '↗';
  font-size: 0.8em;
  margin-left: 2px;
}

/* 焦点样式 */
.link:focus {
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: 2px;
}

.link:focus:not(:focus-visible) {
  outline: none;
}
</style>
