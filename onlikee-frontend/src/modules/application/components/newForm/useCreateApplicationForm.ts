import { computed, ref } from 'vue'
import type { UploadFile } from '@/components/primer-vue/Upload'

import type {
  CreateApplicationRequest
} from '@/modules/application/api/create-new'
import { createFolderZip, createHtmlZip } from '@/modules/application/utils/zip-utils'

export type FrameworkValue = 'html' | 'vue' | 'react'

export function useCreateApplicationForm() {
  const selectedFramework = ref<FrameworkValue | null>(null)
  const files = ref<UploadFile[]>([])
  const htmlSource = ref('<div>hello, world!</div>')

  const appName = ref('')
  const appSubDomain = ref('')
  const visibility = ref('公开的')
  const appDescription = ref('')

  const submitAttempted = ref(false)
  const touchedFile = ref(false)
  const touchedHtmlSource = ref(false)
  const touchedAppName = ref(false)
  const touchedAppSubDomain = ref(false)
  const touchedAppDescription = ref(false)

  const frameworkError = computed(() => {
    return selectedFramework.value === null ? '请选择一个前端框架。' : ''
  })

  const uploadError = computed(() => {
    if (selectedFramework.value === null) {
      return ''
    }

    if (selectedFramework.value === 'html') {
      return htmlSource.value.trim() ? '' : '请输入 HTML 代码。'
    }

    if (files.value.length === 0) {
      return '请选择非空的构建产物文件夹。'
    }

    const rootDirectory = files.value[0].relativePath.split('/')[0]
    const isSingleDirectory = rootDirectory && files.value.every(({ relativePath }) => {
      const segments = relativePath.split('/')
      return segments.length > 1
        && segments[0] === rootDirectory
        && segments.every(segment => segment !== '' && segment !== '.' && segment !== '..')
    })

    return isSingleDirectory ? '' : '请只选择一个构建产物文件夹，不支持直接上传 ZIP 或散文件。'
  })

  const appNameError = computed(() => {
    if (!appName.value.trim()) {
      return '请输入应用名称。'
    }

    if (appName.value.length > 100) {
      return '应用名称不能超过 100 个字符。'
    }

    return ''
  })

  const appSubDomainError = computed(() => {
    const trimmedAppSubDomain = appSubDomain.value.trim()

    if (!trimmedAppSubDomain) {
      return '请输入应用地址。'
    }

    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(appSubDomain.value)) {
      return '仅支持小写字母、数字和连字符（-），且不能以连字符开头或结尾。'
    }

    if (appSubDomain.value.length > 63) {
      return '不能超过 63 个字符。'
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

  const displayedAppSubDomainError = computed(() => {
    return submitAttempted.value || touchedAppSubDomain.value ? appSubDomainError.value : ''
  })

  const displayedAppDescriptionError = computed(() => {
    return submitAttempted.value || touchedAppDescription.value ? appDescriptionError.value : ''
  })

  const showFrameworkError = computed(() => {
    return submitAttempted.value && Boolean(frameworkError.value)
  })

  const showUploadError = computed(() => {
    if (!uploadError.value) {
      return false
    }

    if (submitAttempted.value) {
      return true
    }

    return selectedFramework.value === 'html' ? touchedHtmlSource.value : touchedFile.value
  })

  const isFormValid = computed(() => {
    return !frameworkError.value
      && !uploadError.value
      && !appNameError.value
      && !appSubDomainError.value
      && !appDescriptionError.value
  })

  function setFramework(value: FrameworkValue) {
    selectedFramework.value = value

    if (value === 'html') {
      files.value = []
      touchedFile.value = false
      return
    }

    htmlSource.value = ''
    touchedHtmlSource.value = false
  }

  function setFiles(value: UploadFile[]) {
    touchedFile.value = true
    files.value = value
  }

  function setHtmlSource(value: string) {
    touchedHtmlSource.value = true
    htmlSource.value = value
  }

  function setAppName(value: string) {
    touchedAppName.value = true
    appName.value = value
  }

  function setAppSubDomain(value: string) {
    touchedAppSubDomain.value = true
    appSubDomain.value = value
  }

  function setVisibility(value: string) {
    visibility.value = value
  }

  function setAppDescription(value: string) {
    touchedAppDescription.value = true
    appDescription.value = value
  }

  async function buildRequest(): Promise<CreateApplicationRequest> {
    const framework = selectedFramework.value as FrameworkValue
    const htmlSourceSnapshot = htmlSource.value
    const filesSnapshot = files.value.map(({ file, relativePath }) => ({ file, relativePath }))
    const requestSnapshot = {
      framework,
      appName: appName.value,
      appSubDomain: appSubDomain.value,
      visibility: visibility.value,
      appDescription: appDescription.value
    }
    const appFile = framework === 'html'
      ? await createHtmlZip(htmlSourceSnapshot)
      : await createFolderZip(filesSnapshot)

    return {
      ...requestSnapshot,
      appFile,
    }
  }

  function prepareSubmit() {
    submitAttempted.value = true
    return isFormValid.value
  }

  return {
    selectedFramework,
    files,
    htmlSource,
    appName,
    appSubDomain,
    visibility,
    appDescription,
    frameworkError,
    uploadError,
    displayedAppNameError,
    displayedAppSubDomainError,
    displayedAppDescriptionError,
    showFrameworkError,
    showUploadError,
    setFramework,
    setFiles,
    setHtmlSource,
    setAppName,
    setAppSubDomain,
    setVisibility,
    setAppDescription,
    prepareSubmit,
    buildRequest
  }
}
