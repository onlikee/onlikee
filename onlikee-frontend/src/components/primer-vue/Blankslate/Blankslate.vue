<script setup lang="ts">
withDefaults(
  defineProps<{
    border?: boolean
    narrow?: boolean
    spacious?: boolean
    size?: 'small' | 'medium' | 'large'
  }>(),
  {
    border: false,
    narrow: false,
    spacious: false,
    size: 'medium',
  },
)
</script>

<template>
  <section :class="$style['blankslate-container']">
    <div
      :class="[
        $style['blankslate'],
        {
          [$style['blankslate--border']]: border,
          [$style['blankslate--narrow']]: narrow,
          [$style['blankslate--spacious']]: spacious,
        },
      ]"
      :data-size="size"
    >
      <slot />
    </div>
  </section>
</template>

<style module src="./Blankslate.module.css"></style>
