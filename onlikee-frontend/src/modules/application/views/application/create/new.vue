<template>
  <Container
    max-width="768px"
  >
    <div class="ad-placeholder">
      <img
        src="@/modules/application/assets/ad.png"
        class="ad-image"
        alt="广告位图片"
      >
    </div>
    <div class="page-header">
      <div class="page-title">
        创建一个新的应用
      </div>
      <span class="page-description">
        请确保代码能够正确运行！
      </span>
    </div>

    <Timeline clip-sidebar>
      <Timeline.Item>
        <Timeline.Badge>1</Timeline.Badge>
        <Timeline.Body>
          <div class="creatForm-heading">
            点击选择你使用的前端框架
          </div>
          <FirstStep
            :selected-framework="selectedFramework"
            :invalid="showFrameworkError"
            :validation="frameworkError"
            @update:selected-framework="setFramework"
          />
        </Timeline.Body>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Badge>2</Timeline.Badge>
        <Timeline.Body>
          <div class="creatForm-heading">
            上传应用 & 代码
          </div>
          <SecondStep
            :files="files"
            :html-source="htmlSource"
            :selected-framework="selectedFramework"
            :invalid="showUploadError"
            :validation="uploadError"
            @update:files="setFiles"
            @update:html-source="setHtmlSource"
          />
        </Timeline.Body>
      </Timeline.Item>
      <Timeline.Item>
        <Timeline.Badge>3</Timeline.Badge>
        <Timeline.Body>
          <div class="creatForm-heading">
            填写基本信息
          </div>
          <ThirdStep
            :app-name="appName"
            :app-sub-domain="appSubDomain"
            :visibility="visibility"
            :app-description="appDescription"
            :app-name-error="displayedAppNameError"
            :app-sub-domain-error="displayedAppSubDomainError"
            :app-description-error="displayedAppDescriptionError"
            @update:app-name="setAppName"
            @update:app-sub-domain="setAppSubDomain"
            @update:visibility="setVisibility"
            @update:app-description="setAppDescription"
          />
        </Timeline.Body>
      </Timeline.Item>
    </Timeline>
    <div class="submit-actions">
      <Button
        variant="primary"
        :loading="isUploading"
        @click="submit"
      >
        <Button.leadingVisual>
          <RocketIcon />
        </Button.leadingVisual>
        创建应用
      </Button>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Container } from '@/components/primer-vue/Container'
import { Button } from '@/components/primer-vue/Button'
import { Banner } from '@/components/primer-vue/Banner'
import { Timeline } from '@/components/primer-vue/Timeline'
import { applicationCreateNew } from '@/modules/application/api/create-new'
import FirstStep from '@/modules/application/components/newForm/FirstStep.vue'
import SecondStep from '@/modules/application/components/newForm/SecondStep.vue'
import ThirdStep from '@/modules/application/components/newForm/ThirdStep.vue'
import { useCreateApplicationForm } from '@/modules/application/components/newForm/useCreateApplicationForm'
import RocketIcon from '@/components/octicons-vue3/icons/rocket.vue'

const router = useRouter()

const {
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
} = useCreateApplicationForm()

const isUploading = ref(false)

async function submit() {
  if (isUploading.value) {
    return
  }

  if (!prepareSubmit()) {
    return
  }

  isUploading.value = true
  try {
    let request
    try {
      request = await buildRequest()
    } catch {
      Banner.error('应用打包失败，请重试。')
      return
    }

    const response = await applicationCreateNew(request)
    await router.push({
      path: '/application/create/success',
      query: {
        appUrl: response.appUrl
      }
    })
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.ad-placeholder {
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
  border-radius: 12px;
}

.ad-image {
  display: block;
  width: 100%;
  height: auto;
}

.ad-placeholder::after {
  position: absolute;
  right: 1rem;
  bottom: 2rem;
  padding: 0.4rem 0.5rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--fgColor-default) 50%, transparent);
  color: var(--bgColor-default);
  font-size: 12px;
  line-height: 1;
  font-weight: 600;
  box-shadow: 0 8px 24px -12px color-mix(in srgb, var(--fgColor-default) 48%, transparent);
  content: "展示广告位，联系2533643340@qq.com";
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 2rem;
  margin-bottom: 2rem;
}

.page-title {
  color: var(--fgColor-default);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.25;
}

.page-description {
  color: var(--fgColor-muted);
  display: block;
  font-size: 14px;
  line-height: 1.6;
}

.creatForm-heading {
  line-height: 24px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--fgColor-default);
  margin-bottom: 1rem;
}

.submit-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .page-header {
    margin-top: 2rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-description {
    font-size: 0.875rem;
  }
}
</style>
