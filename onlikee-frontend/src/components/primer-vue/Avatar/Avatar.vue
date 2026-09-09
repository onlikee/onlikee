<template>
  <div
    class="avatar"
    :style="avatarStyle"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="avatar-img"
    >
    <span
      v-else
      class="avatar-placeholder"
    >{{ placeholder }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  src?: string
  alt?: string
  placeholder?: string
  size?: number | string
}>()

const avatarStyle = computed(() => {
  const s = props.size ?? 40
  const px = typeof s === 'number' ? `${s}px` : s
  return { width: px, height: px, fontSize: `${parseInt(String(s)) * 0.35}px` }
})
</script>

<style scoped>
.avatar {
  box-sizing: content-box;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: 1px solid var(--borderColor-default, #d1d9e0);
  border-radius: 50%;
  background: color-mix(in srgb, var(--bgColor-default, #ffffff) 80%, var(--bgColor-transparent, #ffffff00));
  backdrop-filter: blur(8px);
  font-weight: 600;
  overflow: hidden;
}

.avatar:hover {
  background: var(--bgColor-default, #ffffff);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--fgColor-default, #1f2328) 8%, var(--bgColor-transparent, #ffffff00));
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: var(--fgColor-default, #1f2328);
}
</style>
