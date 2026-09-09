<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Steps 步骤条"
      description="引导用户按步骤完成任务的导航条。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        通过 <code>steps</code> 传入步骤数组，<code>v-model</code> 控制当前步骤。
      </template>
      <ComponentDocsDemoBlock :code="demo1Code">
        <Steps
          v-model="active1"
          :steps="basicSteps"
        />
        <div class="demo-actions">
          <button
            class="demo-btn"
            :disabled="active1 <= 0"
            @click="active1--"
          >
            上一步
          </button>
          <button
            class="demo-btn"
            :disabled="active1 >= 2"
            @click="active1++"
          >
            下一步
          </button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="自定义图标">
      <template #description>
        通过 <code>#icon-{index}</code> 插槽自定义每步的图标内容。
      </template>
      <ComponentDocsDemoBlock :code="demo3Code">
        <Steps
          v-model="active3"
          :steps="iconSteps"
        >
          <template #icon-0>
            <PersonIcon />
          </template>
          <template #icon-1>
            <PackageIcon />
          </template>
          <template #icon-2>
            <CreditCardIcon />
          </template>
          <template #icon-3>
            <RocketIcon />
          </template>
        </Steps>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="带描述">
      <template #description>
        步骤项可包含 <code>description</code> 字段显示辅助说明。
      </template>
      <ComponentDocsDemoBlock :code="demo4Code">
        <Steps
          v-model="active4"
          :steps="descSteps"
        />
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
      <h3>StepItem</h3>
      <Table
        :columns="apiCols"
        :data="stepItemRows"
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
import { ref } from 'vue'
import { Steps, type StepItem } from '@/components/primer-vue/Steps'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import { PersonIcon, PackageIcon, CreditCardIcon, RocketIcon } from '@/components/octicons-vue3'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const active1 = ref(0)
const active3 = ref(1)
const active4 = ref(1)

const basicSteps: StepItem[] = [
  { title: '账号信息' },
  { title: '个人资料' },
  { title: '完成' }
]

const iconSteps: StepItem[] = [
  { title: '个人信息' },
  { title: '配送方式' },
  { title: '支付' },
  { title: '完成' }
]

const descSteps: StepItem[] = [
  { title: '账号信息', description: '填写邮箱和密码' },
  { title: '个人资料', description: '完善头像和昵称' },
  { title: '完成', description: '确认并提交' }
]

const demo1Code = `<template>
  <Steps v-model="active" :steps="steps" />
  <div class="demo-actions">
    <button :disabled="active <= 0" @click="active--">上一步</button>
    <button :disabled="active >= 2" @click="active++">下一步</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Steps, type StepItem } from '@/components/primer-vue/Steps'

const active = ref(0)
const steps: StepItem[] = [
  { title: '账号信息' },
  { title: '个人资料' },
  { title: '完成' }
]
<\/script>`

const demo3Code = `<script setup lang="ts">
import { ref } from 'vue'
import { Steps, type StepItem } from '@/components/primer-vue/Steps'
import { PersonIcon, PackageIcon, CreditCardIcon, RocketIcon } from '@/components/octicons-vue3'

const active = ref(1)
const steps: StepItem[] = [
  { title: '个人信息' },
  { title: '配送方式' },
  { title: '支付' },
  { title: '完成' }
]
<\/script>

<template>
  <Steps v-model="active" :steps="steps">
    <template #icon-0><PersonIcon /></template>
    <template #icon-1><PackageIcon /></template>
    <template #icon-2><CreditCardIcon /></template>
    <template #icon-3><RocketIcon /></template>
  </Steps>
</template>`

const demo4Code = `<template>
  <Steps v-model="active" :steps="steps" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Steps, type StepItem } from '@/components/primer-vue/Steps'

const active = ref(1)
const steps: StepItem[] = [
  { title: '账号信息', description: '填写邮箱和密码' },
  { title: '个人资料', description: '完善头像和昵称' },
  { title: '完成', description: '确认并提交' }
]
<\/script>`

const apiCols: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'type', label: '类型', minWidth: '200px', wrap: true },
  { key: 'description', label: '说明', minWidth: '200px', wrap: true }
]

const apiRows = [
  { name: 'modelValue', description: '当前激活步骤索引（v-model）', type: 'number', default: '0' },
  { name: 'steps', description: '步骤配置数组', type: 'StepItem[]', default: '—' },
  { name: 'orientation', description: '方向', type: "'horizontal' | 'vertical'", default: "'horizontal'" }
]

const stepItemRows = [
  { name: 'title', description: '步骤标题', type: 'string', default: '—' },
  { name: 'description', description: '步骤描述（可选）', type: 'string', default: '—' }
]

const slotCols: TableColumn[] = [
  { key: 'name', label: '插槽名', rowHeader: true, minWidth: '140px' },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true }
]

const slotRows = [
  { name: 'icon-{index}', description: '自定义第 N 步的图标内容，作用域参数：{ state, index }' }
]
</script>

<style scoped>
.demo-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.demo-btn {
  padding: 4px 16px;
  border: 1px solid var(--borderColor-default, #d1d9e0);
  border-radius: 6px;
  background: var(--bgColor-default, #fff);
  color: var(--fgColor-default, #1f2328);
  cursor: pointer;
  font-size: 13px;
}

.demo-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
