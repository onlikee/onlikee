<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Container 布局容器"
      description="用于包裹页面主体内容，提供居中与最大宽度约束。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用 <code>Container</code> 包裹内容，自动居中且限制最大宽度为 1150px。
      </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <div class="demo-wrapper">
          <Container>
            <div class="demo-block">
              这是容器内的内容，宽度被限制并居中显示。
            </div>
          </Container>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="嵌套内容">
      <template #description>
        容器内可以放置任意内容，常用于页面级布局。
      </template>
      <ComponentDocsDemoBlock :code="demo2Code">
        <div class="demo-wrapper">
          <Container>
            <div class="demo-title">
              页面标题
            </div>
            <p class="demo-text">
              这是一段页面描述文字，容器会自动处理内边距和居中对齐。
            </p>
            <div class="demo-cards">
              <div class="demo-card">
                卡片 A
              </div>
              <div class="demo-card">
                卡片 B
              </div>
              <div class="demo-card">
                卡片 C
              </div>
            </div>
          </Container>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="响应式">
      <template #description>
        在小屏设备（≤768px）下内边距自动缩小为 1rem，适配移动端。
      </template>
      <ComponentDocsDemoBlock :code="demo3Code">
        <div class="demo-wrapper">
          <Container>
            <div class="demo-block">
              缩小浏览器窗口至 768px 以下，观察内边距的变化。
            </div>
          </Container>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自定义最大宽度">
      <template #description>
        通过 <code>max-width</code> 调整容器最大宽度。
      </template>
      <ComponentDocsDemoBlock :code="demo4Code">
        <div class="demo-wrapper">
          <Container max-width="640px">
            <div class="demo-block">
              这个容器的最大宽度被限制为 640px。
            </div>
          </Container>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h3>属性</h3>
      <Table
        :columns="apiCols"
        :data="apiRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h3>插槽</h3>
      <Table
        :columns="slotCols"
        :data="slotRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { Container } from '@/components/primer-vue/Container'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const demo1Code = `<template>
  <Container>
    <div>这是容器内的内容，宽度被限制并居中显示。</div>
  </Container>
</template>

<script setup lang="ts">
import { Container } from '@/components/primer-vue/Container'
<\/script>`

const demo2Code = `<template>
  <Container>
    <div class="demo-title">页面标题</div>
    <p class="demo-text">这是一段页面描述文字，容器会自动处理内边距和居中对齐。</p>
    <div class="demo-cards">
      <div class="demo-card">卡片 A</div>
      <div class="demo-card">卡片 B</div>
      <div class="demo-card">卡片 C</div>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { Container } from '@/components/primer-vue/Container'
<\/script>`

const demo3Code = `<!-- 在小屏设备（≤768px）下内边距自动缩小为 1rem -->
<template>
  <Container>
    <div>缩小浏览器窗口至 768px 以下，观察内边距的变化。</div>
  </Container>
</template>

<script setup lang="ts">
import { Container } from '@/components/primer-vue/Container'
<\/script>`

const demo4Code = `<template>
  <Container max-width="640px">
    <div>这个容器的最大宽度被限制为 640px。</div>
  </Container>
</template>

<script setup lang="ts">
import { Container } from '@/components/primer-vue/Container'
<\/script>`

const apiCols: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'type', label: '类型', minWidth: '200px', wrap: true },
  { key: 'description', label: '说明', minWidth: '200px', wrap: true }
]

const apiRows = [
  { name: 'maxWidth', description: '容器最大宽度，模板中可写为 max-width', type: 'string', default: "'1150px'" }
]

const slotCols: TableColumn[] = [
  { key: 'name', label: '插槽名', rowHeader: true, minWidth: '140px' },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true }
]

const slotRows = [
  { name: 'default', description: '容器的主体内容' }
]
</script>

<style scoped>
.demo-wrapper {
  border: 1px dashed var(--borderColor-default);
  border-radius: 6px;
  overflow: hidden;
}

.demo-title {
  margin: 0 0 8px 0;
  font-size: 1.15rem;
  color: var(--fgColor-default);
}

.demo-text {
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  color: var(--fgColor-muted);
}

.demo-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.demo-card {
  padding: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: var(--fgColor-muted);
  background: var(--bgColor-muted);
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
}
</style>
