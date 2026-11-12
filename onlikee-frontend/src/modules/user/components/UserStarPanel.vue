<template>
  <div class="user-star-panel" :data-user-id="profile.uuid" />
</template>

<script setup lang="ts">
import type { UserProfile } from '../api/user'

defineProps<{
  profile: UserProfile
}>()
</script>

<style scoped>
.user-star-panel {
  min-height: 1px;
}
</style>
