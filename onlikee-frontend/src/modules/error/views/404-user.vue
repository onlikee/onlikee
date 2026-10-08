<template>
  <main class="not-found-page">
    <img class="not-found-image" src="../assets/404-user.svg" alt="404 User Not Found" />
    <p class="not-found-text">404 User not found.</p>
  </main>
</template>

<style scoped>
.not-found-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px;
}

.not-found-image {
  width: min(100%, 600px);
}

.not-found-text {
  margin: 0;
  color: var(--fgColor-muted);
  text-align: center;
}
</style>
