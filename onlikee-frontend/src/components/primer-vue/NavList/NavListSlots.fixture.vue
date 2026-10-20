<script setup lang="ts">
import { NavList } from './index'

defineProps<{ showHeading: boolean; items: string[]; current: string }>()
</script>

<template>
  <NavList>
    <NavList.Heading v-if="showHeading" as="h3">Settings</NavList.Heading>
    <NavList.Group title="Fallback">
      <template v-if="showHeading">
        <NavList.GroupHeading :id="`${current}-heading`">{{ current }}</NavList.GroupHeading>
        <NavList.Item href="#fixed">Fixed</NavList.Item>
      </template>
      <NavList.Item v-for="item in items" :key="item" :href="`#${item}`">{{ item }}</NavList.Item>
    </NavList.Group>
    <NavList.Item>
      Parent
      <NavList.SubNav>
        <NavList.Item
          v-for="item in items"
          :key="item"
          :href="`#${item}`"
          :aria-current="item === current ? 'page' : undefined"
          >{{ item }}</NavList.Item
        >
      </NavList.SubNav>
    </NavList.Item>
  </NavList>
</template>
