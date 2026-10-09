import { computed, ref } from 'vue'

import type { CollectApplicationRequest } from '@/modules/application/api/create-collect'

export function useCollectApplicationForm() {
  const collectName = ref('')
  const collectUrl = ref('')
  const collectVisibility = ref('公开的')
  const collectDescription = ref('')

  const submitAttempted = ref(false)
  const touchedCollectName = ref(false)
  const touchedCollectUrl = ref(false)
  const touchedCollectDescription = ref(false)

  const collectNameError = computed(() => {
    if (!collectName.value.trim()) {
      return '请输入应用名称。'
    }

    if (collectName.value.length > 100) {
      return '应用名称不能超过 100 个字符。'
    }

    return ''
  })

  const collectUrlError = computed(() => {
    if (!collectUrl.value.trim()) {
      return '请输入网站地址。'
    }

    return ''
  })

  const collectDescriptionError = computed(() => {
    if (!collectDescription.value.trim()) {
      return '请输入应用描述。'
    }

    if (collectDescription.value.length > 1000) {
      return '应用描述不能超过 1000 个字符。'
    }

    return ''
  })

  const displayedCollectNameError = computed(() => {
    return submitAttempted.value || touchedCollectName.value ? collectNameError.value : ''
  })

  const displayedCollectUrlError = computed(() => {
    return submitAttempted.value || touchedCollectUrl.value ? collectUrlError.value : ''
  })

  const displayedCollectDescriptionError = computed(() => {
    return submitAttempted.value || touchedCollectDescription.value
      ? collectDescriptionError.value
      : ''
  })

  const isFormValid = computed(() => {
    return !collectNameError.value && !collectUrlError.value && !collectDescriptionError.value
  })

  function setCollectName(value: string) {
    touchedCollectName.value = true
    collectName.value = value
  }

  function setCollectUrl(value: string) {
    touchedCollectUrl.value = true
    collectUrl.value = value
  }

  function setCollectVisibility(value: string) {
    collectVisibility.value = value
  }

  function setCollectDescription(value: string) {
    touchedCollectDescription.value = true
    collectDescription.value = value
  }

  function buildRequest(): CollectApplicationRequest {
    return {
      appName: collectName.value,
      appUrl: collectUrl.value,
      visibility: collectVisibility.value,
      appDescription: collectDescription.value,
    }
  }

  function prepareSubmit() {
    submitAttempted.value = true
    return isFormValid.value
  }

  return {
    collectName,
    collectUrl,
    collectVisibility,
    collectDescription,
    displayedCollectNameError,
    displayedCollectUrlError,
    displayedCollectDescriptionError,
    setCollectName,
    setCollectUrl,
    setCollectVisibility,
    setCollectDescription,
    prepareSubmit,
    buildRequest,
  }
}
