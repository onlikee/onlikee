<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import {
  SelectPanel,
  type ItemInput,
  type SelectPanelMessageProps,
} from '@/components/primer-vue/SelectPanel'
import { FormControl } from '@/components/primer-vue/FormControl'
import { Button } from '@/components/primer-vue/Button'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '../../components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '../../components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '../../components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '../../components/ComponentDocsPage/ComponentDocsSection.vue'

const choices: ItemInput[] = [
  { id: 'bug', text: 'Bug', description: '需要修复的问题', groupId: 'work' },
  { id: 'feature', text: 'Feature', description: '新增能力', groupId: 'work' },
  { id: 'docs', text: 'Documentation', description: '文档改进', groupId: 'other' },
  { id: 'help', text: 'Help wanted', description: '需要协助', groupId: 'other' },
]
const matches = (item: ItemInput, value: string) =>
  item.text?.toLowerCase().includes(value.toLowerCase())

// —— 演示 1：单选与表单关联 ——
const singleOpen = ref(false)
const single = shallowRef<ItemInput>()
const singleFilter = ref('')
const singleItems = computed(() => choices.filter((item) => matches(item, singleFilter.value)))
const lastGesture = ref('尚未关闭')

// —— 演示 2：多选、分组与全选 ——
const multiOpen = ref(false)
const multiple = shallowRef<ItemInput[]>([])
const multiFilter = ref('')
const multiItems = computed(() => choices.filter((item) => matches(item, multiFilter.value)))

// —— 演示 3：模态确认 ——
const modalOpen = ref(false)
const modal = shallowRef<ItemInput>(choices[0]!)
const modalFilter = ref('')
const modalItems = computed(() => choices.filter((item) => matches(item, modalFilter.value)))

// —— 演示 4：异步加载与空态消息 ——
const asyncOpen = ref(false)
const asyncSelected = shallowRef<ItemInput>()
const asyncFilter = ref('')
const asyncLoading = ref(false)
const asyncItems = shallowRef<ItemInput[]>([])
let asyncTimer: ReturnType<typeof setTimeout> | undefined
function loadAsyncItems(value: string) {
  if (asyncTimer !== undefined) clearTimeout(asyncTimer)
  asyncLoading.value = true
  asyncTimer = setTimeout(() => {
    asyncItems.value = choices.filter((item) => matches(item, value))
    asyncLoading.value = false
  }, 600)
}
watch(asyncOpen, (open) => {
  if (open) loadAsyncItems(asyncFilter.value)
})
watch(asyncFilter, (value) => {
  if (asyncOpen.value) loadAsyncItems(value)
})
onBeforeUnmount(() => {
  if (asyncTimer !== undefined) clearTimeout(asyncTimer)
})
const asyncMessage = computed<SelectPanelMessageProps | undefined>(() => {
  if (asyncLoading.value || asyncItems.value.length > 0) return undefined
  return asyncFilter.value
    ? {
        title: `没有找到匹配“${asyncFilter.value}”的标签`,
        variant: 'empty',
        body: '换个关键词试试，或先创建新标签。',
      }
    : { title: '暂无可用标签', variant: 'empty', body: '创建标签后会出现在这里供选择。' }
})

// —— 演示 5：通知与次要操作 ——
const noticeOpen = ref(false)
const noticeSelected = shallowRef<ItemInput>()

// —— 演示 6：虚拟化长列表 ——
const virtualOpen = ref(false)
const virtualSelected = shallowRef<ItemInput>()
const virtualFilter = ref('')
const manyChoices: ItemInput[] = Array.from({ length: 200 }, (_, index) => ({
  id: `virtual-${index + 1}`,
  text: `标签 ${String(index + 1).padStart(3, '0')}`,
  description: (index + 1) % 4 === 0 ? '示例项描述，用于展示两行高度的列表项。' : undefined,
}))
const virtualItems = computed(() =>
  manyChoices.filter((item) => matches(item, virtualFilter.value)),
)

// —— 演示 7：外部锚点 ——
const externalOpen = ref(false)
const externalSelected = shallowRef<ItemInput>()
const externalButton = ref<InstanceType<typeof Button> | null>(null)
// 模板会自动解包顶层 ref，而 anchor-ref 需要 ref 对象本身：用普通对象持有，避免解包
const external = {
  anchor: computed(() => (externalButton.value?.$el as HTMLElement | undefined) ?? null),
}

const basicCode = `<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { SelectPanel, type ItemInput } from '@/components/primer-vue/SelectPanel'
import { FormControl } from '@/components/primer-vue/FormControl'

const open = ref(false)
const selected = shallowRef<ItemInput>()
const filterValue = ref('')
const allItems: ItemInput[] = [
  { id: 'bug', text: 'Bug', description: '需要修复的问题' },
  { id: 'feature', text: 'Feature', description: '新增能力' }
]
const filteredItems = computed(() =>
  allItems.filter(item => item.text?.toLowerCase().includes(filterValue.value.toLowerCase())))
<\/script>

<template>
  <FormControl>
    <FormControl.Label>问题标签</FormControl.Label>
    <SelectPanel
      v-model:open="open"
      v-model:selected="selected"
      v-model:filter-value="filterValue"
      :items="filteredItems"
      title="选择标签"
      input-label="筛选标签"
      placeholder="选择标签"
    />
    <FormControl.Caption>当前标签：{{ selected?.text ?? '未选择' }}</FormControl.Caption>
  </FormControl>
</template>`

const multiCode = `<script setup lang="ts">
const open = ref(false)
const selectedItems = shallowRef<ItemInput[]>([])
const filterValue = ref('')
const groups = [
  { groupId: 'work', header: { title: '工作类型' } },
  { groupId: 'other', header: { title: '其他' } }
]
// items 中通过 groupId 归组；筛选结果仍由调用方计算
<\/script>

<template>
  <SelectPanel
    v-model:open="open"
    v-model:selected="selectedItems"
    v-model:filter-value="filterValue"
    :items="filteredItems"
    :group-metadata="groups"
    show-select-all
    title="选择多个标签"
    placeholder="选择标签"
    input-label="筛选多个标签"
  />
</template>`

const modalCode = `<script setup lang="ts">
const open = ref(false)
const selected = shallowRef<ItemInput>()
<\/script>

<template>
  <!-- modal 变体必须提供 @cancel（类型层面强约束） -->
  <SelectPanel
    v-model:open="open"
    v-model:selected="selected"
    :items="items"
    variant="modal"
    title="确认标签"
    subtitle="点击 Save 提交当前选择。"
    @cancel="handleCancel"
  />
</template>`

const asyncCode = `<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { SelectPanel, type ItemInput, type SelectPanelMessageProps } from '@/components/primer-vue/SelectPanel'

const open = ref(false)
const selected = shallowRef<ItemInput>()
const filterValue = ref('')
const loading = ref(false)
const items = shallowRef<ItemInput[]>([])

watch(filterValue, async value => {
  if (!open.value) return
  loading.value = true
  items.value = await fetchLabels(value) // 搜索期间已选项保持不变
  loading.value = false
})

// 区分「没有数据」和「筛选无结果」两种空态（默认消息两者共用）
const message = computed<SelectPanelMessageProps | undefined>(() => {
  if (loading.value || items.value.length > 0) return undefined
  return filterValue.value
    ? { title: '没有找到匹配结果', variant: 'empty', body: '换个关键词试试。' }
    : { title: '暂无可用标签', variant: 'empty', body: '创建标签后会出现在这里。' }
})
<\/script>

<template>
  <SelectPanel
    v-model:open="open"
    v-model:selected="selected"
    v-model:filter-value="filterValue"
    :items="items"
    :loading="loading"
    :message="message"
    title="异步加载标签"
    input-label="筛选标签"
    placeholder="选择标签"
  />
</template>`

const noticeCode = `<template>
  <SelectPanel
    v-model:open="open"
    v-model:selected="selected"
    :items="items"
    title="带通知的面板"
    :notice="{ text: '标签列表从远端同步，可能略有延迟。', variant: 'info' }"
  >
    <template #secondaryAction>
      <SelectPanel.SecondaryActionLink href="/labels" >
        管理标签
      </SelectPanel.SecondaryActionLink>
    </template>
  </SelectPanel>
</template>`

const virtualCode = `<script setup lang="ts">
// 200 个条目：只渲染可视区 + 少量缓冲区，长列表建议开启
const items = Array.from({ length: 200 }, (_, i) => ({ id: i + 1, text: \`标签 \${i + 1}\` }))
<\/script>

<template>
  <SelectPanel
    v-model:open="open"
    v-model:selected="selected"
    v-model:filter-value="filterValue"
    :items="filteredItems"
    virtualized
    title="虚拟化长列表"
  />
</template>`

const externalCode = `<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { SelectPanel, type ItemInput } from '@/components/primer-vue/SelectPanel'
import { Button } from '@/components/primer-vue/Button'

const open = ref(false)
const selected = shallowRef<ItemInput>()
const button = ref<InstanceType<typeof Button> | null>(null)
// render-anchor 传 null 时不渲染内置触发器，必须提供 anchor-ref 并手动切换 open。
// 注意：模板会自动解包顶层 ref，anchor-ref 需要 ref 对象本身，用普通对象持有避免解包
const external = { anchor: computed(() => (button.value?.$el as HTMLElement | undefined) ?? null) }
<\/script>

<template>
  <Button
    ref="button"
    :aria-expanded="open"
    aria-haspopup="dialog"
    @click="open = !open"
  >
    {{ selected?.text ?? '自定义触发按钮' }}
  </Button>
  <SelectPanel
    v-model:open="open"
    v-model:selected="selected"
    :items="items"
    :render-anchor="null"
    :anchor-ref="external.anchor"
    title="外部锚点面板"
  />
</template>`

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '180px' },
  { key: 'default', label: '默认值', minWidth: '130px', wrap: true },
  { key: 'type', label: '类型', minWidth: '240px', wrap: true },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true },
]

const selectPanelPropsRows = [
  {
    name: 'open（必填）',
    default: '-',
    type: 'boolean',
    description: '面板是否打开，支持 v-model:open。',
  },
  {
    name: 'selected（必填）',
    default: '-',
    type: 'ItemInput | ItemInput[] | undefined',
    description: '当前选中项；传数组即多选。支持 v-model:selected。单选模态下点 Save 才更新。',
  },
  {
    name: 'items（必填）',
    default: '-',
    type: 'ItemInput[]',
    description: '列表数据。筛选逻辑由调用方提供（通常基于 filterValue 的 computed）。',
  },
  {
    name: 'variant',
    default: "'anchored'",
    type: "'anchored' | 'modal'",
    description:
      'anchored 关闭即应用选择；modal 需点击 Save 确认（窄屏 fullscreen 同 modal 语义）。',
  },
  {
    name: 'title',
    default: "'Select an item' / 'Select items'",
    type: 'string | VNodeChild',
    description: '面板标题，作为 aria-labelledby 来源；默认值随单选/多选切换。',
  },
  {
    name: 'subtitle',
    default: '-',
    type: 'string | VNodeChild',
    description: '副标题，作为 aria-describedby 来源；也可用 #subtitle 插槽。',
  },
  {
    name: 'placeholder',
    default: '-',
    type: 'string',
    description: '无选中项时内置锚按钮显示的文本（内置 label 来源）。',
  },
  {
    name: 'placeholderText',
    default: "'Filter items'",
    type: 'string',
    description: '筛选输入框占位文本。',
  },
  {
    name: 'inputLabel',
    default: '同 placeholderText',
    type: 'string',
    description: '筛选输入框的 aria-label。',
  },
  {
    name: 'filterValue',
    default: '-',
    type: 'string',
    description: '受控筛选文本，支持 v-model:filter-value；不传则内部维护。',
  },
  {
    name: 'loading',
    default: '内部推断',
    type: 'boolean',
    description: '加载态。未传时按内部节奏推断（打开后延迟判定，避免闪烁）。',
  },
  {
    name: 'initialLoadingType',
    default: "'spinner'",
    type: "'spinner' | 'skeleton'",
    description: '首次打开（尚无数据）时的加载样式；数据到达后的再次加载固定为输入框内 spinner。',
  },
  {
    name: 'message',
    default: '默认空态消息',
    type: 'SelectPanelMessageProps',
    description: "空/错误/警告消息区。items 为空且未传时显示默认 'No items available'。",
  },
  {
    name: 'notice',
    default: '-',
    type: "{ text: VNodeChild; variant: 'info' | 'warning' | 'error' }",
    description: '面板顶部通知条；也可用 #notice 插槽。',
  },
  {
    name: 'secondaryAction',
    default: '-',
    type: 'VNodeChild',
    description:
      '底部次要操作区；也可用 #secondaryAction 插槽，配合 SecondaryActionLink / SecondaryActionButton。',
  },
  {
    name: 'footer',
    default: '-',
    type: 'VNodeChild',
    description: '已废弃，请使用 secondaryAction。',
  },
  {
    name: 'showSelectedOptionsFirst',
    default: 'true',
    type: 'boolean',
    description:
      '打开时把已选项排到列表顶部（受 primer_react_select_panel_order_selected_at_top 特性开关控制）。',
  },
  {
    name: 'showSelectAll',
    default: 'false',
    type: 'boolean',
    description:
      '多选时显示全选框；文案随状态在 Select all / Deselect all 间切换，部分选中时呈半选态。仅作用于当前筛选结果。',
  },
  {
    name: 'disableFullscreenOnNarrow',
    default: 'false',
    type: 'boolean',
    description: '窄视口下禁用全屏行为，保持锚定位置。',
  },
  {
    name: 'displayInViewport',
    default: 'false',
    type: 'boolean',
    description: '尽量将面板完整放入可视视口，避免页面滚动。',
  },
  {
    name: 'align',
    default: "'start'",
    type: "'start' | 'end' | 'center'",
    description: '面板相对锚点的对齐方式。',
  },
  {
    name: 'width / height',
    default: '-',
    type: 'OverlayWidth / OverlayHeight',
    description: "浮层尺寸档位（'auto' | 'small' | … | 'xxlarge' / 'fit-content' 等）。",
  },
  {
    name: 'overlayProps',
    default: '-',
    type: 'Partial<OverlayProps>',
    description: '透传底层 Overlay（side、anchorOffset、trapFocus 等）。',
  },
  {
    name: 'renderAnchor',
    default: '内置按钮',
    type: '((props: AnchorRenderProps) => VNodeChild) | null',
    description:
      '自定义触发器渲染函数，接收 ref、点击/键盘处理与 ARIA 属性，须全部转发；传 null 关闭内置触发器（必须配合 anchorRef）。',
  },
  {
    name: 'anchorRef',
    default: '-',
    type: 'Ref<HTMLElement | null>',
    description: '外部锚点元素 ref；触发器与面板分离时使用，open 需手动切换。',
  },
  {
    name: 'cssAnchorPositioningSettings',
    default: '-',
    type: '{ disable?: boolean; fallbackStrategy?: string }',
    description: 'CSS anchor positioning 实验配置（特性开关默认关闭）。',
  },
  {
    name: 'disabled / required / validationStatus',
    default: '-',
    type: "boolean / boolean / 'error' | 'success'",
    description: 'FormControl 表单集成：禁用、必填与校验状态。',
  },
  {
    name: 'onCancel / onOpenChange / onSelectedChange',
    default: '-',
    type: 'function',
    description: '回调 props；推荐使用对应事件（cancel / open-change / selected-change）。',
  },
]

const inheritedPropsRows = [
  {
    name: 'groupMetadata',
    default: '-',
    type: 'GroupMetadata[]',
    description:
      '分组元数据（groupId、header.title、renderItem）；items 用 groupId 归组。提供分组时虚拟化不生效。',
  },
  {
    name: 'virtualized',
    default: 'false',
    type: 'boolean',
    description: '客户端虚拟滚动，仅渲染可视区 + overscan 缓冲；超过 100 项建议开启。',
  },
  {
    name: 'textInputProps',
    default: '-',
    type: 'Record<string, unknown>',
    description: '透传筛选输入框（TextInput props，如 contrast、leadingVisual）。',
  },
  {
    name: 'inputRef / scrollContainerRef',
    default: '-',
    type: 'Ref | ((el) => void)',
    description: '筛选输入框 / 滚动容器的 ref（对象或回调形式）。',
  },
  {
    name: 'actionListProps',
    default: '-',
    type: 'object',
    description: '透传列表容器（className、variant、showDividers 等）。',
  },
  {
    name: 'renderItem / renderGroup',
    default: '-',
    type: '(props) => VNodeChild',
    description: '自定义列表项 / 分组渲染。',
  },
  {
    name: 'id / aria-label',
    default: '-',
    type: 'string',
    description: '列表容器 id 与无障碍名称（列表 role 固定为 listbox，项默认 role=option）。',
  },
  {
    name: 'focusOutBehavior',
    default: "'wrap'",
    type: "'stop' | 'wrap'",
    description: 'Tab 到达面板边界时循环（wrap）或停止（stop）。',
  },
  {
    name: 'announcementsEnabled',
    default: 'true',
    type: 'boolean',
    description: '筛选结果变化时的屏幕阅读器播报。',
  },
  {
    name: 'onSelectAllChange',
    default: '-',
    type: '(checked: boolean) => void',
    description: '全选框变化回调（不拦截默认全选行为时可不传）。',
  },
  {
    name: 'onActiveDescendantChanged',
    default: '-',
    type: '(current, previous, directlyActivated) => void',
    description: '激活项（active descendant）变化回调。',
  },
  {
    name: 'scrollBehavior',
    default: '-',
    type: 'ScrollBehavior',
    description: '导航/回视口滚动行为（auto | smooth | instant）。',
  },
]

const eventTableColumns: TableColumn[] = [
  { key: 'name', label: '事件名', rowHeader: true, minWidth: '200px' },
  { key: 'payload', label: '载荷', minWidth: '260px', wrap: true },
  { key: 'description', label: '说明', minWidth: '300px', wrap: true },
]

const eventTableRows = [
  { name: 'update:open', payload: 'boolean', description: 'open 变更，用于 v-model:open。' },
  {
    name: 'open-change',
    payload:
      "(open: boolean, gesture: 'anchor-click' | 'anchor-key-press' | 'click-outside' | 'escape' | 'selection' | 'cancel')",
    description: '开关变更及触发手势。',
  },
  {
    name: 'update:selected / selected-change',
    payload: 'ItemInput | ItemInput[] | undefined',
    description: '选中项变更；单选锚定模式点选即触发，单选模态在 Save 时触发。',
  },
  {
    name: 'update:filterValue / filter-change',
    payload: 'string, Event | null',
    description: '筛选文本变更；首次空列表加载引发的事件为 null。',
  },
  {
    name: 'cancel',
    payload: '-',
    description: '取消手势：模态 Cancel 按钮、关闭按钮、模态下点击外部。',
  },
  {
    name: 'active-descendant-changed',
    payload: 'HTMLElement | undefined ×2, boolean',
    description: '激活项变化（当前项、前一项、是否直接激活）。',
  },
]

const slotTableColumns: TableColumn[] = [
  { key: 'name', label: '插槽名', rowHeader: true, minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '320px', wrap: true },
]

const slotTableRows = [
  {
    name: 'anchor',
    description:
      '替换内置触发按钮（仅在未传 renderAnchor 时生效）；自定义触发器应转发 ref、点击/键盘处理与 ARIA 属性。',
  },
  { name: 'subtitle', description: '副标题内容，subtitle prop 优先。' },
  { name: 'notice', description: '通知条内容，notice.text 优先。' },
  { name: 'secondaryAction', description: '底部次要操作区内容，secondaryAction prop 优先。' },
  { name: 'footer', description: '底部内容（已废弃，请用 secondaryAction）。' },
]

const compoundTableColumns: TableColumn[] = [
  { key: 'name', label: '组件', rowHeader: true, minWidth: '260px' },
  { key: 'description', label: '说明', minWidth: '320px', wrap: true },
]

const compoundTableRows = [
  {
    name: 'SelectPanel.Message',
    description:
      "面板消息区：title（必填）、variant（'empty' | 'error' | 'warning'）、body、icon、action、className。message prop 即其配置形式。",
  },
  {
    name: 'SelectPanel.SecondaryActionButton',
    description: '页脚块级按钮，属性透传 SelectPanelButton（loading、count、onClick 等）。',
  },
  {
    name: 'SelectPanel.SecondaryActionLink',
    description: '页脚块级链接（invisible 按钮形态、as="a"），透传 href、target 等原生属性。',
  },
]
</script>
<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="SelectPanel 选择面板"
      description="带筛选输入的选择对话框：支持单选/多选、分组、虚拟滚动与可选的主/次操作。anchored 变体在面板关闭时应用变更；modal 与窄屏 fullscreen 变体在点击 Save 确认后才应用。"
    />

    <ComponentDocsSection title="单选与表单关联">
      <template #description>
        open、selected 和 filterValue 使用命名 v-model，筛选结果由调用方计算提供。FormControl
        自动关联标签、说明和选中值；锚按钮的无障碍名称可来自按钮内部（placeholder / 选中值）或外部
        label。
      </template>
      <ComponentDocsDemoBlock :code="basicCode">
        <FormControl id="select-panel-demo">
          <FormControl.Label>问题标签</FormControl.Label>
          <SelectPanel
            v-model:open="singleOpen"
            v-model:selected="single"
            v-model:filter-value="singleFilter"
            :items="singleItems"
            title="选择标签"
            input-label="筛选标签"
            placeholder="选择标签"
            @open-change="
              (open, gesture) => {
                if (!open) lastGesture = gesture
              }
            "
          />
          <FormControl.Caption
            >当前标签：{{ single?.text ?? '未选择' }}；最近关闭原因：{{
              lastGesture
            }}</FormControl.Caption
          >
        </FormControl>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="多选、分组与全选">
      <template #description>
        selected 为数组时启用多选。items 通过 groupId 归入 groupMetadata
        声明的分组；全选仅作用于当前筛选结果，筛选范围外的已选项保持不变。
      </template>
      <ComponentDocsDemoBlock :code="multiCode">
        <SelectPanel
          v-model:open="multiOpen"
          v-model:selected="multiple"
          v-model:filter-value="multiFilter"
          :items="multiItems"
          :group-metadata="[
            { groupId: 'work', header: { title: '工作类型' } },
            { groupId: 'other', header: { title: '其他' } },
          ]"
          show-select-all
          title="选择多个标签"
          placeholder="选择标签"
          input-label="筛选多个标签"
        />
        <p class="select-panel-demo__result">
          已选择：{{ multiple.map((item) => item.text).join('、') || '未选择' }}
        </p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="模态确认">
      <template #description>
        单选模态面板先保留临时选择，点击 Save 后才写入
        selected；Cancel、关闭按钮和点击外部丢弃临时选择。类型层面 modal 变体要求必须提供 @cancel。
      </template>
      <ComponentDocsDemoBlock :code="modalCode">
        <SelectPanel
          v-model:open="modalOpen"
          v-model:selected="modal"
          v-model:filter-value="modalFilter"
          :items="modalItems"
          variant="modal"
          title="确认标签"
          subtitle="点击 Save 提交当前选择。"
          input-label="筛选确认标签"
          @cancel="lastGesture = 'cancel'"
        />
        <p class="select-panel-demo__result">已保存：{{ modal?.text ?? '未选择' }}</p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="异步加载与空态消息">
      <template #description>
        搜索期间保持已有选择，并用最小化的加载提示（输入框内
        spinner）指示进行中；首次打开尚无数据时用 spinner 或
        skeleton（initialLoadingType）避免展示空列表。默认空态消息对「无数据」和「筛选无结果」共用，建议按场景区分自定义
        message。
      </template>
      <ComponentDocsDemoBlock :code="asyncCode">
        <SelectPanel
          v-model:open="asyncOpen"
          v-model:selected="asyncSelected"
          v-model:filter-value="asyncFilter"
          :items="asyncItems"
          :loading="asyncLoading"
          :message="asyncMessage"
          title="异步加载标签"
          input-label="筛选标签"
          placeholder="选择标签"
        />
        <p class="select-panel-demo__result">
          输入关键词后延迟 600ms 返回结果；试试搜索「zzz」查看自定义空态。
        </p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="通知与次要操作">
      <template #description>
        notice 在面板顶部展示 info / warning / error
        通知；底部可选的次要操作区放置链接或按钮，用于「管理标签」这类附加动作，不影响主选择流程。
      </template>
      <ComponentDocsDemoBlock :code="noticeCode">
        <SelectPanel
          v-model:open="noticeOpen"
          v-model:selected="noticeSelected"
          :items="choices"
          title="带通知的面板"
          input-label="筛选标签"
          placeholder="选择标签"
          :notice="{ text: '标签列表从远端同步，可能略有延迟。', variant: 'info' }"
        >
          <template #secondaryAction>
            <SelectPanel.SecondaryActionLink
              href="https://primer.style/product/components/select-panel/"
              target="_blank"
              rel="noreferrer"
            >
              管理标签
            </SelectPanel.SecondaryActionLink>
          </template>
        </SelectPanel>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="虚拟化长列表">
      <template #description>
        超过 100 项建议开启 virtualized：仅渲染可视区加少量缓冲，滚动性能稳定。存在 groupMetadata
        分组时虚拟化不生效，回退普通列表。
      </template>
      <ComponentDocsDemoBlock :code="virtualCode">
        <SelectPanel
          v-model:open="virtualOpen"
          v-model:selected="virtualSelected"
          v-model:filter-value="virtualFilter"
          :items="virtualItems"
          virtualized
          title="虚拟化长列表"
          input-label="筛选标签"
          placeholder="选择标签"
        />
        <p class="select-panel-demo__result">
          共 {{ manyChoices.length }} 项，仅渲染可视区附近的少量 DOM 节点。
        </p>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="外部锚点">
      <template #description>
        触发器与面板分离时，render-anchor 传 null 并传入 anchor-ref，同时手动切换
        open、自行维护触发器上的 aria-expanded 等 ARIA 属性。
      </template>
      <ComponentDocsDemoBlock :code="externalCode">
        <div class="select-panel-demo__external">
          <Button
            ref="externalButton"
            :aria-expanded="externalOpen"
            aria-haspopup="dialog"
            @click="externalOpen = !externalOpen"
          >
            {{ externalSelected?.text ?? '自定义触发按钮' }}
          </Button>
          <SelectPanel
            v-model:open="externalOpen"
            v-model:selected="externalSelected"
            :items="choices"
            :render-anchor="null"
            :anchor-ref="external.anchor"
            title="外部锚点面板"
            input-label="筛选标签"
          />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="使用指南">
      <ul class="select-panel-docs__guide">
        <li>
          <strong>应用时机</strong>：anchored 关闭即应用；modal / 窄屏 fullscreen 点击 Save
          才应用，Cancel、关闭按钮与点击外部会丢弃临时选择。
        </li>
        <li>
          <strong>锚按钮 label</strong>：锚按钮若代表当前选择，必须有可访问名称——内部（按钮中显示
          placeholder 或选中值）或外部（相邻 label，如 FormControl.Label）二选一。
        </li>
        <li>
          <strong>搜索体验</strong>：搜索新项时保持当前选择；加载提示保持最小化，避免列表整体闪烁。
        </li>
        <li>
          <strong>空态消息</strong
          >：默认消息不区分「无数据」与「筛选无结果」，正式业务建议用条件逻辑分别配置 message。
        </li>
        <li>
          <strong>键盘交互</strong>：↑ ↓ 导航、PageUp / PageDown 翻页、Enter 选择、Esc 关闭；Tab
          默认在面板内循环（focusOutBehavior）。
        </li>
        <li>
          <strong>手势追踪</strong>：open-change 的 gesture
          报告关闭来源（anchor-click、anchor-key-press、click-outside、escape、selection、cancel）。
        </li>
        <li><strong>长列表</strong>：超过 100 项开启 virtualized；分组场景请用普通列表。</li>
      </ul>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <h3>SelectPanel Props</h3>
      <Table
        :columns="apiTableColumns"
        :data="selectPanelPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>继承的列表 Props（FilteredActionList）</h3>
      <Table
        :columns="apiTableColumns"
        :data="inheritedPropsRows"
        row-key="name"
        compact
        :hoverable="false"
      />
      <p class="select-panel-docs__note">
        完整继承清单见 <code>src/components/primer-vue/FilteredActionList/types.ts</code> 的
        FilteredActionListProps。
      </p>

      <h3>事件</h3>
      <Table
        :columns="eventTableColumns"
        :data="eventTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>插槽</h3>
      <Table
        :columns="slotTableColumns"
        :data="slotTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>组合组件</h3>
      <Table
        :columns="compoundTableColumns"
        :data="compoundTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
<style scoped>
.select-panel-demo__result {
  margin-block: 12px 0;
  font-size: 12px;
  color: var(--fgColor-muted, #59636e);
}
.select-panel-demo__external {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
.select-panel-docs__guide {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 20px;
  line-height: 1.7;
  color: var(--fgColor-default);
}
.select-panel-docs__note {
  margin-top: 8px;
  font-size: 12px;
  color: var(--fgColor-muted);
}
.select-panel-docs__note code {
  padding: 0.125rem 0.375rem;
  background: var(--bgColor-muted);
  border: 1px solid var(--borderColor-default);
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
</style>
