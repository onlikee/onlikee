<template>
  <div :class="[$style['steps'], $style[`steps--${orientation}`]]">
    <div
      v-for="(step, i) in steps"
      :key="i"
      :class="$style['steps__item']"
      :data-state="getState(i)"
    >
      <span :class="$style['steps__indicator']">
        <slot :name="`icon-${i}`" :state="getState(i)" :index="i">
          {{ i + 1 }}
        </slot>
      </span>
      <div v-if="i < steps.length - 1" :class="$style['steps__separator']" />
      <div :class="$style['steps__content']">
        <span :class="$style['steps__title']">{{ step.title }}</span>
        <span v-if="step.description" :class="$style['steps__description']">{{
          step.description
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface StepItem {
  title: string
  description?: string
}

const props = withDefaults(
  defineProps<{
    steps: StepItem[]
    modelValue?: number
    orientation?: 'horizontal' | 'vertical'
  }>(),
  {
    modelValue: 0,
    orientation: 'horizontal',
  },
)

defineEmits<{ 'update:modelValue': [value: number] }>()

const getState = (i: number) =>
  i < props.modelValue ? 'completed' : i === props.modelValue ? 'active' : 'inactive'
</script>
<style module src="./Steps.module.css" />
