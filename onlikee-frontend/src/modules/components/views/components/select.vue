<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Select 选择器"
      description="原生选择框，保留浏览器的键盘导航与表单提交行为。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过 <code>v-model:value</code> 绑定选中值，使用 <code>Select.Option</code> 声明选项。
      </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <Select
          v-model:value="val1"
          placeholder="请选择水果"
        >
          <Select.Option value="apple">
            苹果
          </Select.Option>
          <Select.Option value="banana">
            香蕉
          </Select.Option>
          <Select.Option value="cherry">
            樱桃
          </Select.Option>
          <Select.Option value="grape">
            葡萄
          </Select.Option>
          <Select.Option value="mango">
            芒果
          </Select.Option>
        </Select>
        <p class="demo-info">
          当前值：{{ val1 || '未选择' }}
        </p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="尺寸">
      <template #description>
        通过 <code>size</code> 控制选择器尺寸，默认是 <code>medium</code>。
      </template>
      <ComponentDocsDemoBlock :code="demo2Code">
        <div class="demo-row">
          <Select
            v-model:value="val2a"
            size="small"
            placeholder="Small"
          >
            <Select.Option value="one">
              Choice one
            </Select.Option>
            <Select.Option value="two">
              Choice two
            </Select.Option>
            <Select.Option value="three">
              Choice three
            </Select.Option>
          </Select>
          <Select
            v-model:value="val2b"
            placeholder="Medium"
          >
            <Select.Option value="one">
              Choice one
            </Select.Option>
            <Select.Option value="two">
              Choice two
            </Select.Option>
            <Select.Option value="three">
              Choice three
            </Select.Option>
          </Select>
          <Select
            v-model:value="val2c"
            size="large"
            placeholder="Large"
          >
            <Select.Option value="one">
              Choice one
            </Select.Option>
            <Select.Option value="two">
              Choice two
            </Select.Option>
            <Select.Option value="three">
              Choice three
            </Select.Option>
          </Select>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="禁用状态">
      <template #description>
        设置 <code>disabled</code> 属性禁用选择器。
      </template>
      <ComponentDocsDemoBlock :code="demo3Code">
        <Select
          v-model:value="val3"
          placeholder="禁用状态"
          disabled
        >
          <Select.Option
            v-for="option in fruitOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </Select.Option>
        </Select>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="多个选择器">
      <template #description>
        每个 <code>Select</code> 都是原生选择框，弹出菜单由浏览器和操作系统管理。
      </template>
      <ComponentDocsDemoBlock :code="demo4Code">
        <div class="demo-row">
          <Select
            v-model:value="val4a"
            placeholder="选择水果"
          >
            <Select.Option
              v-for="option in fruitOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </Select.Option>
          </Select>
          <Select
            v-model:value="val4b"
            placeholder="选择颜色"
          >
            <Select.Option
              v-for="option in colorOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </Select.Option>
          </Select>
          <Select
            v-model:value="val4c"
            placeholder="选择尺寸"
          >
            <Select.Option
              v-for="option in sizeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </Select.Option>
          </Select>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="键盘导航">
      <template #description>
        保留浏览器原生键盘操作，包括方向键选择、键入文本匹配选项；展开与关闭按当前平台的行为执行。
      </template>
      <ComponentDocsDemoBlock :code="demo5Code">
        <Select
          v-model:value="val5"
          placeholder="试试键盘操作"
        >
          <Select.Option
            v-for="option in fruitOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </Select.Option>
        </Select>
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
      <h3>Option</h3>
      <Table
        :columns="apiCols"
        :data="optionRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <h3>事件</h3>
      <Table
        :columns="eventCols"
        :data="eventRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@/components/primer-vue/Select'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const val1 = ref('')
const val2a = ref('')
const val2b = ref('')
const val2c = ref('')
const val3 = ref('apple')
const val4a = ref('')
const val4b = ref('')
const val4c = ref('')
const val5 = ref('')

const fruitOptions = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '樱桃' },
  { value: 'grape', label: '葡萄' },
  { value: 'mango', label: '芒果' }
]

const colorOptions = [
  { value: 'red', label: '红色' },
  { value: 'blue', label: '蓝色' },
  { value: 'green', label: '绿色' }
]

const sizeOptions = [
  { value: 'sm', label: '小号' },
  { value: 'md', label: '中号' },
  { value: 'lg', label: '大号' }
]

const demo1Code = `<template>
  <Select v-model:value="val" placeholder="请选择水果">
    <Select.Option value="apple">苹果</Select.Option>
    <Select.Option value="banana">香蕉</Select.Option>
    <Select.Option value="cherry">樱桃</Select.Option>
    <Select.Option value="grape">葡萄</Select.Option>
    <Select.Option value="mango">芒果</Select.Option>
  </Select>
  <p>当前值：{{ val || '未选择' }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@/components/primer-vue/Select'

const val = ref('')
<\/script>`

const demo2Code = `<template>
  <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
    <Select v-model:value="small" size="small" placeholder="Small">
      <Select.Option value="one">Choice one</Select.Option>
      <Select.Option value="two">Choice two</Select.Option>
      <Select.Option value="three">Choice three</Select.Option>
    </Select>

    <Select v-model:value="medium" placeholder="Medium">
      <Select.Option value="one">Choice one</Select.Option>
      <Select.Option value="two">Choice two</Select.Option>
      <Select.Option value="three">Choice three</Select.Option>
    </Select>

    <Select v-model:value="large" size="large" placeholder="Large">
      <Select.Option value="one">Choice one</Select.Option>
      <Select.Option value="two">Choice two</Select.Option>
      <Select.Option value="three">Choice three</Select.Option>
    </Select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@/components/primer-vue/Select'

const small = ref('')
const medium = ref('')
const large = ref('')
<\/script>`

const demo3Code = `<template>
  <Select v-model:value="val" placeholder="禁用状态" disabled >
            <Select.Option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</Select.Option>
          </Select>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@/components/primer-vue/Select'

const val = ref('apple')
const options = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' }
]
<\/script>`

const demo4Code = `<template>
  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    <Select v-model:value="a" placeholder="选择水果" >
            <Select.Option v-for="option in fruits" :key="option.value" :value="option.value">{{ option.label }}</Select.Option>
          </Select>
    <Select v-model:value="b" placeholder="选择颜色" >
            <Select.Option v-for="option in colors" :key="option.value" :value="option.value">{{ option.label }}</Select.Option>
          </Select>
    <Select v-model:value="c" placeholder="选择尺寸" >
            <Select.Option v-for="option in sizes" :key="option.value" :value="option.value">{{ option.label }}</Select.Option>
          </Select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@/components/primer-vue/Select'

const a = ref('')
const b = ref('')
const c = ref('')

const fruits = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' }
]
const colors = [
  { value: 'red', label: '红色' },
  { value: 'blue', label: '蓝色' }
]
const sizes = [
  { value: 'sm', label: '小号' },
  { value: 'lg', label: '大号' }
]
<\/script>`

const demo5Code = `<!-- 使用浏览器原生键盘操作 -->
<template>
  <Select v-model:value="val" placeholder="试试键盘操作" >
            <Select.Option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</Select.Option>
          </Select>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Select } from '@/components/primer-vue/Select'

const val = ref('')
const options = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '樱桃' }
]
<\/script>`

const apiCols: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'type', label: '类型', minWidth: '200px', wrap: true },
  { key: 'description', label: '说明', minWidth: '200px', wrap: true }
]

const apiRows = [
  { name: 'value', description: '受控绑定值（v-model:value）', type: 'string | number', default: '—' },
  { name: 'defaultValue', description: '非受控初始值', type: 'string | number', default: '—' },
  { name: 'placeholder', description: '未选时的占位文字', type: 'string', default: '—' },
  { name: 'disabled', description: '是否禁用', type: 'boolean', default: 'false' },
  { name: 'size', description: '选择器尺寸', type: `'small' | 'medium' | 'large'`, default: `'medium'` }
]

const optionRows = [
  { name: 'value', description: '选项值', type: 'string', default: '—' },
  { name: 'disabled', description: '禁用选项；Select.OptGroup 也支持 label 与 disabled', type: 'boolean', default: 'false' },
  { name: 'default', description: '选项内容', type: 'slot', default: '—' }
]

const eventCols: TableColumn[] = [
  { key: 'name', label: '事件名', rowHeader: true, minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '200px', wrap: true },
  { key: 'type', label: '回调参数', minWidth: '200px', wrap: true }
]

const eventRows = [
  { name: 'update:value', description: '选中值变化时触发', type: 'string' },
  { name: 'change', description: '原生选择事件', type: 'Event' }
]
</script>

<style scoped>
.demo-info {
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--fgColor-muted, #656d76);
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
