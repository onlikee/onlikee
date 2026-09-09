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
        收录
      </div>
      <span class="page-description">
        收录优质站点到应用广场
      </span>
    </div>

    <Timeline clip-sidebar>
      <Timeline.Item>
        <Timeline.Badge>1</Timeline.Badge>
        <Timeline.Body>
          <div class="creatForm-heading">
            填写网站与基本信息
          </div>
          <FirstStep
            :collect-name="collectName"
            :collect-url="collectUrl"
            :collect-visibility="collectVisibility"
            :collect-description="collectDescription"
            :collect-name-error="displayedCollectNameError"
            :collect-url-error="displayedCollectUrlError"
            :collect-description-error="displayedCollectDescriptionError"
            @update:collect-name="setCollectName"
            @update:collect-url="setCollectUrl"
            @update:collect-visibility="setCollectVisibility"
            @update:collect-description="setCollectDescription"
          />
        </Timeline.Body>
      </Timeline.Item>
    </Timeline>
    <div class="submit-actions">
      <Button
        variant="primary"
        :loading="isSubmitting"
        @click="submit"
      >
        <Button.leadingVisual>
          <RocketIcon />
        </Button.leadingVisual>
        发布应用
      </Button>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Container } from '@/components/primer-vue/Container'
import { Button } from '@/components/primer-vue/Button'
import { Timeline } from '@/components/primer-vue/Timeline'
import { applicationCreateCollect } from '@/modules/application/api/create-collect'
import FirstStep from '@/modules/application/components/collectForm/FirstStep.vue'
import { useCollectApplicationForm } from '@/modules/application/components/collectForm/useCollectApplicationForm'
import RocketIcon from '@/components/octicons-vue3/icons/rocket.vue'

const router = useRouter()

const {
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
  buildRequest
} = useCollectApplicationForm()

const isSubmitting = ref(false)

async function submit() {
  if (isSubmitting.value) {
    return
  }

  if (!prepareSubmit()) {
    return
  }

  isSubmitting.value = true
  try {
    const response = await applicationCreateCollect(buildRequest())
    await router.push({
      path: '/application/create/success',
      query: {
        method: 'collect',
        appUrl: response.appUrl
      }
    })
  } finally {
    isSubmitting.value = false
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
