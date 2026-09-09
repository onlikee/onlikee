<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Button 按钮"
      description="用于触发操作、提交表单，以及在文本前后承载轻量视觉元素。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用默认插槽承载按钮文案。<code>Button</code> 默认渲染为
        <code>type=&quot;button&quot;</code> 的原生按钮。
      </template>

      <ComponentDocsDemoBlock :code="basicDemoCode">
        <div class="button-row">
          <Button>保存更改</Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="不同变体">
      <template #description>
        通过 <code>variant</code> 调整按钮的视觉强调层级，覆盖默认、主操作、危险操作、透明和链接样式。
      </template>

      <ComponentDocsDemoBlock :code="variantDemoCode">
        <div class="button-row">
          <Button variant="default">
            Default
          </Button>
          <Button variant="primary">
            Primary
          </Button>
          <Button variant="danger">
            Danger
          </Button>
          <Button variant="invisible">
            Invisible
          </Button>
          <Button variant="link">
            Link
          </Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="不同尺寸">
      <template #description>
        使用 <code>size</code> 控制按钮高度与内边距，适配紧凑、默认和更高强调度的操作场景。
      </template>

      <ComponentDocsDemoBlock :code="sizeDemoCode">
        <div class="button-row button-row--align-end">
          <Button size="small">
            Small
          </Button>
          <Button size="medium">
            Medium
          </Button>
          <Button size="large">
            Large
          </Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="状态">
      <template #description>
        设置 <code>loading</code> 时会禁用交互、隐藏原内容并显示居中的 spinner；设置 <code>disabled</code> 时保留禁用态样式。
      </template>

      <ComponentDocsDemoBlock :code="stateDemoCode">
        <div class="button-row">
          <Button loading>
            Saving
          </Button>
          <Button
            variant="primary"
            loading
          >
            Publishing
          </Button>
          <Button disabled>
            Disabled
          </Button>
          <Button
            variant="danger"
            disabled
          >
            Disabled Danger
          </Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="前后视觉元素">
      <template #description>
        通过 <code>Button.leadingVisual</code> 和 <code>Button.trailingVisual</code> 子组件在文本前后放置图标。按钮会从默认插槽中提取这两个子组件，其余节点作为按钮文案渲染。
      </template>

      <ComponentDocsDemoBlock :code="visualDemoCode">
        <div class="button-row">
          <Button>
            <Button.leadingVisual>
              <BellIcon />
            </Button.leadingVisual>
            通知设置
          </Button>
          <Button variant="primary">
            继续前往
            <Button.trailingVisual>
              <ArrowUpRightIcon />
            </Button.trailingVisual>
          </Button>
          <Button variant="invisible">
            <Button.leadingVisual>
              <SearchIcon />
            </Button.leadingVisual>
            搜索项目
            <Button.trailingVisual>
              <CheckIcon />
            </Button.trailingVisual>
          </Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="原生按钮类型">
      <template #description>
        通过 <code>type</code> 透传原生按钮类型，在表单中分别用于普通操作、提交和重置。
      </template>

      <ComponentDocsDemoBlock :code="typeDemoCode">
        <div class="button-type-demo">
          <div class="button-row">
            <Button type="button">
              普通操作
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              提交表单
            </Button>
            <Button
              type="reset"
              variant="invisible"
            >
              重置输入
            </Button>
          </div>
          <p class="button-note">
            默认值为 <code>button</code>，在表单上下文中可直接切换为 <code>submit</code> 或 <code>reset</code>。
          </p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection
      title="API"
      variant="api"
    >
      <h3>属性</h3>
      <Table
        :columns="apiTableColumns"
        :data="apiTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>内容与子组件</h3>
      <Table
        :columns="contentTableColumns"
        :data="contentTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
import { BellIcon, ArrowUpRightIcon, SearchIcon, CheckIcon } from '@/components/octicons-vue3'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const basicDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
<\/script>

<template>
  <Button>保存更改</Button>
</template>`

const variantDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
<\/script>

<template>
  <div class="button-row">
    <Button variant="default">Default</Button>
    <Button variant="primary">Primary</Button>
    <Button variant="danger">Danger</Button>
    <Button variant="invisible">Invisible</Button>
    <Button variant="link">Link</Button>
  </div>
</template>

<style scoped>
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
</style>`

const sizeDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
<\/script>

<template>
  <div class="button-row button-row--align-end">
    <Button size="small">Small</Button>
    <Button size="medium">Medium</Button>
    <Button size="large">Large</Button>
  </div>
</template>

<style scoped>
.button-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}
</style>`

const stateDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
<\/script>

<template>
  <div class="button-row">
    <Button loading>Saving</Button>
    <Button variant="primary" loading>Publishing</Button>
    <Button disabled>Disabled</Button>
    <Button variant="danger" disabled>Disabled Danger</Button>
  </div>
</template>

<style scoped>
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
</style>`

const visualDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
import { BellIcon, ArrowUpRightIcon, SearchIcon, CheckIcon } from '@/components/octicons-vue3'
<\/script>

<template>
  <div class="button-row">
    <Button>
      <Button.leadingVisual>
        <BellIcon />
      </Button.leadingVisual>
      通知设置
    </Button>

    <Button variant="primary">
      继续前往
      <Button.trailingVisual>
        <ArrowUpRightIcon />
      </Button.trailingVisual>
    </Button>

    <Button variant="invisible">
      <Button.leadingVisual>
        <SearchIcon />
      </Button.leadingVisual>
      搜索项目
      <Button.trailingVisual>
        <CheckIcon />
      </Button.trailingVisual>
    </Button>
  </div>
</template>

<style scoped>
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
</style>`

const typeDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
<\/script>

<template>
  <div class="button-type-demo">
    <div class="button-row">
      <Button type="button">普通操作</Button>
      <Button type="submit" variant="primary">提交表单</Button>
      <Button type="reset" variant="invisible">重置输入</Button>
    </div>
    <p class="button-note">
      默认值为 button，在表单上下文中可直接切换为 submit 或 reset。
    </p>
  </div>
</template>

<style scoped>
.button-type-demo {
  display: grid;
  gap: 0.75rem;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.button-note {
  margin: 0;
  color: var(--fgColor-muted);
  font-size: 0.875rem;
}
</style>`

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '200px', wrap: true },
  { key: 'options', label: '可选值', minWidth: '240px', wrap: true },
  { key: 'description', label: '说明', minWidth: '220px', wrap: true }
]

const apiTableRows = [
  {
    name: 'type',
    description: '透传原生 button 的 type。',
    type: "'button' | 'submit' | 'reset'",
    options: 'button / submit / reset',
    default: "'button'"
  },
  {
    name: 'variant',
    description: '控制按钮的视觉变体。',
    type: "'default' | 'primary' | 'invisible' | 'danger' | 'link'",
    options: 'default / primary / invisible / danger / link',
    default: "'default'"
  },
  {
    name: 'size',
    description: '控制按钮高度与内边距。',
    type: "'small' | 'medium' | 'large'",
    options: 'small / medium / large',
    default: "'medium'"
  },
  {
    name: 'loading',
    description: '进入加载状态后禁用交互，隐藏内容并显示居中的 spinner。',
    type: 'boolean',
    options: 'true / false',
    default: 'false'
  },
  {
    name: 'disabled',
    description: '禁用按钮交互并展示禁用态样式。',
    type: 'boolean',
    options: 'true / false',
    default: 'false'
  }
]

const contentTableColumns: TableColumn[] = [
  { key: 'name', label: '名称', rowHeader: true, minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '320px', wrap: true }
]

const contentTableRows = [
  {
    name: 'default',
    description: '按钮的主文案内容。除 Button.leadingVisual 和 Button.trailingVisual 外，其余默认插槽节点都会作为 label 渲染。'
  },
  {
    name: 'Button.leadingVisual',
    description: '前置视觉元素子组件，通常用于放置图标或状态标记；会被提取到按钮文案前方的视觉区域。'
  },
  {
    name: 'Button.trailingVisual',
    description: '后置视觉元素子组件，通常用于放置方向、完成态等辅助图标；会被提取到按钮文案后方的视觉区域。'
  }
]
</script>

<style scoped>
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.button-row--align-end {
  align-items: flex-end;
}

.button-type-demo {
  display: grid;
  gap: 0.75rem;
}

.button-note {
  margin: 0;
  color: var(--fgColor-muted);
  font-size: 0.875rem;
  line-height: 1.6;
}

.button-note code {
  padding: 0.125rem 0.375rem;
  background: var(--bgColor-muted);
  border: 1px solid var(--borderColor-default);
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875em;
  color: var(--fgColor-default);
}

@media (max-width: 768px) {
  .button-row {
    gap: 0.75rem;
  }
}
</style>
