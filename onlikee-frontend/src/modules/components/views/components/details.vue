<script setup lang="ts">
import { useId } from 'vue'
import { Details, useDetails } from '@/components/primer-vue/Details'
import { Button } from '@/components/primer-vue/Button'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useId()
const { getDetailsProps } = useDetails({ closeOnOutsideClick: true })
const { getDetailsProps: getCustomProps } = useDetails({ closeOnOutsideClick: true })
const {
  open,
  setOpen,
  getDetailsProps: getControlledProps,
} = useDetails({
  defaultOpen: true,
  closeOnOutsideClick: true,
  onClickOutside: (event) => {
    if (event.target instanceof Element && event.target.closest('[data-keep-details-open]')) {
      event.preventDefault()
    }
  },
})

const basicCode = `<script setup lang="ts">
import { Details, useDetails } from '@/components/primer-vue/Details'
import { Button } from '@/components/primer-vue/Button'
const { getDetailsProps } = useDetails({ closeOnOutsideClick: true })
<\/script>

<template>
  <Details v-bind="getDetailsProps()">
    <Details.Summary :as="Button">查看详情</Details.Summary>
    <p>点击外部关闭；点击内容区域保持展开。</p>
  </Details>
</template>`
const customCode = `<Details v-bind="getDetailsProps()">
  <summary>自定义摘要</summary>
  <p>也可以使用原生 summary，保留原生鼠标和键盘交互。</p>
</Details>`
const controlledCode = `<script setup lang="ts">
import { Details, useDetails } from '@/components/primer-vue/Details'
import { Button } from '@/components/primer-vue/Button'
const { open, setOpen, getDetailsProps } = useDetails({
  defaultOpen: true,
  closeOnOutsideClick: true,
  onClickOutside: (event) => {
    if (event.target instanceof Element && event.target.closest('[data-keep-details-open]')) {
      event.preventDefault()
    }
  },
})
<\/script>

<template>
  <Details v-bind="getDetailsProps()">
    <Details.Summary :as="Button">{{ open ? '收起' : '展开' }}</Details.Summary>
    <p>可以使用摘要或下面的按钮关闭。</p>
    <Button @click="setOpen(false)">关闭详情</Button>
  </Details>
  <Button data-keep-details-open>点击此按钮保持展开</Button>
</template>`

const apiColumns: DocumentationColumn[] = [
  { field: 'name', header: '名称', rowHeader: true, minWidth: '160px' },
  { field: 'type', header: '类型', minWidth: '220px' },
  { field: 'description', header: '说明', minWidth: '280px' },
]
const componentRows = [
  {
    id: 'native',
    name: 'Details 原生属性与事件',
    type: 'DetailsHTMLAttributes',
    description:
      '透传 open、name、toggle、class、style、aria-* 等；组件 ref 通过 element 暴露 HTMLDetailsElement。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    description: '追加类名，可与 Vue 的 class 一起使用。',
  },
  {
    id: 'as',
    name: 'Details.Summary.as',
    type: '原生标签 | Vue 组件',
    description:
      '默认 summary；传入 Button 等组件时，会向该组件传递 as="summary"。自定义组件需支持此属性。',
  },
]
const hookRows = [
  {
    id: 'defaultOpen',
    name: 'defaultOpen',
    type: 'boolean',
    description: '初始开合状态，默认 undefined（关闭）；后续修改不会重置状态。',
  },
  {
    id: 'closeOnOutsideClick',
    name: 'closeOnOutsideClick',
    type: 'boolean',
    description: '默认不启用；设为 true 时在展开期间监听 document click，关闭或卸载时移除监听。',
  },
  {
    id: 'onClickOutside',
    name: 'onClickOutside',
    type: '(event: MouseEvent) => void',
    description: '外部点击回调；调用 event.preventDefault() 可取消关闭。',
  },
  {
    id: 'ref',
    name: 'ref',
    type: 'Ref<HTMLDetailsElement | null>',
    description: '可选 DOM 引用；支持绑定 Details 或原生 details，卸载后清空。',
  },
  {
    id: 'open',
    name: '返回 open',
    type: 'Ref<boolean | undefined>',
    description: '响应式状态，通过原生 toggle 事件与 DOM 同步。',
  },
  {
    id: 'setOpen',
    name: '返回 setOpen',
    type: '(value | updater) => void',
    description: '设置状态，支持 setOpen(false) 或 setOpen(previous => !previous)。',
  },
  {
    id: 'getDetailsProps',
    name: '返回 getDetailsProps',
    type: '() => { open, onToggle, ref }',
    description: '在模板中使用 v-bind="getDetailsProps()"；在渲染函数中同样可直接传给 h。',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Details 详情折叠"
      description="基于原生 details 和 summary 的内容折叠组件。"
    />
    <ComponentDocsSection title="Button 摘要与外部点击关闭">
      <ComponentDocsDemoBlock :code="basicCode">
        <Details v-bind="getDetailsProps()">
          <Details.Summary :as="Button">查看详情</Details.Summary>
          <p>点击外部关闭；点击内容区域保持展开。</p>
        </Details>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="自定义原生摘要">
      <ComponentDocsDemoBlock :code="customCode">
        <Details v-bind="getCustomProps()">
          <summary>自定义摘要</summary>
          <p>也可以使用原生 summary，保留原生鼠标和键盘交互。</p>
        </Details>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="程序控制与取消外部关闭">
      <ComponentDocsDemoBlock :code="controlledCode">
        <div class="details-demo-stack">
          <Details v-bind="getControlledProps()">
            <Details.Summary :as="Button">{{ open ? '收起' : '展开' }}</Details.Summary>
            <p>可以使用摘要或下面的按钮关闭。</p>
            <Button @click="setOpen(false)">关闭详情</Button>
          </Details>
          <Button data-keep-details-open>点击此按钮保持展开</Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="组合行为">
      <p>
        每个 Details 都需要一个 summary。Summary 与 Button 组合时直接渲染 summary，不嵌套 button。
      </p>
      <p>
        useDetails 的外部点击按最近的 details 元素判定，与 React 参考实现一致：点击内层 Details
        的内容也会被外层视为外部点击。需要保持外层展开时，可在外层的 onClickOutside 中取消关闭。
      </p>
      <p>
        Breadcrumbs 的折叠菜单独立组合 Details、IconButton、Tooltip 和 ActionList，提供 Escape
        关闭并恢复焦点。若触发器的 Tooltip 已展开，第一次 Escape 先关闭提示，下一次关闭菜单。 通用
        Details 保留原生披露行为。
      </p>
      <p>
        preventDefault() 也会取消该次点击的原生行为，例如链接跳转或另一个 Summary
        的开合；应仅对需要取消的点击调用。
      </p>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <h3>Details / Details.Summary</h3>
      <VisuallyHidden :id="`${documentationId}-component-api`">Details 组件 API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-component-api`"
        :columns="apiColumns"
        :data="componentRows"
      />
      <h3>useDetails</h3>
      <p>
        参数可为普通对象、响应式 Ref 或 getter；defaultOpen 在初始化时读取，其余选项支持响应式更新。
      </p>
      <VisuallyHidden :id="`${documentationId}-hook-api`">useDetails API</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="`${documentationId}-hook-api`"
        :columns="apiColumns"
        :data="hookRows"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.details-demo-stack {
  display: grid;
  gap: 12px;
  justify-items: start;
}
</style>
