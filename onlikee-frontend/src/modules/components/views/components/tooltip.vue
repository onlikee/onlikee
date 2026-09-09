<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Tooltip 文字提示"
      description="鼠标悬停时显示提示信息，用于简要说明元素的功能。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过 <code>content</code> 设置提示文字，默认在元素上方显示。
      </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <div class="demo-row">
          <Tooltip content="这是一条提示信息">
            <button class="demo-btn">
              悬停查看
            </button>
          </Tooltip>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="不同位置">
      <template #description>
        通过 <code>placement</code> 设置提示出现的位置，支持 <code>top</code>、<code>bottom</code>、<code>left</code>、<code>right</code>、<code>left-top</code>、<code>left-bottom</code>、<code>right-top</code>、<code>right-bottom</code>。
      </template>
      <ComponentDocsDemoBlock :code="demo2Code">
        <div class="demo-placement">
          <Tooltip
            content="Top 提示"
            placement="top"
          >
            <button class="demo-btn">
              Top
            </button>
          </Tooltip>
          <Tooltip
            content="Left 提示"
            placement="left"
          >
            <button class="demo-btn">
              Left
            </button>
          </Tooltip>
          <Tooltip
            content="Right 提示"
            placement="right"
          >
            <button class="demo-btn">
              Right
            </button>
          </Tooltip>
          <Tooltip
            content="Bottom 提示"
            placement="bottom"
          >
            <button class="demo-btn">
              Bottom
            </button>
          </Tooltip>
          <Tooltip
            content="Left Top 提示"
            placement="left-top"
          >
            <button class="demo-btn">
              Left Top
            </button>
          </Tooltip>
          <Tooltip
            content="Left Bottom 提示"
            placement="left-bottom"
          >
            <button class="demo-btn">
              Left Bottom
            </button>
          </Tooltip>
          <Tooltip
            content="Right Top 提示"
            placement="right-top"
          >
            <button class="demo-btn">
              Right Top
            </button>
          </Tooltip>
          <Tooltip
            content="Right Bottom 提示"
            placement="right-bottom"
          >
            <button class="demo-btn">
              Right Bottom
            </button>
          </Tooltip>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="延迟显示与隐藏">
      <template #description>
        通过 <code>showDelay</code> 和 <code>hideDelay</code> 控制提示的出现和消失延迟（毫秒）。
      </template>
      <ComponentDocsDemoBlock :code="demo3Code">
        <div class="demo-row">
          <Tooltip
            content="延迟 500ms 显示"
            :show-delay="500"
          >
            <button class="demo-btn">
              延迟显示
            </button>
          </Tooltip>
          <Tooltip
            content="延迟 300ms 隐藏"
            :hide-delay="300"
          >
            <button class="demo-btn">
              延迟隐藏
            </button>
          </Tooltip>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="禁用状态">
      <template #description>
        设置 <code>disabled</code> 属性后，Tooltip 不再响应鼠标事件。
      </template>
      <ComponentDocsDemoBlock :code="demo4Code">
        <div class="demo-row">
          <Tooltip
            content="你看不到我"
            disabled
          >
            <button class="demo-btn">
              禁用 Tooltip
            </button>
          </Tooltip>
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
import { Tooltip } from '@/components/primer-vue/Tooltip'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const demo1Code = `<template>
  <Tooltip content="这是一条提示信息">
    <button>悬停查看</button>
  </Tooltip>
</template>

<script setup lang="ts">
import { Tooltip } from '@/components/primer-vue/Tooltip'
<\/script>`

const demo2Code = `<template>
  <Tooltip content="Top 提示" placement="top">
    <button>Top</button>
  </Tooltip>
  <Tooltip content="Bottom 提示" placement="bottom">
    <button>Bottom</button>
  </Tooltip>
  <Tooltip content="Left 提示" placement="left">
    <button>Left</button>
  </Tooltip>
  <Tooltip content="Right 提示" placement="right">
    <button>Right</button>
  </Tooltip>
  <Tooltip content="Left Top 提示" placement="left-top">
    <button>Left Top</button>
  </Tooltip>
  <Tooltip content="Left Bottom 提示" placement="left-bottom">
    <button>Left Bottom</button>
  </Tooltip>
  <Tooltip content="Right Top 提示" placement="right-top">
    <button>Right Top</button>
  </Tooltip>
  <Tooltip content="Right Bottom 提示" placement="right-bottom">
    <button>Right Bottom</button>
  </Tooltip>
</template>

<script setup lang="ts">
import { Tooltip } from '@/components/primer-vue/Tooltip'
<\/script>`

const demo3Code = `<template>
  <Tooltip content="延迟 500ms 显示" :showDelay="500">
    <button>延迟显示</button>
  </Tooltip>
  <Tooltip content="延迟 300ms 隐藏" :hideDelay="300">
    <button>延迟隐藏</button>
  </Tooltip>
</template>

<script setup lang="ts">
import { Tooltip } from '@/components/primer-vue/Tooltip'
<\/script>`

const demo4Code = `<template>
  <Tooltip content="你看不到我" disabled>
    <button>禁用 Tooltip</button>
  </Tooltip>
</template>

<script setup lang="ts">
import { Tooltip } from '@/components/primer-vue/Tooltip'
<\/script>`

const apiCols: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'type', label: '类型', minWidth: '240px', wrap: true },
  { key: 'description', label: '说明', minWidth: '200px', wrap: true }
]

const apiRows = [
  { name: 'content', description: 'Tooltip 显示的文字内容', type: 'string', default: '—' },
  { name: 'placement', description: '弹出位置', type: "'top' | 'bottom' | 'left' | 'right' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom'", default: "'top'" },
  { name: 'showDelay', description: '延迟显示时间（毫秒）', type: 'number', default: '0' },
  { name: 'hideDelay', description: '延迟隐藏时间（毫秒）', type: 'number', default: '0' },
  { name: 'disabled', description: '是否禁用', type: 'boolean', default: 'false' }
]

const slotCols: TableColumn[] = [
  { key: 'name', label: '插槽名', rowHeader: true, minWidth: '140px' },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true }
]

const slotRows = [
  { name: 'default', description: '触发 Tooltip 的元素' }
]
</script>

<style scoped>
.demo-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.demo-btn {
  padding: 6px 16px;
  border: 1px solid var(--borderColor-default, #d1d9e0);
  border-radius: 6px;
  background: var(--bgColor-default, #fff);
  color: var(--fgColor-default, #1f2328);
  cursor: pointer;
  font-size: 13px;
}

.demo-placement {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
