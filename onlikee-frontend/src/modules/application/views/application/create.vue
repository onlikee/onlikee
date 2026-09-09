<template>
  <Container>
    <div class="publish-method-header">
      <h1 class="title">
        选择发布方式
      </h1>
      <p class="subtitle">
        进入发布页面前，请先选择发布来源
      </p>
      <p class="subtitle">
        返回列表：<Link
          href="/application"
          link-text="应用广场"
        />
      </p>
    </div>

    <div class="options-grid">
      <button
        type="button"
        class="option-card"
        @click="goNew"
      >
        <div class="option-header">
          <h2 class="option-title">
            新建
          </h2>
          <p class="option-desc">
            在本站编辑/粘贴页面代码并发布
          </p>
        </div>
        <img
          class="create-image"
          src="@/modules/application/assets/create-new.svg"
          alt="Create New"
        >
      </button>

      <button
        type="button"
        class="option-card"
        @click="goConnect"
      >
        <div class="option-header">
          <h2 class="option-title">
            已有自己的网站？
          </h2>
          <p class="option-desc">
            提交站点链接与基本信息，直接发布
          </p>
        </div>
        <img
          class="create-image"
          src="@/modules/application/assets/create-connect.svg"
          alt="Create Connect"
        >
      </button>

      <button
        type="button"
        class="option-card"
        @click="goCollect"
      >
        <div class="option-header">
          <h2 class="option-title">
            收录
          </h2>
          <p class="option-desc">
            收录优质站点到应用广场
          </p>
        </div>
        <img
          class="create-image"
          src="@/modules/application/assets/create-collect.svg"
          alt="Create Collect"
        >
      </button>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { Container } from '@/components/primer-vue/Container'
import { Link } from '@/components/primer-vue/Link'

const router = useRouter()

function goNew() {
  router.push('/application/create/new')
}

function goConnect() {
  router.push('/application/create/connect')
}

function goCollect() {
  router.push('/application/create/collect')
}
</script>

<style scoped>
.publish-method-header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--fgColor-default);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.subtitle {
  font-size: 18px;
  color: var(--fgColor-muted);
  line-height: 1.6;
  max-width: 620px;
  margin: 0 auto;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  align-items: stretch;
}

.option-card {
  appearance: none;
  width: 100%;
  text-align: left;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
  background: var(--bgColor-muted);
  padding: 1.5rem;
  cursor: pointer;
}

.option-card:hover {
	outline: 2px solid var(--borderColor-accent-emphasis);
	outline-offset: -1px;
  box-shadow: 0 4px 14px -4px color-mix(in srgb, var(--fgColor-default) 8%, var(--bgColor-transparent));
}

.option-title {
  margin: 0 0 0.6rem 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--fgColor-default);
}

.option-desc {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--fgColor-muted);
}

.create-image {
  margin-top: 2rem;
  width: 70%;
  height: auto;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .title{
    font-size: 2rem;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .option-card {
    display: flex;
  }

  .option-header {
    width: 60%;
  }
  
  .create-image {
    width: 40%;
  }
}
</style>

