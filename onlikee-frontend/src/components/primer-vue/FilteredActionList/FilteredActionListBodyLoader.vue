<script setup lang="ts">
import { computed, toRaw } from 'vue'
import { Spinner } from '../Spinner'
import { FilteredActionListLoadingTypes, type FilteredActionListLoadingType } from './types'
const props = withDefaults(defineProps<{ loadingType?: FilteredActionListLoadingType; height?: number }>(), { loadingType: () => FilteredActionListLoadingTypes.bodySpinner, height: 0 })
const rows = computed(() => props.height < 24 ? 3 : Math.floor(props.height / 24))
// 源 FilteredActionListLoaders.tsx:21-24 用 switch(case ===) 对枚举单例做同一性分派；
// 按 .name 字符串比较会让消费者自造的 {name:'body-spinner'} 对象误命中（审计 G7）。
// Vue 侧 prop 值可能被 reactive proxy 包裹（React 无此概念），故先 toRaw 解包再比对
// 单例引用——既忠实于源的同一性语义，又不受代理影响。
const isBodySpinner = computed(() => toRaw(props.loadingType) === FilteredActionListLoadingTypes.bodySpinner)
const isBodySkeleton = computed(() => toRaw(props.loadingType) === FilteredActionListLoadingTypes.bodySkeleton)
</script>
<template>
  <div
    v-if="isBodySpinner"
    class="filtered-action-list__loader"
    data-component="FilteredActionList.Spinner"
  >
    <Spinner
      data-testid="filtered-action-list-spinner"
    />
  </div>
  <div
    v-else-if="isBodySkeleton"
    class="filtered-action-list__skeleton"
    data-component="FilteredActionList.Skeleton"
  >
    <div
      class="filtered-action-list__stack"
      data-component="Stack"
      data-direction="vertical"
      data-justify="center"
      data-gap="condensed"
      data-testid="filtered-action-list-skeleton"
    >
      <div
        v-for="row in rows"
        :key="row"
        class="filtered-action-list__stack filtered-action-list__skeleton-row"
        data-component="Stack"
        data-direction="horizontal"
        data-gap="condensed"
        data-align="center"
        data-justify="start"
      >
        <div
          class="filtered-action-list__skeleton-box"
          data-component="SkeletonBox"
          style="width: 16px; height: 16px"
        />
        <div
          class="filtered-action-list__skeleton-box filtered-action-list__skeleton-bar"
          data-component="SkeletonBox"
          style="height: 10px"
        />
      </div>
    </div>
  </div>
</template>
<style src="./FilteredActionListBodyLoader.css" />
