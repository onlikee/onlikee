<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ProgressBar 进度条"
      description="展示任务进度，或通过多个彩色分段表达占比。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过 <code>progress</code> 设置 0–100 的进度，数字或字符串均可，不需要添加百分号。
      </template>
      <ComponentDocsDemoBlock :code="basicCode">
        <div class="progress-examples">
          <div
            v-for="value in [0, 50, 100]"
            :key="value"
            class="progress-example"
          >
            <span>{{ value }}%</span>
            <ProgressBar
              :progress="value"
              :aria-label="`任务完成 ${value}%`"
            />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="不同尺寸">
      <template #description>
        <code>barSize</code> 支持 small（5px）、default（8px）和 large（10px）。
      </template>
      <ComponentDocsDemoBlock :code="sizeCode">
        <div class="progress-examples">
          <div
            v-for="size in sizes"
            :key="size"
            class="progress-example"
          >
            <span>{{ size }}</span>
            <ProgressBar
              progress="66"
              :bar-size="size"
              :aria-label="`${size} 进度条`"
            />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="颜色">
      <template #description>
        <code>bg</code> 使用主题颜色名称，默认是 <code>success.emphasis</code>。
        省略第二部分时使用 emphasis，例如 <code>danger</code>。
      </template>
      <ComponentDocsDemoBlock :code="colorCode">
        <div class="progress-examples">
          <div
            v-for="color in colors"
            :key="color"
            class="progress-example"
          >
            <span>{{ color }}</span>
            <ProgressBar
              :progress="60"
              :bg="color"
              :aria-label="`${color} 进度条`"
            />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="多段进度">
      <template #description>
        使用 <code>ProgressBar.Item</code> 设置各段占比和颜色，并分别提供无障碍标签。
        默认插槽优先于父级 progress；单段和多段应择一使用。组件不会自动归一化各段数值。
      </template>
      <ComponentDocsDemoBlock :code="multipleCode">
        <div class="progress-examples">
          <ProgressBar>
            <ProgressBar.Item
              :progress="33"
              bg="accent.emphasis"
              aria-label="照片占比"
            />
            <ProgressBar.Item
              :progress="23"
              bg="danger.emphasis"
              aria-label="应用占比"
            />
            <ProgressBar.Item
              :progress="14"
              bg="severe.emphasis"
              aria-label="音乐占比"
            />
          </ProgressBar>
          <span>照片 33% · 应用 23% · 音乐 14%</span>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="行内布局">
      <template #description>
        设置 <code>inline</code> 后，请通过 style 或 class 指定宽度。
      </template>
      <ComponentDocsDemoBlock :code="inlineCode">
        <div class="progress-inline">
          <span>上传进度</span>
          <ProgressBar
            inline
            progress="66"
            style="width: 120px"
            aria-label="上传进度"
          />
          <span>66%</span>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="动画">
      <template #description>
        <code>animated</code> 为默认单段启用流光动画，系统偏好减少动态效果时停用。
        多段模式可在需要动画的 Item 上设置 <code>data-animated="true"</code>。
      </template>
      <ComponentDocsDemoBlock :code="animatedCode">
        <div class="progress-examples">
          <ProgressBar
            :progress="50"
            animated
            aria-label="正在上传"
          />
          <ProgressBar>
            <ProgressBar.Item
              :progress="35"
              bg="accent.emphasis"
              data-animated="true"
              aria-label="正在处理的文件"
            />
            <ProgressBar.Item
              :progress="25"
              aria-label="已处理的文件"
            />
          </ProgressBar>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <Table
        :columns="apiColumns"
        :data="apiRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
    <ComponentDocsSection
      title="ProgressBar.Item API"
      variant="api"
    >
      <template #description>
        也可以具名导入 <code>ProgressBarItem</code>。两种组件均支持原生属性、class 和 style。
        多段模式下，父级颜色、动画和下列 ARIA 属性不会自动传给子项。
      </template>
      <Table
        :columns="apiColumns"
        :data="itemApiRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { ProgressBar } from '@/components/primer-vue/ProgressBar'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const sizes = ['small', 'default', 'large'] as const
const colors = ['success.emphasis', 'accent.emphasis', 'danger', 'attention.emphasis']

const basicCode = `<template>
  <ProgressBar :progress="0" aria-label="任务完成 0%" />
  <ProgressBar :progress="50" aria-label="任务完成 50%" />
  <ProgressBar :progress="100" aria-label="任务完成 100%" />
</template>

<script setup lang="ts">
import { ProgressBar } from '@/components/primer-vue/ProgressBar'
<\/script>`

const sizeCode = `<ProgressBar progress="66" bar-size="small" aria-label="小号进度" />
<ProgressBar progress="66" bar-size="default" aria-label="默认进度" />
<ProgressBar progress="66" bar-size="large" aria-label="大号进度" />`

const colorCode = `<ProgressBar :progress="60" bg="success.emphasis" aria-label="任务进度" />
<ProgressBar :progress="60" bg="accent.emphasis" aria-label="任务进度" />
<ProgressBar :progress="60" bg="danger" aria-label="任务进度" />
<ProgressBar :progress="60" bg="attention.emphasis" aria-label="任务进度" />`

const multipleCode = `<ProgressBar>
  <ProgressBar.Item :progress="33" bg="accent.emphasis" aria-label="照片占比" />
  <ProgressBar.Item :progress="23" bg="danger.emphasis" aria-label="应用占比" />
  <ProgressBar.Item :progress="14" bg="severe.emphasis" aria-label="音乐占比" />
</ProgressBar>`

const inlineCode = `<ProgressBar inline progress="66" style="width: 120px" aria-label="上传进度" />`

const animatedCode = `<ProgressBar :progress="50" animated aria-label="正在上传" />

<ProgressBar>
  <ProgressBar.Item :progress="35" bg="accent.emphasis" data-animated="true" aria-label="正在处理的文件" />
  <ProgressBar.Item :progress="25" aria-label="已处理的文件" />
</ProgressBar>`

const apiColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'type', label: '类型', minWidth: '180px', wrap: true },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'description', label: '说明', minWidth: '220px', wrap: true }
]

const sharedApiRows = [
  { name: 'progress', type: 'string | number', default: '—', description: '百分比数值，不带 %；未设置时显示 0%，不自动限制范围。' },
  { name: 'bg', type: 'string', default: 'success.emphasis', description: '主题背景颜色，例如 accent.emphasis 或 danger。' },
  { name: 'aria-label', type: 'string', default: '—', description: '进度条的无障碍名称。' },
  { name: 'aria-valuenow', type: 'number | string', default: '由 progress 计算', description: '覆盖向辅助技术报告的当前数值，支持显式设置 0。' },
  { name: 'aria-valuetext', type: 'string', default: '—', description: '用文字描述当前进度，例如“已完成 3 项，共 5 项”。' }
]

const apiRows = [
  ...sharedApiRows,
  { name: 'barSize', type: "'small' | 'default' | 'large'", default: 'default', description: '高度分别为 5px、8px、10px。' },
  { name: 'inline', type: 'boolean', default: 'false', description: '使用行内布局，由调用方设置宽度。' },
  { name: 'animated', type: 'boolean', default: 'false', description: '为默认单段启用流光动画。' },
  { name: 'default 插槽', type: 'ProgressBar.Item', default: '单段进度', description: '有效内容优先；空插槽回退为单段，多段标签需分别设置。' }
]

const itemApiRows = [
  ...sharedApiRows,
  { name: 'data-animated', type: "'true'", default: '—', description: '为当前分段启用流光动画。' }
]
</script>

<style scoped>
.progress-examples {
  display: grid;
  gap: 20px;
  width: 100%;
  max-width: 560px;
  color: var(--fgColor-muted, #59636e);
  font-size: 14px;
}

.progress-example {
  display: grid;
  gap: 8px;
}

.progress-inline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--fgColor-muted, #59636e);
  font-size: 14px;
}
</style>
