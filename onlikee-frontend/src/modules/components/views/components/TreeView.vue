<script setup lang="ts">
import { onBeforeUnmount, shallowRef, useId } from 'vue'
import { RouterLink } from 'vue-router'
import { FileIcon, PencilIcon, TrashIcon, GrabberIcon } from '@onlikee/octicons-vue'
import { TreeView, type SubTreeState } from '@/components/primer-vue/TreeView'
import { Button, IconButton } from '@/components/primer-vue/Button'
import { Link } from '@/components/primer-vue/Link'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const id = useId()
const expanded = shallowRef(false)
const selected = shallowRef('')
const actionMessage = shallowRef('')
const asyncExpanded = shallowRef(false)
const asyncState = shallowRef<SubTreeState>('initial')
const asyncItems = shallowRef<string[]>([])
let pending: ReturnType<typeof setTimeout> | undefined
function load(result: 'success' | 'empty' | 'error' = 'success') {
  clearTimeout(pending)
  asyncExpanded.value = true
  asyncState.value = 'loading'
  asyncItems.value = []
  pending = setTimeout(() => {
    asyncItems.value = result === 'success' ? ['Avatar.vue', 'Button.vue', 'Checkbox.vue'] : []
    asyncState.value = result === 'error' ? 'error' : 'done'
  }, 800)
}
function expandAsync(value: boolean) {
  asyncExpanded.value = value
  if (value && asyncState.value === 'initial') load()
}
function dismiss() {
  asyncState.value = 'initial'
}
onBeforeUnmount(() => clearTimeout(pending))
const actions = [
  {
    label: 'Edit',
    icon: PencilIcon,
    onClick: () => {
      actionMessage.value = 'Edit'
    },
  },
  {
    label: 'Delete',
    icon: TrashIcon,
    count: 2,
    onClick: () => {
      actionMessage.value = 'Delete'
    },
  },
]
const basicCode = `<TreeView aria-label="Files">
  <TreeView.Item id="src" default-expanded>
    <TreeView.LeadingVisual label="Directory"><TreeView.DirectoryIcon /></TreeView.LeadingVisual>
    src
    <TreeView.SubTree>
      <TreeView.Item id="src/Avatar.vue">Avatar.vue</TreeView.Item>
      <TreeView.Item id="src/Button.vue" current>Button.vue</TreeView.Item>
    </TreeView.SubTree>
  </TreeView.Item>
  <TreeView.Item id="readme">README.md</TreeView.Item>
</TreeView>`
const controlledCode = `<TreeView aria-label="Controlled files">
  <TreeView.Item id="controlled" :expanded="expanded" @expanded-change="expanded = $event">
    src
    <TreeView.SubTree><TreeView.Item id="controlled/child">child.vue</TreeView.Item></TreeView.SubTree>
  </TreeView.Item>
</TreeView>`
const asyncCode = `<TreeView.Item id="async" :expanded="asyncExpanded" @expanded-change="expandAsync">
  Async directory
  <TreeView.SubTree :state="asyncState" :count="3">
    <TreeView.ErrorDialog v-if="asyncState === 'error'" title="加载失败" @retry="load()" @dismiss="dismiss">
      无法加载目录内容，请重试。
    </TreeView.ErrorDialog>
    <template v-else-if="asyncItems.length">
      <TreeView.Item v-for="name in asyncItems" :id="name" :key="name">{{ name }}</TreeView.Item>
    </template>
  </TreeView.SubTree>
</TreeView.Item>`
const compositionCode = `<TreeView aria-label="Actions">
  <TreeView.Item id="actions" :secondary-actions="actions" @select="selected = 'Source'">
    <TreeView.LeadingVisual v-slot="{ isExpanded }" label="Directory">{{ isExpanded ? '📂' : '📁' }}</TreeView.LeadingVisual>
    Source
    <TreeView.TrailingVisual label="Modified">M</TreeView.TrailingVisual>
    <TreeView.SubTree><TreeView.Item id="action-child">child.vue</TreeView.Item></TreeView.SubTree>
  </TreeView.Item>
  <TreeView.Item :as="RouterLink" id="route" to="/component/tree-view">RouterLink</TreeView.Item>
  <TreeView.Item :as="Link" id="link" href="#tree-example">Link</TreeView.Item>
</TreeView>`
const flatCode = `<TreeView aria-label="Flat files" flat :truncate="false">
  <TreeView.Item id="long-file">A long file name that wraps instead of being truncated</TreeView.Item>
</TreeView>`
const leadingCode = `<TreeView.Item id="leading-action">
  <TreeView.LeadingAction><IconButton :icon="GrabberIcon" aria-label="Reorder" variant="invisible" /></TreeView.LeadingAction>
  Item
</TreeView.Item>`
const columns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '150px' },
  { field: 'type', header: '类型', minWidth: '180px' },
  { field: 'default', header: '默认值', minWidth: '100px' },
  { field: 'description', header: '说明', minWidth: '260px' },
]
const rows = [
  {
    id: 'root',
    name: 'TreeView',
    type: 'aria-label / aria-labelledby, flat, truncate, className, style',
    default: 'flat 未设置，truncate=true',
    description: '固定 ul[role=tree]；只转发源码声明的属性，Vue class 与 className 合并',
  },
  {
    id: 'item',
    name: 'Item.id / as',
    type: 'string / 原生标签 | Component',
    default: 'li',
    description: 'id 必填；非 li 根元素外包 li[role=none]，其他原生或组件属性透传到 treeitem',
  },
  {
    id: 'expanded',
    name: 'Item.expanded / defaultExpanded',
    type: 'boolean | null / boolean',
    default: '缓存值 → defaultExpanded → current',
    description: 'expanded 未设置时非受控；null 移除 aria-expanded；@expanded-change 收到请求值',
  },
  {
    id: 'select',
    name: 'Item.current / @select',
    type: 'boolean / (MouseEvent | KeyboardEvent) => void',
    default: 'false / —',
    description:
      'current 是当前位置；aria-selected 表示焦点。定义 select 后，点击、Enter、Space 调用回调，箭头与 chevron 仍控制展开',
  },
  {
    id: 'contain',
    name: 'Item.containIntrinsicSize',
    type: 'string',
    default: '—',
    description: '在内容行设置 content-visibility:auto 及 contain-intrinsic-size',
  },
  {
    id: 'subtree',
    name: 'SubTree.state / count / aria-label',
    type: 'initial | loading | done | error / number / string',
    default: '同步内容 / — / 父节点名称',
    description:
      '折叠时卸载子节点，重挂载恢复展开缓存；loading 展示 Spinner 或指定数量的骨架；error 内容由调用方提供',
  },
  {
    id: 'visual',
    name: 'LeadingVisual / TrailingVisual / LeadingAction',
    type: 'label?: string；默认作用域插槽 { isExpanded }',
    default: '—',
    description:
      '前后视觉提供 aria-describedby；视觉内容与 leading action 对辅助技术隐藏，行为沿用源码',
  },
  {
    id: 'actions',
    name: 'Item.secondaryActions',
    type: '{ label, icon, onClick, count?, className? }[]',
    default: '—',
    description:
      '尾部 Button / IconButton 与 Tooltip 组合；快捷键 Shift+Control+U（Apple 为 Shift+Command+U），单操作直接调用，多操作打开 Dialog + ActionList',
  },
  {
    id: 'error',
    name: 'ErrorDialog',
    type: 'title?, @retry, @dismiss',
    default: 'Error',
    description:
      '组合 ConfirmationDialog；Retry 请求重试，Dismiss / Escape / 关闭按钮折叠父节点，关闭后将焦点交回父节点',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="TreeView 树视图"
      description="呈现层级结构，支持键盘导航、展开状态缓存、异步内容及辅助操作。"
    />
    <ComponentDocsSection title="文件树与键盘导航">
      <template #description
        >上下键移动到相邻可见节点；右键展开或进入子节点，左键折叠或返回父节点。支持
        Home、End、PageUp、PageDown、Backspace 和字符前缀查找（300ms 后重置）。Tab 进入树时优先聚焦
        current 节点。</template
      >
      <ComponentDocsDemoBlock :code="basicCode">
        <TreeView class="tree-example" aria-label="Files">
          <TreeView.Item :id="`${id}-src`" default-expanded>
            <TreeView.LeadingVisual label="Directory"
              ><TreeView.DirectoryIcon
            /></TreeView.LeadingVisual>
            src
            <TreeView.SubTree>
              <TreeView.Item :id="`${id}-avatar`"
                ><TreeView.LeadingVisual label="File"><FileIcon /></TreeView.LeadingVisual
                >Avatar.vue</TreeView.Item
              >
              <TreeView.Item :id="`${id}-button`" current
                ><TreeView.LeadingVisual label="File"><FileIcon /></TreeView.LeadingVisual
                >Button.vue</TreeView.Item
              >
              <TreeView.Item :id="`${id}-nested`"
                ><TreeView.LeadingVisual label="Directory"
                  ><TreeView.DirectoryIcon /></TreeView.LeadingVisual
                >nested<TreeView.SubTree
                  ><TreeView.Item :id="`${id}-nested-child`"
                    >child.vue</TreeView.Item
                  ></TreeView.SubTree
                ></TreeView.Item
              >
            </TreeView.SubTree>
          </TreeView.Item>
          <TreeView.Item :id="`${id}-readme`">README.md</TreeView.Item>
        </TreeView>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="受控展开">
      <template #description
        >通过 expanded 与 expanded-change 控制状态；current 不会替代外部传入的 expanded。</template
      >
      <ComponentDocsDemoBlock :code="controlledCode">
        <div class="tree-demo-column">
          <Button @click="expanded = !expanded">{{ expanded ? 'Collapse' : 'Expand' }}</Button>
          <TreeView class="tree-example" aria-label="Controlled files"
            ><TreeView.Item
              :id="`${id}-controlled`"
              :expanded="expanded"
              @expanded-change="expanded = $event"
              >src<TreeView.SubTree
                ><TreeView.Item :id="`${id}-controlled-child`"
                  >child.vue</TreeView.Item
                ></TreeView.SubTree
              ></TreeView.Item
            ></TreeView
          >
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="异步加载与错误重试">
      <template #description
        >加载过程使用骨架行并播报状态。加载行持有焦点时，完成后转到首个子节点；结果为空时返回父节点。ErrorDialog
        处理重试、取消和焦点恢复。</template
      >
      <ComponentDocsDemoBlock :code="asyncCode">
        <div class="tree-demo-column">
          <div class="tree-demo-actions">
            <Button @click="load()">加载内容</Button
            ><Button @click="load('empty')">返回空结果</Button
            ><Button @click="load('error')">模拟错误</Button>
          </div>
          <TreeView class="tree-example" aria-label="Async files"
            ><TreeView.Item
              :id="`${id}-async`"
              :expanded="asyncExpanded"
              @expanded-change="expandAsync"
              ><TreeView.LeadingVisual label="Directory"
                ><TreeView.DirectoryIcon /></TreeView.LeadingVisual
              >Async directory<TreeView.SubTree :state="asyncState" :count="3"
                ><TreeView.ErrorDialog
                  v-if="asyncState === 'error'"
                  title="加载失败"
                  @retry="load()"
                  @dismiss="dismiss"
                  >无法加载目录内容，请重试。</TreeView.ErrorDialog
                ><template v-else-if="asyncItems.length"
                  ><TreeView.Item
                    v-for="name in asyncItems"
                    :id="`${id}-async-${name}`"
                    :key="name"
                    >{{ name }}</TreeView.Item
                  ></template
                ></TreeView.SubTree
              ></TreeView.Item
            ></TreeView
          >
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="辅助操作和链接组合">
      <template #description
        >尾部操作由 Button、IconButton、Tooltip 组合。使用行内播报的快捷键访问操作，多个操作打开
        Supplemental actions 对话框；点击操作不会选择或展开行。as 支持 Link、RouterLink
        与自定义组件。</template
      >
      <ComponentDocsDemoBlock :code="compositionCode">
        <div class="tree-demo-column">
          <TreeView class="tree-example" aria-label="Actions">
            <TreeView.Item
              :id="`${id}-actions`"
              :secondary-actions="actions"
              @select="selected = 'Source'"
            >
              <TreeView.LeadingVisual v-slot="{ isExpanded }" label="Directory">{{
                isExpanded ? '📂' : '📁'
              }}</TreeView.LeadingVisual
              >Source<TreeView.TrailingVisual label="Modified">M</TreeView.TrailingVisual>
              <TreeView.SubTree
                ><TreeView.Item :id="`${id}-actions-child`"
                  >child.vue</TreeView.Item
                ></TreeView.SubTree
              >
            </TreeView.Item>
            <TreeView.Item :id="`${id}-route`" :as="RouterLink" to="/component/tree-view"
              >RouterLink</TreeView.Item
            >
            <TreeView.Item :id="`${id}-link`" :as="Link" href="#tree-example">Link</TreeView.Item>
          </TreeView>
          <p aria-live="polite">
            已选择：{{ selected || '—' }}；最近操作：{{ actionMessage || '—' }}
          </p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="平铺与换行">
      <ComponentDocsDemoBlock :code="flatCode"
        ><TreeView class="tree-example" aria-label="Flat files" flat :truncate="false"
          ><TreeView.Item :id="`${id}-long`"
            >A long file name that wraps instead of being truncated in a narrow
            container</TreeView.Item
          ><TreeView.Item :id="`${id}-flat`">README.md</TreeView.Item></TreeView
        ></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="LeadingAction">
      <template #description
        >沿用源码的前置操作插槽；该区域 aria-hidden，不应作为关键操作的唯一入口。</template
      >
      <ComponentDocsDemoBlock :code="leadingCode"
        ><TreeView class="tree-example" aria-label="Leading action"
          ><TreeView.Item :id="`${id}-leading`"
            ><TreeView.LeadingAction
              ><IconButton
                :icon="GrabberIcon"
                aria-label="Reorder"
                variant="invisible" /></TreeView.LeadingAction
            >Item</TreeView.Item
          ></TreeView
        ></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <template #description
        >children 映射为默认插槽；视觉组件的函数 children 映射为作用域插槽。Item 的 Vue ref.element
        指向原生根元素，组合组件可通过公开的 element 继续转发 ref。展开缓存按 id 保存于当前 TreeView
        实例。</template
      >
      <VisuallyHidden :id="`${id}-api`">TreeView API</VisuallyHidden
      ><ComponentDocsTable :aria-labelledby="`${id}-api`" :columns="columns" :data="rows" />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>
<style scoped>
:deep(.tree-example) {
  width: 100%;
  max-width: 360px;
}
.tree-demo-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
}
.tree-demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
