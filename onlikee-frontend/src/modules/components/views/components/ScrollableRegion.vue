<script setup lang="ts">
import { shallowRef, useId } from 'vue'
import { ScrollableRegion } from '@/components/primer-vue/ScrollableRegion'
import { Button } from '@/components/primer-vue/Button'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useId()
const wide = shallowRef(false)
const horizontalCode = `<ScrollableRegion aria-label="横向滚动示例" style="max-width: 100%; width: 240px">
  <p style="width: 360px">内容超过容器宽度时，可聚焦区域并使用方向键滚动。</p>
</ScrollableRegion>`
const verticalCode = `<h3 id="activity-title">最近活动</h3>
<ScrollableRegion aria-labelledby="activity-title" style="height: 96px">
  <p v-for="index in 6" :key="index">活动记录 {{ index }}</p>
</ScrollableRegion>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'description', header: '说明' },
]
const rows = [
  {
    id: 'aria-label',
    name: 'aria-label',
    type: 'string',
    description: '与 aria-labelledby 二选一；仅在溢出时应用。',
  },
  {
    id: 'aria-labelledby',
    name: 'aria-labelledby',
    type: 'string',
    description: '关联可见标题的 ID，仅在溢出时应用。',
  },
  {
    id: 'className',
    name: 'className / class',
    type: 'string / ClassValue',
    description: '附加根 div 的样式类。',
  },
  {
    id: 'style',
    name: 'style',
    type: 'StyleValue',
    description: '根 div 的样式，可限制宽高；对象中的非零长度数字按 px 处理。',
  },
  {
    id: 'role',
    name: 'role / tabindex',
    type: '原生属性',
    description: '溢出时强制使用 region 和 0；溢出消失后恢复调用方设置的值。也支持 tabIndex。',
  },
  {
    id: 'default',
    name: '默认插槽',
    type: 'slot',
    description: '滚动区域内容，对应 React children。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ScrollableRegion 滚动区域"
      description="在内容溢出时添加区域名称和键盘焦点，让用户能够滚动浏览内容。"
    />
    <ComponentDocsSection title="横向滚动与尺寸变化">
      <template #description>
        容器默认使用 overflow: auto 和 position: relative。内容溢出时添加 role="region"、
        tabindex="0" 和无障碍名称；不溢出时移除这些自动属性。聚焦溢出区域后可使用方向键滚动。
      </template>
      <ComponentDocsDemoBlock :code="horizontalCode">
        <div class="examples">
          <Button @click="wide = !wide">{{ wide ? '缩窄容器' : '加宽容器' }}</Button>
          <ScrollableRegion
            aria-label="横向滚动示例"
            class="scroll-example"
            :style="{ width: wide ? 480 : 240 }"
          >
            <p class="wide-content">内容超过容器宽度时，可聚焦区域并使用方向键滚动。</p>
          </ScrollableRegion>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="纵向滚动与外部标题">
      <template #description>使用 aria-labelledby 将区域与可见标题关联。</template>
      <ComponentDocsDemoBlock :code="verticalCode">
        <div class="examples">
          <h3 :id="`${documentationId}-activity-title`">最近活动</h3>
          <ScrollableRegion
            :aria-labelledby="`${documentationId}-activity-title`"
            class="scroll-example vertical-example"
          >
            <p v-for="index in 6" :key="index">活动记录 {{ index }}</p>
          </ScrollableRegion>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <template #description>
        必须提供 aria-label 或 aria-labelledby 中的一项。其余原生属性和事件透传到根 div。
        状态在容器的 ResizeObserver
        通知到达后更新；固定尺寸容器仅改变内部内容时，不保证触发重新检测。 组件 ref 的 element
        可访问根元素，实例类型为 ScrollableRegionInstance。
      </template>
      <VisuallyHidden :id="`${documentationId}-api-table`">ScrollableRegion API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.examples {
  display: grid;
  gap: 16px;
  width: 100%;
  justify-items: start;
}
.scroll-example {
  max-width: 100%;
  padding: 12px;
  border: 1px solid var(--borderColor-default);
  border-radius: var(--borderRadius-medium);
}
.wide-content {
  width: 360px;
  margin: 0;
}
.vertical-example {
  width: 100%;
  height: 96px;
}
</style>
