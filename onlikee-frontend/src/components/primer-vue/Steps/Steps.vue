<template>
  <div
    class="steps"
    :class="`steps--${orientation}`"
  >
    <div
      v-for="(step, i) in steps"
      :key="i"
      class="steps__item"
      :data-state="getState(i)"
    >
      <span class="steps__indicator">
        <slot
          :name="`icon-${i}`"
          :state="getState(i)"
          :index="i"
        >
          {{ i + 1 }}
        </slot>
      </span>
      <div
        v-if="i < steps.length - 1"
        class="steps__separator"
      />
      <div class="steps__content">
        <span class="steps__title">{{ step.title }}</span>
        <span
          v-if="step.description"
          class="steps__description"
        >{{ step.description }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface StepItem {
	title: string
	description?: string
}

const props = withDefaults(defineProps<{
	steps: StepItem[]
	modelValue?: number
	orientation?: 'horizontal' | 'vertical'
}>(), {
	modelValue: 0,
	orientation: 'horizontal'
})

defineEmits<{ 'update:modelValue': [value: number] }>()

const getState = (i: number) =>
	i < props.modelValue ? 'completed' : i === props.modelValue ? 'active' : 'inactive'
</script>

<style scoped>
.steps {
	--step-indicator-size: 32px;
	--step-separator-size: 2px;
	--step-separator-offset: 8px;
	--step-gap: 8px;
	display: flex;
	align-items: flex-start;
	gap: var(--step-gap);
	width: 100%;
}

.steps__item {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	gap: 8px;
}

.steps__indicator {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: var(--step-indicator-size);
	height: var(--step-indicator-size);
	border-radius: 50%;
	font-size: 14px;
	font-weight: 600;
	background-color: var(--bgColor-neutral-muted, #d1d9e080);
	color: var(--fgColor-muted, #656d76);
	transition: background-color 0.2s, color 0.2s;
}

[data-state="active"] .steps__indicator {
	background-color: var(--bgColor-accent-emphasis, #0969da);
	color: var(--fgColor-onEmphasis, #fff);
}

[data-state="completed"] .steps__indicator {
	background-color: var(--bgColor-accent-emphasis, #0969da);
	color: var(--fgColor-onEmphasis, #fff);
}

.steps__separator {
	position: absolute;
	left: calc(50% + var(--step-indicator-size) / 2 + var(--step-separator-offset));
	right: calc(-50% - var(--step-gap) + var(--step-indicator-size) / 2 + var(--step-separator-offset));
	top: calc(var(--step-indicator-size) / 2 - var(--step-separator-size) / 2);
	height: var(--step-separator-size);
	border-radius: 2px;
	background-color: var(--borderColor-muted, #d1d9e0);
	transition: background-color 0.2s;
}

[data-state="completed"] .steps__separator {
	background-color: var(--bgColor-accent-emphasis, #0969da);
}

.steps__content {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.steps__title {
	font-size: 14px;
	font-weight: 600;
	color: var(--fgColor-default, #1f2328);
	white-space: nowrap;
}

.steps__description {
	font-size: 12px;
	color: var(--fgColor-muted, #656d76);
}

/* vertical */
.steps--vertical {
	flex-direction: column;
	gap: 0;
}

.steps--vertical .steps__item {
	flex-direction: row;
	align-items: flex-start;
	gap: 12px;
}

.steps--vertical .steps__separator {
	position: absolute;
	left: calc(var(--step-indicator-size) / 2 - var(--step-separator-size) / 2);
	top: calc(var(--step-indicator-size) + 4px);
	bottom: -8px;
	right: auto;
	width: var(--step-separator-size);
	height: auto;
}

.steps--vertical .steps__content {
	align-items: flex-start;
	text-align: left;
	padding-bottom: 24px;
}

/* responsive < 768px */
@media (max-width: 767px) {
	.steps--horizontal {
		--step-indicator-size: 24px;
		--step-separator-offset: 4px;
		--step-gap: 4px;
	}

	.steps--horizontal .steps__indicator {
		font-size: 12px;
	}

	.steps--horizontal .steps__title {
		font-size: 12px;
	}
}
</style>
