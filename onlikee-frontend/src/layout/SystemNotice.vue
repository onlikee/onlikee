<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { Banner } from '@/components/primer-vue/Banner'
import AriaStatus from '@/components/primer-vue/internal/components/AriaStatus.vue'
import { useSystemStatusStore } from '@/stores/systemStatus'

const systemStatus = useSystemStatusStore()
const notice = computed(() => {
  if (systemStatus.isOffline) {
    return {
      title: '网络连接已断开',
      description: '网络连接已断开，部分内容和操作可能不可用，请检查网络连接。',
    }
  }
  if (systemStatus.hasConnectionError) {
    return {
      title: '当前无法连接到服务器',
      description: '当前无法连接到服务器，请检查网络连接，如无问题服务可能正在维护或出现临时故障。',
    }
  }
  return null
})

function handleOffline() {
  systemStatus.setOffline(true)
}

function handleOnline() {
  systemStatus.setOffline(false)
}

onMounted(() => {
  systemStatus.setOffline(!navigator.onLine)
  window.addEventListener('offline', handleOffline)
  window.addEventListener('online', handleOnline)
})

onBeforeUnmount(() => {
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('online', handleOnline)
})
</script>

<template>
  <Banner v-if="notice" flush variant="warning" :title="notice.title" hide-title>
    <template #description>
      <AriaStatus announce-on-show>{{ notice.description }}</AriaStatus>
    </template>
  </Banner>
</template>
