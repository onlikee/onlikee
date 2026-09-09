<template>
  <Container>
    <div class="components-header">
      <h1 class="title">
        Primer-Vue
      </h1>
      <p class="subtitle">
        这里展示本站自研的 UI 组件库，提供现代化、美观且易用的组件。
      </p>
      <p class="subtitle">
        所有组件都经过精心设计，支持 TypeScript 并遵循最佳实践。
      </p>
      <div class="actions">
        <RouterLink
          to="/component/overview"
          class="link"
        >
          探索一下
        </RouterLink>
      </div>
      <img
        src="@/modules/components/assets/components.svg"
        alt="Components Preview"
        class="components-preview"
      >
    </div>
  </Container>
</template>

<script setup lang="ts">
import { Container } from '@/components/primer-vue/Container'
</script>

<style scoped>
.components-header {
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

.link {
  display: inline-block;
  padding: 0.75rem 2rem;
  background-color: var(--bgColor-accent-emphasis);
  color: var(--fgColor-onEmphasis);
  border-radius: 6px;
  text-decoration: none;
}

.link:hover {
  background-color: var(--bgColor-accent-emphasis);
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.components-preview {
  width: min(100%, 800px);
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

}
</style>
