<template>
  <ComponentDocsPage>
    <ComponentDocsHeader title="Octicons Vue3 图标">
      <template #description>
        该图标库基于开源的
        <Link
          href="https://primer.style/octicons/"
          link-text="Octicons"
          variant="primary"
        />
        图标库构建，为 Vue 项目提供可直接使用的图标组件。
      </template>
    </ComponentDocsHeader>

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过具名导入图标组件并在模板中直接使用，可用 <code>size</code> 控制图标大小。
      </template>

      <ComponentDocsDemoBlock :code="demo1Code">
        <div class="icon-demo-row">
          <component
            :is="icon.component"
            v-for="icon in basicIconEntries"
            :key="icon.name"
            :size="32"
            class="demo-icon"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="尺寸与颜色">
      <template #description>
        <code>size</code> 支持数字或字符串，<code>color</code> 可直接设置颜色值。
      </template>

      <ComponentDocsDemoBlock :code="demo2Code">
        <div class="icon-demo-row">
          <component
            :is="icon.component"
            v-for="icon in colorDemoEntries"
            :key="icon.name"
            :size="icon.size"
            :color="icon.color"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="图标展示">
      <template #description>
        当前共 {{ iconEntries.length }} 个图标，展示预览尺寸为 {{ iconSize }}px。点击可直接复制SVG代码。
      </template>

      <div class="icon-search">
        <input
          v-model="searchQuery"
          type="text"
          class="icon-search-input"
          placeholder="Search icons..."
          aria-label="搜索图标名称"
        >
      </div>

      <div class="icon-grid">
        <div
          v-for="icon in filteredIconEntries"
          :key="icon.name"
          class="icon-card"
          @click="copySVG(icon.name, $event)"
        >
          <component
            :is="icon.component"
            :size="iconSize"
            class="icon-svg"
          />
          <span class="icon-name">{{ icon.name }}</span>
        </div>
      </div>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <Table
        :columns="apiTableColumns"
        :data="apiTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import * as octicons from '@/components/octicons-vue3/index.ts'
import { Link } from '@/components/primer-vue/Link'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'
import { Banner } from '@/components/primer-vue/Banner'

type IconEntry = {
  name: string
  component: Component
}

type ColorDemoEntry = IconEntry & {
  size: number
  color: string
}

const iconSize = 24

const demo1Code = `<script setup lang="ts">
import { TelescopeFillIcon, MarkGithubIcon, HeartFillIcon } from '@/components/octicons-vue3/index.ts'
<\/script>

<template>
  <div class="icon-demo-row">
    <TelescopeFillIcon :size="32" />
    <MarkGithubIcon :size="32" />
    <HeartFillIcon :size="32" />
  </div>
</template>

<style scoped>
.icon-demo-row {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}
</style>`

const demo2Code = `<script setup lang="ts">
import { TelescopeFillIcon, MarkGithubIcon, HeartFillIcon } from '@/components/octicons-vue3/index.ts'
<\/script>

<template>
  <div class="icon-demo-row">
    <TelescopeFillIcon :size="16" color="#656d76" />
    <MarkGithubIcon :size="24" color="#0969da" />
    <HeartFillIcon :size="32" color="#d1242f" />
  </div>
</template>

<style scoped>
.icon-demo-row {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}
</style>`

const basicIconEntries: IconEntry[] = [
  { name: 'TelescopeFillIcon', component: octicons.TelescopeFillIcon as Component },
  { name: 'MarkGithubIcon', component: octicons.MarkGithubIcon as Component },
  { name: 'HeartFillIcon', component: octicons.HeartFillIcon as Component }
]

const colorDemoEntries: ColorDemoEntry[] = [
  {
    name: 'TelescopeFillIcon',
    component: octicons.TelescopeFillIcon as Component,
    size: 16,
    color: '#656d76'
  },
  {
    name: 'MarkGithubIcon',
    component: octicons.MarkGithubIcon as Component,
    size: 24,
    color: '#0969da'
  },
  {
    name: 'HeartFillIcon',
    component: octicons.HeartFillIcon as Component,
    size: 32,
    color: '#d1242f'
  }
]

const iconEntries: IconEntry[] = Object.entries(octicons)
  .filter(([name]) => name !== 'default')
  .map(([name, component]) => ({
    name,
    component: component as Component
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

const searchQuery = ref('')
const filteredIconEntries = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    return iconEntries
  }

  return iconEntries.filter((icon) => icon.name.toLowerCase().includes(query))
})

const copySVG = (iconName: string, event: MouseEvent) => {
  const iconCard = event.currentTarget as HTMLDivElement
  const svgElement = iconCard.querySelector('svg') as SVGElement

  // 从已渲染 DOM 中提取当前图标的 SVG 字符串。
  const svgMarkup = svgElement.outerHTML
  // 将 SVG 文本写入剪贴板，便于直接粘贴到设计稿或代码中。
  navigator.clipboard.writeText(svgMarkup)
  Banner.success(`${iconName} SVG 已复制到剪贴板！`, { duration: 3000 })
}

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'type', label: '类型', minWidth: '160px', wrap: true },
  { key: 'options', label: '可选值', minWidth: '140px', wrap: true },
  { key: 'description', label: '说明', minWidth: '200px', wrap: true }
]

const apiTableRows = [
  {
    name: 'size',
    description: '图标尺寸',
    type: 'number | string',
    options: '—',
    default: '16'
  },
  {
    name: 'color',
    description: '图标颜色',
    type: 'string',
    options: '—',
    default: 'currentColor'
  }
]
</script>

<style scoped>
.icon-search {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.icon-search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  height: 40px;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--fgColor-default);
  background: var(--bgColor-default);
  box-shadow: var(--shadow-inset);
}

.icon-search-input::placeholder {
  color: var(--fgColor-muted);
}

.icon-search-input:focus {
  outline: 2px solid var(--focus-outlineColor);
  outline-offset: -1px;
}

.icon-demo-row {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.demo-icon {
  color: var(--fgColor-default);
}

.icon-muted {
  color: var(--fgColor-muted);
}

.icon-primary {
  color: var(--fgColor-accent);
}

.icon-danger {
  color: var(--fgColor-danger);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 0.75rem;
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
  background: var(--bgColor-default);
}

.icon-card:hover {
  cursor: pointer;
}

.icon-svg {
  color: var(--fgColor-default);
}

.icon-name {
  font-size: 0.75rem;
  color: var(--fgColor-muted);
  text-align: center;
  word-break: break-word;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .icon-search {
    margin-bottom: 0.75rem;
  }

  .icon-demo-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 0.75rem;
  }

  .icon-card {
    padding: 0.75rem 0.5rem;
  }
}
</style>
