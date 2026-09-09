<template>
  <div class="dialog-body">
    <slot />
  </div>
</template>

<style scoped>
.dialog-body {
  color: var(--fgColor-default, #1f2328);
  flex: 1 1 auto;
  font-size: 0.875rem;
  line-height: 1.5;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 1rem;
}

.dialog-body :deep(p) {
  margin: 0 0 0.75rem;
}

.dialog-body :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
