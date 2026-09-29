<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { Breadcrumbs, BreadcrumbsItem } from '@/components/primer-vue/Breadcrumbs'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const modes = [
  { value: 'wrap', title: '自动换行', description: '默认 wrap 模式保留所有路径项，空间不足时换行。' },
  { value: 'menu', title: '折叠菜单', description: 'menu 模式将前导路径收进菜单；容器小于 544px 且超过两项时，只保留末项。' },
  { value: 'menu-with-root', title: '保留根节点', description: 'menu-with-root 模式优先保留根节点；空间不足时根节点也会收进菜单，末项始终保留。' }
] as const
const widths = reactive({ wrap: 320, menu: 320, 'menu-with-root': 320 })
const items = ['primer', 'react', 'packages', 'react', 'src', 'Breadcrumbs']
const basicCode = `<script setup lang="ts">
import { Breadcrumbs, BreadcrumbsItem } from '@/components/primer-vue/Breadcrumbs'
<\/script>

<template>
  <Breadcrumbs>
    <BreadcrumbsItem href="#" @click.prevent>Home</BreadcrumbsItem>
    <BreadcrumbsItem href="#" @click.prevent>Components</BreadcrumbsItem>
    <BreadcrumbsItem as="span" selected>Breadcrumbs</BreadcrumbsItem>
  </Breadcrumbs>
</template>`
const spaciousCode = `<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Breadcrumbs, BreadcrumbsItem } from '@/components/primer-vue/Breadcrumbs'
<\/script>

<template>
  <Breadcrumbs variant="spacious">
    <BreadcrumbsItem :as="RouterLink" to="/component/guide">Guide</BreadcrumbsItem>
    <BreadcrumbsItem as="span" selected>Breadcrumbs</BreadcrumbsItem>
  </Breadcrumbs>
</template>`
function overflowCode(mode: typeof modes[number]['value']) {
  return `<script setup lang="ts">
import { Breadcrumbs, BreadcrumbsItem } from '@/components/primer-vue/Breadcrumbs'
<\/script>

<template>
  <div style="width: 320px; max-width: 100%">
    <Breadcrumbs overflow="${mode}">
      <BreadcrumbsItem href="#" @click.prevent>primer</BreadcrumbsItem>
      <BreadcrumbsItem href="#" @click.prevent>react</BreadcrumbsItem>
      <BreadcrumbsItem href="#" @click.prevent>packages</BreadcrumbsItem>
      <BreadcrumbsItem href="#" @click.prevent>react</BreadcrumbsItem>
      <BreadcrumbsItem href="#" @click.prevent>src</BreadcrumbsItem>
      <BreadcrumbsItem as="span" selected>Breadcrumbs</BreadcrumbsItem>
    </Breadcrumbs>
  </div>
</template>`
}
const columns: TableColumn[] = [
  { key: 'name', label: '属性', rowHeader: true },
  { key: 'type', label: '类型', wrap: true },
  { key: 'default', label: '默认值' },
  { key: 'description', label: '说明', wrap: true }
]
const breadcrumbRows = [
  { name: 'overflow', type: 'wrap | menu | menu-with-root', default: 'wrap', description: '换行、折叠前导路径、优先保留根节点；末项始终保留。' },
  { name: 'variant', type: 'normal | spacious', default: 'normal', description: '标准链接或增加留白的外观。' },
  { name: 'aria-label', type: 'string', default: 'Breadcrumbs', description: '导航区域的无障碍名称，可按页面语言覆盖。' }
]
const itemRows = [
  { name: 'as', type: 'string | Component', default: 'a', description: '自定义元素或 RouterLink 组件；不可点击的当前页建议使用 span。' },
  { name: 'href', type: 'string', default: '—', description: '透传给原生 a 元素的链接地址。' },
  { name: 'to', type: 'RouteLocationRaw', default: '—', description: '配合 :as="RouterLink" 使用，不会自动将普通链接转换为路由链接。' },
  { name: 'selected', type: 'boolean', default: 'false', description: '标记当前页并设置 aria-current="page"，不会自动禁用链接。' }
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Breadcrumbs 面包屑"
      description="展示当前页面的层级路径，支持换行、溢出菜单和宽松外观。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description>
        路径按层级从左到右排列，用 selected 标记当前页。示例链接阻止默认跳转，实际使用时替换为目标地址。
      </template>
      <ComponentDocsDemoBlock :code="basicCode">
        <Breadcrumbs>
          <BreadcrumbsItem
            href="#"
            @click.prevent
          >
            Home
          </BreadcrumbsItem>
          <BreadcrumbsItem
            href="#"
            @click.prevent
          >
            Components
          </BreadcrumbsItem>
          <BreadcrumbsItem
            as="span"
            selected
          >
            Breadcrumbs
          </BreadcrumbsItem>
        </Breadcrumbs>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="宽松外观与路由链接">
      <template #description>
        spacious 增加留白并强调当前页。通过 as 显式传入 RouterLink；点击 Guide 会进入指南页。
      </template>
      <ComponentDocsDemoBlock :code="spaciousCode">
        <Breadcrumbs variant="spacious">
          <BreadcrumbsItem
            :as="RouterLink"
            to="/component/guide"
          >
            Guide
          </BreadcrumbsItem>
          <BreadcrumbsItem
            as="span"
            selected
          >
            Breadcrumbs
          </BreadcrumbsItem>
        </Breadcrumbs>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection
      v-for="mode in modes"
      :key="mode.value"
      :title="mode.title"
    >
      <template #description>
        {{ mode.description }} 调整滑杆观察布局；实际宽度不超过示例区域。复制代码使用初始的 320px 宽度。
      </template>
      <ComponentDocsDemoBlock :code="overflowCode(mode.value)">
        <div class="overflow-demo">
          <label
            class="width-control"
            :for="`breadcrumbs-width-${mode.value}`"
          >
            <span>容器宽度</span>
            <input
              :id="`breadcrumbs-width-${mode.value}`"
              v-model.number="widths[mode.value]"
              type="range"
              min="180"
              max="800"
              step="10"
            >
            <output :for="`breadcrumbs-width-${mode.value}`">{{ widths[mode.value] }}px</output>
          </label>
          <div
            class="breadcrumb-preview"
            :style="{ width: `${widths[mode.value]}px` }"
          >
            <Breadcrumbs :overflow="mode.value">
              <BreadcrumbsItem
                v-for="(item, index) in items"
                :key="index"
                :as="index === items.length - 1 ? 'span' : 'a'"
                :href="index === items.length - 1 ? undefined : '#'"
                :selected="index === items.length - 1"
                @click.prevent
              >
                {{ item }}
              </BreadcrumbsItem>
            </Breadcrumbs>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection
      title="Breadcrumbs API"
      variant="api"
    >
      <template #description>
        从 @/components/primer-vue/Breadcrumbs 导入 Breadcrumbs 和 BreadcrumbsItem，也支持 Breadcrumbs.Item。默认插槽放置路径项；原生属性和事件透传到对应元素。
      </template>
      <Table
        :columns="columns"
        :data="breadcrumbRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
    <ComponentDocsSection
      title="BreadcrumbsItem API"
      variant="api"
    >
      <template #description>
        默认插槽放置路径文本或图标。href、target、class、style、ARIA 属性与点击事件透传到指定元素。菜单打开后可用 Tab 访问链接，Escape 关闭并返回按钮，点击外部也会关闭。
      </template>
      <Table
        :columns="columns"
        :data="itemRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.overflow-demo { width: 100%; min-width: 0; }
.width-control {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  color: var(--fgColor-muted);
  font-size: 14px;
}
.width-control input { flex: 1; min-width: 80px; accent-color: var(--fgColor-link); }
.width-control output { min-width: 48px; font-variant-numeric: tabular-nums; }
.breadcrumb-preview {
  max-width: 100%;
  box-sizing: border-box;
  padding: 12px 0;
  border-block: 1px dashed var(--borderColor-default);
}
</style>
