<script setup lang="ts">
import { SubNav } from './index'
</script>

<template>
  <SubNav label="Projects" align="right" full>
    <SubNav.Links>
      <SubNav.Link href="#all" selected>All</SubNav.Link>
      <SubNav.Link :to="{ pathname: '/projects', search: '?archived=true' }">Archived</SubNav.Link>
    </SubNav.Links>
  </SubNav>
  <!-- @vue-expect-error selected is boolean -->
  <SubNav.Link selected="yes" />
  <!-- @vue-expect-error only legacy right alignment is accepted -->
  <SubNav align="left" />
</template>
