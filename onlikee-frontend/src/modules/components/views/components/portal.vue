<script setup lang="ts">
import { onMounted, shallowRef, useId } from 'vue'
import { Portal, PortalContext, registerPortalRoot } from '@/components/primer-vue/Portal'
import { Popover } from '@/components/primer-vue/Popover'
import { Button } from '@/components/primer-vue/Button'
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
const firstRootName = `${documentationId}-first`
const secondRootName = `${documentationId}-second`
const firstRoot = shallowRef<HTMLDivElement | null>(null)
const secondRoot = shallowRef<HTMLDivElement | null>(null)
const ready = shallowRef(false)
const useSecond = shallowRef(false)
const show = shallowRef(true)
const mountCount = shallowRef(0)
onMounted(() => {
  registerPortalRoot(firstRoot.value!, firstRootName)
  registerPortalRoot(secondRoot.value!, secondRootName)
  ready.value = true
})
const registrationCode = `<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { Portal, registerPortalRoot } from '@/components/primer-vue/Portal'

const root = shallowRef<HTMLDivElement | null>(null)
const ready = shallowRef(false)
onMounted(() => {
  registerPortalRoot(root.value!, 'example')
  ready.value = true
})
<\/script>

<template>
  <div ref="root" />
  <Portal v-if="ready" container-name="example">挂载到指定容器的内容</Portal>
</template>`
const contextCode = `<PortalContext.Provider :value="{ portalContainerName: 'example' }">
  <Portal>
    <Popover open relative>
      <Popover.Content>通过上下文选择容器</Popover.Content>
    </Popover>
  </Portal>
  <Portal container-name="another">显式属性优先于上下文</Portal>
</PortalContext.Provider>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '名称', rowHeader: true },
  { field: 'type', header: '类型' },
  { field: 'default', header: '默认值' },
  { field: 'description', header: '说明' },
]
const rows: DocumentationRow[] = [
  {
    id: 'containerName',
    name: 'containerName',
    type: 'string',
    default: '上下文 / __default__',
    description: '容器必须先由 registerPortalRoot 注册；显式属性优先于上下文。',
  },
  {
    id: 'onMount',
    name: 'onMount',
    type: '() => void',
    default: '—',
    description: 'Portal host 加入容器后调用；容器变化时重新调用，回调自身变化不触发重挂。',
  },
  {
    id: 'default',
    name: 'default 插槽',
    type: '—',
    default: '—',
    description: '渲染到容器中；保留 Vue 逻辑父子关系与 provide/inject 上下文。',
  },
]
const helperRows: DocumentationRow[] = [
  {
    id: 'register',
    name: 'registerPortalRoot(root, name?)',
    type: '(Element, string?) => void',
    default: 'name = __default__',
    description: '注册或替换具名容器；根元素的生命周期由调用方管理。',
  },
  {
    id: 'context',
    name: 'PortalContext.Provider',
    type: 'value: { portalContainerName?: string }',
    default: '{}',
    description:
      '为后代 Portal 指定容器，也适用于 Overlay、AnchoredOverlay、ActionMenu 和 Dialog。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Portal 传送容器"
      description="将内容挂载到独立 DOM 容器，保留组件的逻辑父子关系。"
    />
    <ComponentDocsSection title="注册容器与切换">
      <template #description
        >先注册容器再渲染 Portal。切换容器保留 host、子组件状态与输入内容；挂载次数记录 host
        加入容器的次数。</template
      >
      <ComponentDocsDemoBlock :code="registrationCode">
        <div class="portal-demo">
          <div class="portal-actions">
            <Button @click="useSecond = !useSecond">切换目标容器</Button>
            <Button @click="show = !show">{{ show ? '卸载内容' : '挂载内容' }}</Button>
            <span role="status">挂载次数：{{ mountCount }}</span>
          </div>
          <div class="portal-roots">
            <div class="portal-root">
              <strong>容器 A</strong>
              <div ref="firstRoot" />
            </div>
            <div class="portal-root">
              <strong>容器 B</strong>
              <div ref="secondRoot" />
            </div>
          </div>
          <Portal
            v-if="ready && show"
            :container-name="useSecond ? secondRootName : firstRootName"
            :on-mount="() => mountCount++"
          >
            <label class="portal-input">保留输入内容<input aria-label="Portal 输入" /></label>
          </Portal>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="上下文与 Popover 组合">
      <template #description
        >通过 PortalContext 为子树选择容器。Popover 继续继承上下文；Portal
        本身只负责挂载，不处理定位、焦点或关闭。</template
      >
      <ComponentDocsDemoBlock :code="contextCode">
        <PortalContext.Provider :value="{ portalContainerName: firstRootName }">
          <Portal v-if="ready">
            <Popover open relative class="portal-popover">
              <Popover.Content width="auto">通过 PortalContext 渲染的 Popover</Popover.Content>
            </Popover>
          </Portal>
        </PortalContext.Provider>
        <span>组合内容显示在上方容器 A 中。</span>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="默认容器与服务端渲染">
      <template #description
        >未指定名称时，默认根为 #__primerPortalRoot__，优先放在 [data-portal-root] 内，否则放在 body
        中。每个 Portal host 使用 position: relative 和 z-index: 1。服务端 HTML 不包含 Portal
        子内容，hydration 后在客户端挂载；客户端直接渲染时，父组件首次 onMounted 可以读取子内容
        ref。</template
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="Portal 属性与插槽" variant="api">
      <VisuallyHidden :id="`${documentationId}-props`">Portal 属性与插槽</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-props`"
        :columns="columns"
        :data="rows"
      />
    </ComponentDocsSection>
    <ComponentDocsSection title="容器注册与上下文" variant="api">
      <VisuallyHidden :id="`${documentationId}-helpers`">Portal 容器注册与上下文</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-helpers`"
        :columns="columns"
        :data="helperRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.portal-demo {
  display: grid;
  gap: 24px;
  width: 100%;
}

.portal-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.portal-roots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 16px;
}

.portal-root {
  padding: 24px;
  border: 1px dashed var(--borderColor-default);
  border-radius: var(--borderRadius-medium);
}

.portal-input {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.portal-popover {
  margin-top: 24px;
}
</style>
