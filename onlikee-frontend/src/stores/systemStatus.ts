import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSystemStatusStore = defineStore('systemStatus', () => {
  const isOffline = ref(false)
  const hasConnectionError = ref(false)

  const setOffline = (offline: boolean) => {
    isOffline.value = offline
  }

  const setConnectionError = (hasError: boolean) => {
    hasConnectionError.value = hasError
  }

  return { isOffline, hasConnectionError, setOffline, setConnectionError }
})
