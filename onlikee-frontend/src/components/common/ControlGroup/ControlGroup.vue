<template>
  <section class="control-group">
    <slot />
  </section>
</template>

<style scoped>
.control-group {
  border: 1px solid var(--borderColor-muted);
  border-radius: 6px;
  background: var(--bgColor-default);
}

:slotted(.control-group-item:not(:first-child)) {
  border-block-start: 1px solid var(--borderColor-muted);
}
</style>
