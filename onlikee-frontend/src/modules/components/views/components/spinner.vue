<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Spinner 加载指示器"
      description="用于表示内容或操作正在加载。"
    />

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
          <div
            v-for="size in sizes"
            :key="size"
            class="spinner-demo-item"
          >
            <Spinner
              :size="size"
              :sr-text="`${size} 加载中`"
            />
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
          <Spinner
            size="small"
            :sr-text="null"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="延迟显示">
      <template #description>
        <code>delay="short"</code> 延迟 300ms，<code>delay="long"</code> 或
        <code>delay</code> 延迟 1000ms；也可传入自定义毫秒数。点击按钮可重新观察延迟。
      </template>
      <ComponentDocsDemoBlock :code="delayCode">
        <div class="spinner-demo-stack">
          <button
            class="spinner-demo-button"
            @click="delayKey += 1"
          >
            重新开始
          </button>
          <div
            :key="delayKey"
            class="spinner-demo-row"
          >
            <div class="spinner-demo-item">
              <Spinner
                size="small"
                delay="short"
              />
              <span>300ms</span>
            </div>
            <div class="spinner-demo-item">
              <Spinner
                size="small"
                :delay="500"
              />
              <span>500ms</span>
            </div>
            <div class="spinner-demo-item">
              <Spinner
                size="small"
                delay="long"
              />
              <span>1000ms</span>
            </div>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <template #description>
        <code>class</code>、<code>style</code>、<code>aria-*</code> 和 <code>data-*</code> 属性会传给 SVG。
      </template>
      <Table
        :columns="apiColumns"
        :data="apiRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { Spinner } from '@/components/primer-vue/Spinner'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const sizes = ['small', 'medium', 'large'] as const
const delayKey = shallowRef(0)

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

const apiColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'type', label: '类型', minWidth: '220px', wrap: true },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'description', label: '说明', minWidth: '240px', wrap: true }
]

const apiRows = [
  { name: 'size', type: "'small' | 'medium' | 'large'", default: 'medium', description: 'SVG 的宽和高分别为 16px、32px、64px。' },
  { name: 'srText', type: 'string | null', default: 'Loading', description: '屏幕阅读器文本；已有相邻状态文字时可设为 null。' },
  { name: 'delay', type: "boolean | 'short' | 'long' | number", default: 'false', description: '延迟显示；true/long 为 1000ms，short 为 300ms，数字为自定义毫秒数。' },
  { name: 'aria-label', type: 'string', default: '—', description: '旧版无障碍名称属性；新用法优先使用 srText。' }
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
