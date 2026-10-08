<template>
  <main class="not-found-page">
    <img class="not-found-image" src="../assets/404.svg" alt="404 Not Found" />
    <p class="not-found-text">404 This is not the web page you are looking for.</p>
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
