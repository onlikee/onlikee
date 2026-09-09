<template>
  <footer class="dialog-footer">
    <slot />
  </footer>
</template>

<style scoped>
.dialog-footer {
  align-items: center;
  background: var(--bgColor-default, #ffffff);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 1rem;
}

@media (max-width: 480px) {
  .dialog-footer {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .dialog-footer :deep(.button) {
    justify-content: center;
    width: 100%;
  }
}
</style>
