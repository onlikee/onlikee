<script setup lang="ts">
import { Stack, StackItem } from '@/components/primer-vue/Stack'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'

const codes = [
  "<template>\n<Stack>\n  <div class=\"demo-item\">第一项</div>\n  <div class=\"demo-item\">第二项</div>\n  <div class=\"demo-item\">第三项</div>\n</Stack>\n</template>",
  "<template>\n<Stack direction=\"horizontal\" align=\"center\" justify=\"space-between\">\n  <div class=\"demo-item\">左侧</div>\n  <div class=\"demo-item\" style=\"padding-block: 24px\">较高内容</div>\n  <div class=\"demo-item\">右侧</div>\n</Stack>\n</template>",
  "<template>\n<Stack direction=\"horizontal\" gap=\"cozy\" padding=\"spacious\" padding-block=\"tight\" class=\"demo-outline\">\n  <div class=\"demo-item\">水平内边距 24px</div>\n  <div class=\"demo-item\">垂直内边距 4px</div>\n</Stack>\n</template>",
  "<template>\n<Stack direction=\"horizontal\" wrap=\"wrap\" gap=\"condensed\" style=\"max-width: 320px\">\n  <div v-for=\"n in 6\" :key=\"n\" class=\"demo-item\" style=\"min-width: 100px\">项目 {{ n }}</div>\n</Stack>\n</template>",
  "<template>\n<Stack\n  :direction=\"{ narrow: 'vertical', regular: 'horizontal' }\"\n  :gap=\"{ narrow: 'condensed', regular: 'normal', wide: 'spacious' }\"\n  :padding=\"{ narrow: 'tight', regular: 'normal' }\"\n  padding-inline=\"cozy\"\n  class=\"demo-outline\"\n>\n  <div class=\"demo-item\">响应式方向</div>\n  <div class=\"demo-item\">响应式间距</div>\n  <div class=\"demo-item\">水平内边距固定 12px</div>\n</Stack>\n</template>",
  "<template>\n<Stack direction=\"horizontal\" align=\"center\">\n  <StackItem :shrink=\"false\" class=\"demo-item\">固定内容</StackItem>\n  <StackItem :grow=\"{ narrow: false, regular: true }\" class=\"demo-item\">768px 起填充剩余空间</StackItem>\n  <StackItem :shrink=\"false\" class=\"demo-item\">操作</StackItem>\n</Stack>\n</template>",
  "<template>\n<Stack as=\"ul\" class=\"demo-list\" gap=\"condensed\">\n  <StackItem as=\"li\" class=\"demo-item\">列表项一</StackItem>\n  <StackItem as=\"li\">\n    <Stack direction=\"horizontal\" gap=\"tight\">\n      <span class=\"demo-item\">嵌套项 A</span>\n      <span class=\"demo-item\">嵌套项 B</span>\n    </Stack>\n  </StackItem>\n</Stack>\n</template>"
]
const importCode = "import { Stack, StackItem } from '@/components/primer-vue/Stack'"
const columns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true },
  { key: 'type', label: '类型', wrap: true },
  { key: 'default', label: '默认值' },
  { key: 'description', label: '说明', wrap: true }
]
const rows = [
  {
    "name": "as",
    "type": "string | Component",
    "default": "div",
    "description": "根元素或 Vue 组件。"
  },
  {
    "name": "direction",
    "type": "'horizontal' | 'vertical'",
    "default": "vertical",
    "description": "排列方向。"
  },
  {
    "name": "gap",
    "type": "StackSpacing",
    "default": "normal",
    "description": "子项间距。"
  },
  {
    "name": "align",
    "type": "'stretch' | 'start' | 'center' | 'end' | 'baseline'",
    "default": "stretch",
    "description": "交叉轴对齐。"
  },
  {
    "name": "justify",
    "type": "'start' | 'center' | 'end' | 'space-between' | 'space-evenly'",
    "default": "start",
    "description": "主轴分布。"
  },
  {
    "name": "wrap",
    "type": "'wrap' | 'nowrap'",
    "default": "nowrap",
    "description": "是否允许换行。"
  },
  {
    "name": "padding",
    "type": "StackSpacing",
    "default": "none",
    "description": "容器内边距。"
  },
  {
    "name": "paddingBlock",
    "type": "StackSpacing",
    "default": "—",
    "description": "覆盖块轴内边距。"
  },
  {
    "name": "paddingInline",
    "type": "StackSpacing",
    "default": "—",
    "description": "覆盖行内轴内边距。"
  }
]
const itemRows = [
  { name: 'as', type: 'string | Component', default: 'div', description: '根元素或 Vue 组件。' },
  { name: 'grow', type: 'boolean | ResponsiveValue<boolean>', default: 'false', description: '是否填充剩余空间。' },
  { name: 'shrink', type: 'boolean | ResponsiveValue<boolean>', default: 'true', description: '空间不足时是否允许收缩。' }
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Stack 堆叠布局"
      description="基于 Flexbox 的一维布局容器，支持响应式排列和弹性子项。"
    />
    <ComponentDocsSection title="引入">
      <ComponentDocsDemoBlock :code="importCode">
        <code>Stack / StackItem</code>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="基础用法">
      <template #description>
        默认纵向排列，间距为 normal（16px）。普通元素可以直接作为子项，无需包裹 StackItem。
      </template>
      <ComponentDocsDemoBlock :code="codes[0]">
        <Stack>
          <div class="demo-item">
            第一项
          </div>
          <div class="demo-item">
            第二项
          </div>
          <div class="demo-item">
            第三项
          </div>
        </Stack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="水平排列与对齐">
      <template #description>
        direction 控制主轴，align 控制交叉轴，justify 控制主轴上的分布。
      </template>
      <ComponentDocsDemoBlock :code="codes[1]">
        <Stack
          direction="horizontal"
          align="center"
          justify="space-between"
        >
          <div class="demo-item">
            左侧
          </div>
          <div
            class="demo-item"
            style="padding-block: 24px"
          >
            较高内容
          </div>
          <div class="demo-item">
            右侧
          </div>
        </Stack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="间距与内边距">
      <template #description>
        六档间距分别为 none 0、tight 4、condensed 8、cozy 12、normal 16、spacious 24px，可由主题 token 覆盖。paddingBlock 和 paddingInline 优先覆盖对应轴。
      </template>
      <ComponentDocsDemoBlock :code="codes[2]">
        <Stack
          direction="horizontal"
          gap="cozy"
          padding="spacious"
          padding-block="tight"
          class="demo-outline"
        >
          <div class="demo-item">
            水平内边距 24px
          </div>
          <div class="demo-item">
            垂直内边距 4px
          </div>
        </Stack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="自动换行">
      <template #description>
        横向内容超出容器宽度时，通过 wrap="wrap" 自动换行。
      </template>
      <ComponentDocsDemoBlock :code="codes[3]">
        <Stack
          direction="horizontal"
          wrap="wrap"
          gap="condensed"
          style="max-width: 320px"
        >
          <div
            v-for="n in 6"
            :key="n"
            class="demo-item"
            style="min-width: 100px"
          >
            项目 {{ n }}
          </div>
        </Stack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="响应式布局">
      <template #description>
        断点依据视口宽度：narrow 为基础值，regular 从 768px 起，wide 从 1400px 起。缺失断点沿用较小断点，未提供基础值时使用组件默认值。调整窗口宽度查看变化。
      </template>
      <ComponentDocsDemoBlock :code="codes[4]">
        <Stack
          :direction="{ narrow: 'vertical', regular: 'horizontal' }"
          :gap="{ narrow: 'condensed', regular: 'normal', wide: 'spacious' }"
          :padding="{ narrow: 'tight', regular: 'normal' }"
          padding-inline="cozy"
          class="demo-outline"
        >
          <div class="demo-item">
            响应式方向
          </div>
          <div class="demo-item">
            响应式间距
          </div>
          <div class="demo-item">
            水平内边距固定 12px
          </div>
        </Stack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="弹性子项">
      <template #description>
        StackItem 默认 grow=false、shrink=true，最小行内尺寸为 0。布尔值也支持响应式对象；传入 false 时使用 Vue 的 :grow 或 :shrink 绑定。
      </template>
      <ComponentDocsDemoBlock :code="codes[5]">
        <Stack
          direction="horizontal"
          align="center"
        >
          <StackItem
            :shrink="false"
            class="demo-item"
          >
            固定内容
          </StackItem>
          <StackItem
            :grow="{ narrow: false, regular: true }"
            class="demo-item"
          >
            768px 起填充剩余空间
          </StackItem>
          <StackItem
            :shrink="false"
            class="demo-item"
          >
            操作
          </StackItem>
        </Stack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="语义元素与嵌套">
      <template #description>
        通过 as 指定元素或 Vue 组件。列表使用 ul/li，默认插槽放置内容；class、style、ARIA 属性和事件透传到根节点。嵌套 Stack 各自控制布局。
      </template>
      <ComponentDocsDemoBlock :code="codes[6]">
        <Stack
          as="ul"
          class="demo-list"
          gap="condensed"
        >
          <StackItem
            as="li"
            class="demo-item"
          >
            列表项一
          </StackItem>
          <StackItem as="li">
            <Stack
              direction="horizontal"
              gap="tight"
            >
              <span class="demo-item">嵌套项 A</span>
              <span class="demo-item">嵌套项 B</span>
            </Stack>
          </StackItem>
        </Stack>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection
      title="Stack API"
      variant="api"
    >
      <template #description>
        除 as 外，所有属性均支持 T | ResponsiveValue&lt;T&gt;，响应式对象格式为 { narrow?: T, regular?: T, wide?: T }。
        StackSpacing = 'none' | 'tight' | 'condensed' | 'cozy' | 'normal' | 'spacious'。
      </template>
      <Table
        :columns="columns"
        :data="rows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
    <ComponentDocsSection
      title="StackItem API"
      variant="api"
    >
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
.demo-item {
  padding: 8px 12px;
  border: 1px solid var(--borderColor-default, #d1d9e0);
  border-radius: var(--borderRadius-medium, 6px);
  background: var(--bgColor-muted, #f6f8fa);
  color: var(--fgColor-default, #1f2328);
}
.demo-outline {
  border: 1px dashed var(--borderColor-default, #d1d9e0);
}
.demo-list {
  margin: 0;
  list-style: none;
}
</style>

