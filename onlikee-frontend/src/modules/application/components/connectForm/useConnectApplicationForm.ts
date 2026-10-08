import { computed, ref } from 'vue'

import type { ConnectApplicationRequest } from '@/modules/application/api/create-connect'

export function useConnectApplicationForm() {
  const appName = ref('')
  const appUrl = ref('')
  const visibility = ref('公开的')
  const appDescription = ref('')

  const submitAttempted = ref(false)
  const touchedAppName = ref(false)
  const touchedAppUrl = ref(false)
  const touchedAppDescription = ref(false)

  const appNameError = computed(() => {
    if (!appName.value.trim()) {
      return '请输入应用名称。'
    }

    if (appName.value.length > 100) {
      return '应用名称不能超过 100 个字符。'
    }

    return ''
  })

  const appUrlError = computed(() => {
    if (!appUrl.value.trim()) {
      return '请输入网站地址。'
    }

    return ''
  })

  const appDescriptionError = computed(() => {
    if (!appDescription.value.trim()) {
      return '请输入应用描述。'
    }

    if (appDescription.value.length > 1000) {
      return '应用描述不能超过 1000 个字符。'
    }

    return ''
  })

  const displayedAppNameError = computed(() => {
    return submitAttempted.value || touchedAppName.value ? appNameError.value : ''
  })

  const displayedAppUrlError = computed(() => {
    return submitAttempted.value || touchedAppUrl.value ? appUrlError.value : ''
  })

  const displayedAppDescriptionError = computed(() => {
    return submitAttempted.value || touchedAppDescription.value ? appDescriptionError.value : ''
  })

  const isFormValid = computed(() => {
    return !appNameError.value && !appUrlError.value && !appDescriptionError.value
  })

  function setAppName(value: string) {
    touchedAppName.value = true
    appName.value = value
  }

  function setAppUrl(value: string) {
    touchedAppUrl.value = true
    appUrl.value = value
  }

  function setVisibility(value: string) {
    visibility.value = value
  }

  function setAppDescription(value: string) {
    touchedAppDescription.value = true
    appDescription.value = value
  }

  function buildRequest(): ConnectApplicationRequest {
    return {
      appName: appName.value,
      appUrl: appUrl.value,
      visibility: visibility.value,
      appDescription: appDescription.value,
    }
  }

  function prepareSubmit() {
    submitAttempted.value = true
    return isFormValid.value
  }

  return {
    appName,
    appUrl,
    visibility,
    appDescription,
    displayedAppNameError,
    displayedAppUrlError,
    displayedAppDescriptionError,
    setAppName,
    setAppUrl,
    setVisibility,
    setAppDescription,
    prepareSubmit,
    buildRequest,
  }
}
