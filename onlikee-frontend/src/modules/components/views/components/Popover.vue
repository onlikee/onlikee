<script setup lang="ts">
import { computed, shallowRef, useId } from 'vue'
import { Popover, type PopoverProps } from '@/components/primer-vue/Popover'
import { Button } from '@/components/primer-vue/Button'
import { Heading } from '@/components/primer-vue/Heading'
import { Text } from '@/components/primer-vue/Text'
import { ActionMenu } from '@/components/primer-vue/ActionMenu'
import { ActionList } from '@/components/primer-vue/ActionList'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsTable, {
  type DocumentationColumn,
  type DocumentationRow,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'

const documentationId = useId()
const open = shallowRef(true)
const trigger = shallowRef<{ element: HTMLButtonElement | null } | null>(null)
const triggerElement = computed(() => trigger.value?.element ?? null)
const bindings = { ignoreClickRefs: [triggerElement] }
const close = () => {
  open.value = false
}
const carets: NonNullable<PopoverProps['caret']>[] = [
  'top',
  'top-left',
  'top-right',
  'bottom',
  'bottom-left',
  'bottom-right',
  'left',
  'left-top',
  'left-bottom',
  'right',
  'right-top',
  'right-bottom',
]
const basicCode = `<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { Popover } from '@/components/primer-vue/Popover'
import { Button } from '@/components/primer-vue/Button'

const open = shallowRef(true)
const trigger = shallowRef<{ element: HTMLButtonElement | null } | null>(null)
const triggerElement = computed(() => trigger.value?.element ?? null)
const bindings = { ignoreClickRefs: [triggerElement] }
const close = () => { open.value = false }
<\/script>

<template>
  <Button ref="trigger" :aria-expanded="open" @click="open = !open">切换 Popover</Button>
  <Popover relative :open="open" style="margin-top: 16px">
    <Popover.Content v-bind="bindings" :on-click-outside="close" :on-escape="close">
      <p>点击外部或按 Escape 关闭。</p>
      <Button @click="close">知道了</Button>
    </Popover.Content>
  </Popover>
</template>`
const caretCode = `<Popover open relative caret="bottom-right">
  <Popover.Content width="small">提示内容</Popover.Content>
</Popover>`
const compositionCode = `<Popover open relative>
  <Popover.Content>
    <ActionMenu>
      <ActionMenu.Button>更多操作</ActionMenu.Button>
      <ActionMenu.Overlay>
        <ActionList>
          <ActionList.Item>复制链接</ActionList.Item>
          <ActionList.Item>保存</ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  </Popover.Content>
</Popover>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '名称', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rows: DocumentationRow[] = [
  {
    id: 'open',
    name: 'open',
    type: 'boolean',
    default: 'false',
    description: '由调用方控制显示；隐藏时保留子树。',
  },
  {
    id: 'relative',
    name: 'relative',
    type: 'boolean',
    default: 'false',
    description: '使用 relative 定位；默认 absolute。',
  },
  {
    id: 'caret',
    name: 'caret',
    type: carets.join(' | '),
    default: 'top',
    description: '设置箭头方向，不负责相对锚点定位。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '与内置类及 Vue class 合并。',
  },
]
const contentRows: DocumentationRow[] = [
  {
    id: 'width',
    name: 'width',
    type: 'xsmall | small | medium | large | xlarge | auto',
    default: 'small',
    description: '使用主题中的 overlay 宽度变量。',
  },
  {
    id: 'height',
    name: 'height',
    type: 'small | medium | large | xlarge | auto | fit-content',
    default: 'fit-content',
    description: '使用主题中的 overlay 高度变量。',
  },
  {
    id: 'overflow',
    name: 'overflow',
    type: 'auto | hidden | scroll | visible',
    default: '—',
    description: '跟随 React 透传为 DOM 属性；需要裁剪时通过 style 设置 CSS overflow。',
  },
  {
    id: 'onClickOutside',
    name: 'onClickOutside',
    type: '(MouseEvent | TouchEvent) => void',
    default: '—',
    description: '检测内容外的按下事件，隐藏时仍会监听；由回调决定是否关闭。',
  },
  {
    id: 'ignoreClickRefs',
    name: 'ignoreClickRefs',
    type: 'Ref<HTMLElement | null>[]',
    default: '[]',
    description: '这些元素中的按下事件不触发外部点击回调。',
  },
  {
    id: 'onEscape',
    name: 'onEscape',
    type: '(KeyboardEvent) => void',
    default: '—',
    description: '所属 Popover 打开时处理 Escape，并阻止默认行为。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '与内置类及 Vue class 合并。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Popover 气泡提示"
      description="展示带箭头的补充内容，由调用方控制显示、定位与关闭。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description
        >与 Button、Heading、Text 组合。忽略打开按钮的外部点击，避免切换时重复关闭。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <div class="popover-demo">
          <Button ref="trigger" :aria-expanded="open" @click="open = !open">切换 Popover</Button>
          <Popover relative :open="open" class="demo-popover">
            <Popover.Content v-bind="bindings" :on-click-outside="close" :on-escape="close">
              <Heading as="h3" variant="small">Popover 标题</Heading>
              <Text as="p">点击外部或按 Escape 关闭。</Text>
              <Button @click="close">知道了</Button>
            </Popover.Content>
          </Popover>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="箭头方向">
      <ComponentDocsDemoBlock :code="caretCode">
        <div class="caret-grid">
          <Popover v-for="caret in carets" :key="caret" open relative :caret="caret">
            <Popover.Content width="auto">{{ caret }}</Popover.Content>
          </Popover>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="与 ActionMenu 组合">
      <template #description
        >菜单通过 Portal 渲染，嵌套的 Escape 和外部点击沿共享交互注册表处理。</template
      >
      <ComponentDocsDemoBlock :code="compositionCode">
        <Popover open relative>
          <Popover.Content>
            <ActionMenu>
              <ActionMenu.Button>更多操作</ActionMenu.Button>
              <ActionMenu.Overlay>
                <ActionList>
                  <ActionList.Item>复制链接</ActionList.Item>
                  <ActionList.Item>保存</ActionList.Item>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </Popover.Content>
        </Popover>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="Popover 属性" variant="api">
      <template #description
        >固定渲染 div；支持原生属性、事件和默认插槽。模板 ref 的 element 指向根 div。as
        作为原生属性透传，不改变 div 标签。组件不会自动聚焦、捕获焦点或添加 ARIA 角色。</template
      >
      <VisuallyHidden :id="`${documentationId}-root`">Popover 属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-root`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>
    <ComponentDocsSection title="Popover.Content 属性" variant="api">
      <template #description
        >固定渲染 div，默认插槽放置内容。不会自动创建 Portal；需要挂载到其他容器时，可将 Popover
        放在 Portal 中。</template
      >
      <VisuallyHidden :id="`${documentationId}-content`">Popover.Content 属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-content`"
        :columns="columns"
        :data="contentRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.popover-demo {
  display: grid;
  justify-items: center;
}

.demo-popover {
  margin-top: 16px;
}

.caret-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 40px;
  width: 100%;
  padding: 16px;
}
</style>
