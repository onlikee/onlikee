<template>
  <ComponentDocsPage>
    <ComponentDocsHeader title="Spinner 加载指示器" description="用于表示内容或操作正在加载。" />

    <ComponentDocsSection title="基础用法">
      <template #description>
        默认尺寸为 32px，向辅助技术提供 <code>Loading</code> 文本。
      </template>
      <ComponentDocsDemoBlock :code="basicCode">
        <Spinner />
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="尺寸">
      <template #description>
        <code>size</code> 支持 small（16px）、medium（32px）和 large（64px）。
      </template>
      <ComponentDocsDemoBlock :code="sizeCode">
        <div class="spinner-demo-row">
          <div v-for="size in sizes" :key="size" class="spinner-demo-item">
            <Spinner :size="size" :sr-text="`${size} 加载中`" />
            <span>{{ size }}</span>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="无障碍文本">
      <template #description>
        使用 <code>srText</code> 自定义屏幕阅读器文本。如果旁边已有加载状态文字，设置
        <code>:sr-text="null"</code>，避免重复读出。
      </template>
      <ComponentDocsDemoBlock :code="srTextCode">
        <div class="spinner-demo-row">
          <Spinner sr-text="正在保存" />
          <span>正在同步</span>
          <Spinner size="small" :sr-text="null" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="延迟显示">
      <template #description>
        <code>delay="short"</code> 延迟 300ms，<code>delay="long"</code> 或 <code>delay</code> 延迟
        1000ms；也可传入自定义毫秒数。点击按钮可重新观察延迟。
      </template>
      <ComponentDocsDemoBlock :code="delayCode">
        <div class="spinner-demo-stack">
          <button class="spinner-demo-button" @click="delayKey += 1">重新开始</button>
          <div :key="delayKey" class="spinner-demo-row">
            <div class="spinner-demo-item">
              <Spinner size="small" delay="short" />
              <span>300ms</span>
            </div>
            <div class="spinner-demo-item">
              <Spinner size="small" :delay="500" />
              <span>500ms</span>
            </div>
            <div class="spinner-demo-item">
              <Spinner size="small" delay="long" />
              <span>1000ms</span>
            </div>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="加载生命周期">
      <template #description>
        使用 Button 触发加载，AriaStatus 播报状态。已有可见加载文字时，将 Spinner 的
        <code>srText</code> 设为 null，避免重复读出；完成后另行播报结果。
      </template>
      <ComponentDocsDemoBlock :code="lifecycleCode">
        <div class="spinner-demo-stack">
          <Button @click="loadContent">加载内容</Button>
          <div class="spinner-demo-row">
            <Spinner v-if="loading" size="small" :sr-text="null" />
            <AriaStatus>{{ loading ? '正在加载内容…' : '' }}</AriaStatus>
          </div>
          <p>{{ loadedContent }}</p>
          <VisuallyHidden>
            <AriaStatus>{{ loadedContent ? '内容加载完成' : '' }}</AriaStatus>
          </VisuallyHidden>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <template #description>
        <code>class</code>、<code>style</code>、<code>aria-*</code> 和
        <code>data-*</code> 属性会传给 SVG。
      </template>
      <VisuallyHidden :id="`${documentationId}-api-table-0`">Spinner 加载指示器 API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-api-table-0`"
        :columns="apiColumns"
        :data="apiRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { useId as useDocumentationId } from 'vue'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'

import { onUnmounted, shallowRef } from 'vue'
import { Spinner } from '@/components/primer-vue/Spinner'
import { Button } from '@/components/primer-vue/Button'
import AriaStatus from '@/components/primer-vue/internal/components/AriaStatus.vue'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()

const sizes = ['small', 'medium', 'large'] as const
const delayKey = shallowRef(0)
const loading = shallowRef(false)
const loadedContent = shallowRef('')
let loadTimeout: ReturnType<typeof setTimeout> | undefined

function loadContent() {
  if (loading.value || loadedContent.value) return
  loading.value = true
  loadTimeout = setTimeout(() => {
    loadedContent.value = '需要等待加载的内容。'
    loading.value = false
  }, 1000)
}
onUnmounted(() => clearTimeout(loadTimeout))

const basicCode = `<script setup lang="ts">
import { Spinner } from '@/components/primer-vue/Spinner'
<\/script>

<template>
  <Spinner />
</template>`

const sizeCode = `<Spinner size="small" />
<Spinner size="medium" />
<Spinner size="large" />`

const srTextCode = `<Spinner sr-text="正在保存" />

<span>正在同步</span>
<Spinner size="small" :sr-text="null" />`

const delayCode = `<Spinner delay="short" />
<Spinner :delay="500" />
<Spinner delay="long" />`

const lifecycleCode = `<Button @click="loadContent">加载内容</Button>
<Spinner v-if="loading" size="small" :sr-text="null" />
<AriaStatus>{{ loading ? '正在加载内容…' : '' }}</AriaStatus>
<p>{{ loadedContent }}</p>
<VisuallyHidden>
  <AriaStatus>{{ loadedContent ? '内容加载完成' : '' }}</AriaStatus>
</VisuallyHidden>`

const apiColumns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '140px' },
  { field: 'type', header: '类型', minWidth: '220px' },
  { field: 'default', header: '默认值', minWidth: '120px' },
  { field: 'description', header: '说明', minWidth: '240px' },
]

const apiRows = [
  {
    id: 'size',
    name: 'size',
    type: "'small' | 'medium' | 'large'",
    default: 'medium',
    description: 'SVG 的宽和高分别为 16px、32px、64px。',
  },
  {
    id: 'srText',
    name: 'srText',
    type: 'string | null',
    default: 'Loading',
    description: '屏幕阅读器文本；已有相邻状态文字时可设为 null。',
  },
  {
    id: 'delay',
    name: 'delay',
    type: "boolean | 'short' | 'long' | number",
    default: 'false',
    description: '延迟显示；true/long 为 1000ms，short 为 300ms，数字为自定义毫秒数。',
  },
  {
    id: 'className',
    name: 'className / class',
    type: 'string',
    default: '—',
    description: '附加到 SVG 的样式类；外层 span 保留 inline-flex 布局。',
  },
  {
    id: 'style',
    name: 'style',
    type: 'CSSProperties',
    default: '—',
    description: 'SVG 样式。无减少动态效果偏好时，animationDelay 由共享时钟计算以同步旋转。',
  },
  {
    id: 'aria-label',
    name: 'aria-label',
    type: 'string',
    default: '—',
    description: '旧版无障碍名称属性；新用法优先使用 srText。',
  },
]
</script>

<style scoped>
.spinner-demo-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  color: var(--fgColor-muted, #59636e);
  font-size: 14px;
}

.spinner-demo-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner-demo-stack {
  display: grid;
  gap: 16px;
}

.spinner-demo-button {
  width: fit-content;
  padding: 6px 12px;
  border: 1px solid var(--borderColor-default, #d1d9e0);
  border-radius: 6px;
  background: var(--bgColor-default, #fff);
  color: var(--fgColor-default, #1f2328);
  cursor: pointer;
}
</style>
