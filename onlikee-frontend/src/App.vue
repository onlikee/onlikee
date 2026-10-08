<script setup lang="ts">
import MainHeader from '@/layout/Header.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// 判断是否需要隐藏 Header（ComponentLayout 页面和登录页面）
const shouldHideHeader = computed(() => {
  return (
    route.path === '/auth/login' ||
    route.path === '/auth/logout' ||
    route.path === '/auth/signup-complete'
  )
})
</script>

<template>
  <div id="app" class="page">
    <MainHeader v-if="!shouldHideHeader" />
    <router-view />
  </div>
</template>

<style scoped>
.page {
  background-color: var(--bgColor-default);
  min-height: 100vh;
}
</style>
