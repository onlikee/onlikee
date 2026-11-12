<template>
  <div class="user-application-tab" :data-user-id="profile.uuid" />
</template>

<script setup lang="ts">
import type { UserProfile } from '../api/user'

defineProps<{
  profile: UserProfile
}>()
</script>

<style scoped>
.user-application-tab {
  min-height: 1px;
}
</style>
