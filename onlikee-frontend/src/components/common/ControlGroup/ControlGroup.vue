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

.control-group > .control-group-item + :slotted(.control-group-item)::before {
  display: block;
  margin-inline: -12px;
  border-block-start: 1px solid var(--borderColor-muted);
  content: '';
}
</style>
