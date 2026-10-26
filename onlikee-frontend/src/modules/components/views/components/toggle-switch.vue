<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, useId } from 'vue'
import { ToggleSwitch } from '@/components/primer-vue/ToggleSwitch'
import { Text } from '@/components/primer-vue/Text'
import { Button } from '@/components/primer-vue/Button'
import { SelectPanel } from '@/components/primer-vue/SelectPanel'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'

const id = useId()
const checked = shallowRef(false)
const saving = shallowRef(false)
const savedSetting = shallowRef(false)
const panelError = shallowRef(false)
const panelOpen = shallowRef(false)
const message = computed(() =>
  panelError.value
    ? { title: '无法加载项目', variant: 'error' as const, body: '请稍后重试。' }
    : { title: '暂无项目', variant: 'empty' as const, body: '创建项目后即可在这里选择。' },
)
let timer: ReturnType<typeof setTimeout> | undefined
function finishSaving() {
  clearTimeout(timer)
  saving.value = false
}
function startSaving() {
  saving.value = true
  timer = setTimeout(finishSaving, 3000)
}
onBeforeUnmount(() => clearTimeout(timer))

const basicCode = `<script setup lang="ts">
import { useId } from 'vue'
import { Text } from '@/components/primer-vue/Text'
import { ToggleSwitch } from '@/components/primer-vue/ToggleSwitch'
const labelId = useId()
<\/script>

<template>
  <Text :id="labelId">接收通知</Text>
  <ToggleSwitch :aria-labelledby="labelId" />
</template>`
const controlledCode = `<ToggleSwitch
  aria-labelledby="setting-label"
  :checked="checked"
  @change="checked = $event"
/>`
const statesCode = `<ToggleSwitch aria-labelledby="small-label" size="small" />
<ToggleSwitch aria-labelledby="disabled-label" default-checked disabled />
<ToggleSwitch aria-labelledby="custom-label" status-label-position="end"
  button-label-on="显示" button-label-off="隐藏" />`
const loadingCode = `<ToggleSwitch
  aria-labelledby="saving-label"
  aria-describedby="saving-caption"
  :checked="savedSetting"
  :loading="saving"
  loading-label="正在保存设置"
  :loading-label-delay="500"
  @change="savedSetting = $event"
  @click="startSaving"
/>`
const panelCode = `<Text id="error-label">启用错误状态</Text>
<ToggleSwitch aria-labelledby="error-label" :checked="panelError"
  @change="panelError = $event" />
<SelectPanel placeholder="选择项目" :open="panelOpen" :selected="[]" :items="[]"
  :message="panelError
    ? { title: '无法加载项目', variant: 'error' }
    : { title: '暂无项目', variant: 'empty' }"
  @open-change="panelOpen = $event" />`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性', rowHeader: true, minWidth: '180px' },
  { field: 'type', header: '类型', minWidth: '180px' },
  { field: 'default', header: '默认值', minWidth: '120px' },
  { field: 'description', header: '说明', minWidth: '280px' },
]
const rows = [
  {
    id: 'label',
    name: 'aria-labelledby',
    type: 'string',
    default: '必填',
    description: '标记开关名称的外部元素 ID，传给内部按钮。',
  },
  {
    id: 'description',
    name: 'aria-describedby',
    type: 'string',
    default: '-',
    description: '附加说明的元素 ID，与内部加载说明关联。',
  },
  {
    id: 'checked',
    name: 'checked / defaultChecked',
    type: 'boolean',
    default: 'undefined / false',
    description: '分别控制受控状态和非受控初始状态。',
  },
  {
    id: 'disabled',
    name: 'disabled / loading',
    type: 'boolean',
    default: 'false',
    description: '阻止切换回调；按钮保留焦点能力。loading 同时显示 Spinner。',
  },
  {
    id: 'size',
    name: 'size',
    type: "'small' | 'medium'",
    default: 'medium',
    description: '按钮尺寸分别为 48×24px 和 64×32px。',
  },
  {
    id: 'position',
    name: 'statusLabelPosition',
    type: "'start' | 'end'",
    default: 'start',
    description: 'On / Off 状态文字位于按钮之前或之后。',
  },
  {
    id: 'labels',
    name: 'buttonLabelOn / buttonLabelOff',
    type: 'string',
    default: 'On / Off',
    description: '自定义状态文字；不替代 aria-labelledby。',
  },
  {
    id: 'loadingLabel',
    name: 'loadingLabel',
    type: 'string',
    default: 'Loading',
    description: '通过 AriaStatus 向辅助技术播报加载内容。',
  },
  {
    id: 'delay',
    name: 'loadingLabelDelay',
    type: 'number',
    default: '2000',
    description: '加载说明的显示延迟，单位毫秒；不延迟 Spinner。',
  },
  {
    id: 'buttonType',
    name: 'buttonType',
    type: "'button' | 'submit' | 'reset'",
    default: 'button',
    description: '内部按钮的原生表单行为。开关自身不提交表单字段。',
  },
  {
    id: 'change',
    name: 'onChange / @change',
    type: '(checked: boolean) => void',
    default: '-',
    description: '用户点击按钮或状态文字时通知目标状态；外部更新 checked 不触发。',
  },
  {
    id: 'click',
    name: 'onClick / @click',
    type: '(event: MouseEvent) => void',
    default: '-',
    description: '在 change 回调之后调用；禁用和加载时不调用。',
  },
  {
    id: 'native',
    name: 'className / 原生属性',
    type: 'HTMLAttributes',
    default: '-',
    description: '类名、style 和其余原生属性传给外层 div。ref.element 指向内部按钮。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ToggleSwitch 开关"
      description="用于立即切换设置，支持受控状态、加载反馈和自定义状态文字。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description
        >通过 aria-labelledby 显式关联 Text 标签。点击按钮或 On / Off 状态文字都可以切换。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <div class="switch-row">
          <Text :id="`${id}-basic`" weight="semibold">接收通知</Text>
          <ToggleSwitch :aria-labelledby="`${id}-basic`" data-testid="basic-switch" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="受控状态">
      <ComponentDocsDemoBlock :code="controlledCode">
        <div class="switch-row">
          <Text :id="`${id}-controlled`">显示预览</Text>
          <ToggleSwitch
            :aria-labelledby="`${id}-controlled`"
            :checked="checked"
            @change="checked = $event"
          />
        </div>
        <p data-testid="controlled-value">当前状态：{{ checked ? 'On' : 'Off' }}</p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="尺寸、禁用和自定义文字">
      <ComponentDocsDemoBlock :code="statesCode">
        <div class="switch-stack">
          <div class="switch-row">
            <Text :id="`${id}-small`">小尺寸</Text
            ><ToggleSwitch :aria-labelledby="`${id}-small`" size="small" />
          </div>
          <div class="switch-row">
            <Text :id="`${id}-disabled`">禁用设置</Text
            ><ToggleSwitch :aria-labelledby="`${id}-disabled`" default-checked disabled />
          </div>
          <div class="switch-row">
            <Text :id="`${id}-custom`">显示图片</Text
            ><ToggleSwitch
              :aria-labelledby="`${id}-custom`"
              status-label-position="end"
              button-label-on="显示"
              button-label-off="隐藏"
            />
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="加载与辅助说明">
      <template #description
        >Spinner 立即出现，加载说明延迟 500ms 播报。加载和禁用状态使用
        aria-disabled，按钮仍可聚焦。</template
      >
      <ComponentDocsDemoBlock :code="loadingCode">
        <div class="switch-row">
          <div>
            <Text :id="`${id}-saving`" weight="semibold">同步通知</Text>
            <p :id="`${id}-caption`" class="caption">通知会发送到邮箱和通知中心。</p>
          </div>
          <ToggleSwitch
            :aria-labelledby="`${id}-saving`"
            :aria-describedby="`${id}-caption`"
            :checked="savedSetting"
            :loading="saving"
            loading-label="正在保存设置"
            :loading-label-delay="500"
            @change="savedSetting = $event"
            @click="startSaving"
          />
        </div>
        <Button v-if="saving" size="small" @click="finishSaving">完成加载</Button>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="与 SelectPanel 组合">
      <template #description
        >复现 React 示例中由 ToggleSwitch 控制 SelectPanel 错误消息的用法。</template
      >
      <ComponentDocsDemoBlock :code="panelCode">
        <div class="switch-stack">
          <div class="switch-row">
            <Text :id="`${id}-error`">启用错误状态</Text
            ><ToggleSwitch
              :aria-labelledby="`${id}-error`"
              :checked="panelError"
              @change="panelError = $event"
            />
          </div>
          <SelectPanel
            title="选择项目"
            placeholder="选择项目"
            :open="panelOpen"
            :selected="[]"
            :items="[]"
            :message="message"
            @open-change="panelOpen = $event"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <VisuallyHidden :id="`${id}-api`">ToggleSwitch 属性</VisuallyHidden>
      <ComponentDocsTable :aria-labelledby="`${id}-api`" :columns="columns" :data="rows" />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 480px;
}
.switch-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.caption {
  color: var(--fgColor-muted);
  font-size: var(--text-body-size-small);
  margin: 4px 0 0;
}
</style>
