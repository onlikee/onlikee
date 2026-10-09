<script setup lang="ts">
import { computed, toRaw } from 'vue'
import { Spinner } from '../Spinner'
import { FilteredActionListLoadingTypes, type FilteredActionListLoadingType } from './types'
const props = withDefaults(
  defineProps<{ loadingType?: FilteredActionListLoadingType; height?: number }>(),
  { loadingType: () => FilteredActionListLoadingTypes.bodySpinner, height: 0 },
)
const rows = computed(() => (props.height < 24 ? 3 : Math.floor(props.height / 24)))
// 先解包响应式代理，再按加载模式对象的引用判断展示类型。
const isBodySpinner = computed(
  () => toRaw(props.loadingType) === FilteredActionListLoadingTypes.bodySpinner,
)
const isBodySkeleton = computed(
  () => toRaw(props.loadingType) === FilteredActionListLoadingTypes.bodySkeleton,
)
</script>
<template>
  <div
    v-if="isBodySpinner"
    :class="$style['filtered-action-list__loader']"
    data-component="FilteredActionList.Spinner"
  >
    <Spinner data-testid="filtered-action-list-spinner" />
  </div>
  <div
    v-else-if="isBodySkeleton"
    :class="$style['filtered-action-list__skeleton']"
    data-component="FilteredActionList.Skeleton"
  >
    <div
      :class="$style['filtered-action-list__stack']"
      data-component="Stack"
      data-direction="vertical"
      data-justify="center"
      data-gap="condensed"
      data-testid="filtered-action-list-skeleton"
    >
      <div
        v-for="row in rows"
        :key="row"
        :class="[
          $style['filtered-action-list__stack'],
          $style['filtered-action-list__skeleton-row'],
        ]"
        data-component="Stack"
        data-direction="horizontal"
        data-gap="condensed"
        data-align="center"
        data-justify="start"
      >
        <div
          :class="$style['filtered-action-list__skeleton-box']"
          data-component="SkeletonBox"
          style="width: 16px; height: 16px"
        />
        <div
          :class="[
            $style['filtered-action-list__skeleton-box'],
            $style['filtered-action-list__skeleton-bar'],
          ]"
          data-component="SkeletonBox"
          style="height: 10px"
        />
      </div>
    </div>
  </div>
</template>
<style module src="./FilteredActionListBodyLoader.module.css" />
