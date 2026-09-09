<template>
  <div class="first-step">
    <div
      class="options-grid"
      :class="{ 'options-grid--invalid': invalid }"
    >
      <button
        type="button"
        class="option-card"
        :class="{ 'option-card--active': selectedFramework === 'html' }"
        :aria-pressed="selectedFramework === 'html'"
        @click="selectFramework('html')"
      >
        <div class="option-header">
          <div class="option-title">
            HTML<Tag>推荐</Tag>
          </div>
          <p class="option-desc">
            从一段HTML代码开始！
          </p>
        </div>
        <img
          class="create-image"
          src="@/modules/application/assets/new-html.svg"
          alt="Create Collect"
        >
      </button>

      <button
        type="button"
        class="option-card"
        :class="{ 'option-card--active': selectedFramework === 'vue' }"
        :aria-pressed="selectedFramework === 'vue'"
        @click="selectFramework('vue')"
      >
        <div class="option-header">
          <div class="option-title">
            Vue
          </div>
          <p class="option-desc">
            从一个Vue项目开始！
          </p>
        </div>
        <img
          class="create-image"
          src="@/modules/application/assets/new-vue.svg"
          alt="Create New"
        >
      </button>

      <button
        type="button"
        class="option-card"
        :class="{ 'option-card--active': selectedFramework === 'react' }"
        :aria-pressed="selectedFramework === 'react'"
        @click="selectFramework('react')"
      >
        <div class="option-header">
          <div class="option-title">
            React
          </div>
          <p class="option-desc">
            从一个React项目开始！
          </p>
        </div>
        <img
          class="create-image"
          src="@/modules/application/assets/new-react.svg"
          alt="Create Website"
        >
      </button>
    </div>
    <p
      v-if="invalid && validation"
    >
      <FormControlValidation variant="error">
        {{ validation }}
      </FormControlValidation>
    </p>
  </div>
</template>

<script setup lang="ts">
import { Tag } from '@/components/primer-vue/Tag'
import type { FrameworkValue } from './useCreateApplicationForm'
import { FormControlValidation } from '@/components/primer-vue/FormControl'

interface Props {
  selectedFramework: FrameworkValue | null
  invalid?: boolean
  validation?: string
}

withDefaults(defineProps<Props>(), {
  invalid: false,
  validation: ''
})

const emit = defineEmits<{
  'update:selected-framework': [value: FrameworkValue]
}>()

function selectFramework(framework: FrameworkValue) {
  emit('update:selected-framework', framework)
}
</script>

<style scoped>
.first-step {
  display: grid;
  gap: 8px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.options-grid--invalid .option-card {
  border-color: var(--borderColor-danger-emphasis, #cf222e);
}

.option-card {
  appearance: none;
  width: 100%;
  text-align: left;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
  background: var(--bgColor-muted);
  padding: 1rem;
  cursor: pointer;
}

.option-card:hover,
.option-card--active {
  outline: 2px solid var(--borderColor-accent-emphasis);
  outline-offset: -1px;
  box-shadow: 0 4px 14px -4px color-mix(in srgb, var(--fgColor-default) 8%, var(--bgColor-transparent));
}

.option-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--fgColor-default);
  font-size: 1rem;
  font-weight: 700;
}

.option-desc {
  margin: 0;
  color: var(--fgColor-muted);
  font-size: 14px;
  line-height: 1.6;
}

.create-image {
  width: 50%;
  height: auto;
  margin-top: 0.5rem;
}

.icon-svg {
  margin-top: 2px;
  margin-right: 4px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .option-card {
    display: flex;
  }

  .option-header {
    width: 60%;
  }

  .option-title {
    margin-bottom: 0.6rem;
  }

  .create-image {
    width: 30%;
    margin-top: 0;
  }
}
</style>
