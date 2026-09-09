<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Divider 分割线"
      description="用于分隔内容的水平或纵向分割线。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        最简单的分割线。
      </template>

      <ComponentDocsDemoBlock :code="demo1Code">
        <div class="demo-container">
          <p>上方内容</p>
          <Divider />
          <p>下方内容</p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="多内容分隔">
      <template #description>
        分割线可以用于分隔多个段落或区块。
      </template>

      <ComponentDocsDemoBlock :code="demo2Code">
        <div class="demo-container">
          <p>第一段内容</p>
          <Divider />
          <p>第二段内容</p>
          <Divider />
          <p>第三段内容</p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="纵向分割线">
      <template #description>
        设置 <code>direction="vertical"</code> 渲染纵向分割线，可通过 <code>height</code> 自定义高度。
      </template>

      <ComponentDocsDemoBlock :code="demo3Code">
        <div class="demo-inline">
          <span>首页</span>
          <Divider direction="vertical" />
          <span>文档</span>
          <Divider direction="vertical" />
          <span>关于</span>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自定义尺寸">
      <template #description>
        水平模式下通过 <code>width</code> 自定义宽度，纵向模式下通过 <code>height</code> 自定义高度。
      </template>

      <ComponentDocsDemoBlock :code="demo4Code">
        <div class="demo-container">
          <p>短分割线（50%）</p>
          <Divider width="50%" />
          <p>下方内容</p>
        </div>
        <div
          class="demo-inline"
          style="margin-top: 16px;"
        >
          <span>左</span>
          <Divider
            direction="vertical"
            height="2rem"
          />
          <span>右</span>
        </div>
      </ComponentDocsDemoBlock>
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
import { Divider } from '@/components/primer-vue/Divider'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const demo1Code = `<template>
  <p>上方内容</p>
  <Divider />
  <p>下方内容</p>
</template>

<script setup lang="ts">
import { Divider } from '@/components/primer-vue/Divider'
<\/script>`

const demo2Code = `<template>
  <p>第一段内容</p>
  <Divider />
  <p>第二段内容</p>
  <Divider />
  <p>第三段内容</p>
</template>

<script setup lang="ts">
import { Divider } from '@/components/primer-vue/Divider'
<\/script>`

const demo3Code = `<template>
  <div style="display: flex; align-items: center; gap: 0;">
    <span>首页</span>
    <Divider direction="vertical" />
    <span>文档</span>
    <Divider direction="vertical" />
    <span>关于</span>
  </div>
</template>

<script setup lang="ts">
import { Divider } from '@/components/primer-vue/Divider'
<\/script>`

const demo4Code = `<template>
  <!-- 水平模式自定义宽度 -->
  <Divider width="50%" />

  <!-- 纵向模式自定义高度 -->
  <span>左</span>
  <Divider direction="vertical" height="2rem" />
  <span>右</span>
</template>

<script setup lang="ts">
import { Divider } from '@/components/primer-vue/Divider'
<\/script>`

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '160px', wrap: true },
  { key: 'description', label: '说明', minWidth: '200px', wrap: true }
]

const apiTableRows = [
  { name: 'direction', description: '分割线方向', type: "'horizontal' | 'vertical'", default: "'horizontal'" },
  { name: 'width', description: '水平模式下自定义宽度', type: 'string', default: '—' },
  { name: 'height', description: '纵向模式下自定义高度', type: 'string', default: "'1em'" }
]
</script>

<style scoped>
.demo-container {
  max-width: 400px;
}

.demo-container p {
  margin: 0;
  color: var(--fgColor-default);
  font-size: 14px;
}

.demo-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--fgColor-default);
}
</style>
