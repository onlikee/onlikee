<template>
  <span :class="$style['link-wrapper']">
    <span
      v-if="prefixText"
      :class="$style['link-prefix']"
    >{{ prefixText }}</span>
    <a 
      :href="href" 
      :target="target" 
      :rel="(external || target === '_blank') ? 'noopener noreferrer' : undefined"
      :class="[$style['link'], {
        [$style['link-external']]: external,
        [$style['link-primary']]: variant === 'primary',
        [$style['link-secondary']]: variant === 'secondary',
        [$style['link-danger']]: variant === 'danger'
      }]"
    >
      {{ linkText }}
    </a>
    <span
      v-if="suffixText"
      :class="$style['link-suffix']"
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
<style module src="./Link.module.css" />
