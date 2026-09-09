<template>
  <Container>
    <div class="application-header">
      <h1 class="application-title">
        Web应用
      </h1>
      <p class="application-subtitle">
        从一个小创意开始🐱。
      </p>
      <p class="application-subtitle">
        想上传自己的Web应用吗？请<Link
          href="/application/create"
          link-text="点击这里！"
        />欢迎大家上传！
      </p>
      <p class="application-subtitle">
        希望这些应用能够帮到你。
      </p>
    </div>

    <div class="applications-grid">
      <div
        v-for="application in applications"
        :key="application.id"
        class="application-card"
      >
        <div class="application-content">
          <div class="application-header-info">
            <h3 class="application-name">
              {{ application.title }}
            </h3>
            <span class="application-category">{{ application.category }}</span>
          </div>
          <div class="application-description">
            <p>{{ application.description.zh }}</p>
            <p class="description-en">
              {{ application.description.en }}
            </p>
          </div>
          <div class="application-actions">
            <div
              v-if="application.isOriginal && application.author"
              class="author-info"
            >
              <img
                :src="application.authorAvatar"
                :alt="application.author"
                class="author-avatar"
              >
              <a
                :href="application.authorLink"
                class="author-link"
              >{{ application.author }}</a>
            </div>
            <div
              v-if="!application.isOriginal"
              class="collected-badge"
            >
              该应用为本站收录
            </div>
            <a
              v-if="application.isOriginal"
              :href="application.link"
              class="try-button"
            >
              Try it
            </a>
            <a
              v-else
              :href="application.link"
              target="_blank"
              class="try-button"
            >
              Try it
            </a>
          </div>
        </div>
      </div>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Container } from '@/components/primer-vue/Container'
import { Link } from '@/components/primer-vue/Link'

interface ApplicationDescription {
  zh: string
  en: string
}

interface Application {
  id: number
  title: string
  description: ApplicationDescription
  category: string
  link: string
  isOriginal: boolean
  author: string
  authorLink: string
  authorAvatar: string
}

const applications = ref<Application[]>([])

</script>

<style scoped>
.application-header {
  text-align: center;
  margin-bottom: 3rem;
}

.application-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--fgColor-default);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.application-subtitle {
  font-size: 18px;
  color: var(--fgColor-muted);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.applications-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.application-card {
  background: var(--bgColor-default);
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
  padding: 2rem;
  display: flex;
  min-height: 180px;
}

.application-card:hover {
  outline: 2px solid var(--borderColor-accent-emphasis);
  outline-offset: -1px;
  box-shadow: 0 4px 14px -4px color-mix(in srgb, var(--fgColor-default) 8%, var(--bgColor-transparent));
}

.application-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.application-header-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.application-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--fgColor-default);
  line-height: 1.3;
  flex: 1;
}

.application-category {
  font-size: 0.75rem;
  color: var(--fgColor-muted);
  background-color: var(--bgColor-muted);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.application-description {
  flex: 1;
}

.application-description p {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--fgColor-default);
}

.description-en {
  color: var(--fgColor-muted) !important;
  font-style: italic;
  font-size: 0.9rem !important;
}

.application-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar {
  width: 30px;
  height: 30px;
  border-radius: 30px;
  border: 1px solid var(--borderColor-default);
  object-fit: cover;
}

.author-link {
  font-size: 1rem;
  font-weight: 600;
  color: var(--fgColor-link);
  text-decoration: underline;
}

.author-link:hover {
  text-decoration: underline;
}

.collected-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--fgColor-muted);
  background-color: var(--bgColor-muted);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}



.try-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--bgColor-accent-emphasis);
  color: var(--fgColor-onEmphasis);
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.try-button:hover {
  background-color: var(--bgColor-accent-emphasis);
}

@media (max-width: 768px) {
  .application-title {
    font-size: 2rem;
  }

  .application-subtitle {
    font-size: 1rem;
  }

  .applications-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .application-card {
    padding: 1.5rem;
    flex-direction: column;
    gap: 1rem;
    min-height: auto;
  }



  .application-header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .application-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .author-info { order: 2; }
  .try-button { order: 1; align-self: flex-end; }

  .try-button {
    align-self: flex-end;
  }
}
</style>
