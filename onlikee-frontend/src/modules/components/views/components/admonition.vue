<script setup lang="ts">
import { useId as useDocumentationId } from 'vue'
import { Admonition } from '@/components/primer-vue/Admonition'
import { Link } from '@/components/primer-vue/Link'
import { VisuallyHidden } from '@/components/primer-vue/VisuallyHidden'
import ComponentDocsTable, {
  type DocumentationColumn,
} from '@/modules/components/components/ComponentDocsPage/ComponentDocsTable.vue'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const documentationId = useDocumentationId()
const basicCode = `<script setup lang="ts">
import { Admonition } from '@/components/primer-vue/Admonition'
<\/script>

<template>
  <Admonition type="info" title="开始之前" type-label="提示">
    请先阅读项目说明，再修改配置。
  </Admonition>
</template>`
const variantsCode = `<Admonition type="info" title="提示" type-label="提示">配置会应用到当前项目。</Admonition>
<Admonition type="warning" title="请先备份" type-label="警告">迁移前请导出当前配置。</Admonition>
<Admonition type="critical" title="不可恢复" type-label="重要">删除项目后，相关数据将无法恢复。</Admonition>
<Admonition type="success" title="已就绪" type-label="成功">环境检查已通过，可以继续部署。</Admonition>
<Admonition type="unavailable" title="暂不可用" type-label="不可用">服务正在维护，请稍后重试。</Admonition>
<Admonition type="upsell" title="推荐" type-label="推荐">团队版支持共享项目配置。</Admonition>`
const richCode = `<script setup lang="ts">
import { Admonition } from '@/components/primer-vue/Admonition'
import { Link } from '@/components/primer-vue/Link'
<\/script>

<template>
  <Admonition type="warning" title-as="h3" type-label="警告">
    <template #title>更新 <code>config.yaml</code> 之前</template>
    <p>新的配置格式会影响所有环境，请按以下步骤迁移。</p>
    <ul>
      <li>备份当前文件，并检查环境变量。</li>
      <li>在测试环境中确认配置生效。</li>
    </ul>
    <p><Link href="https://primer.style/" inline>阅读迁移说明</Link></p>
  </Admonition>
</template>`
const nestedCode = `<Admonition type="warning" type-label="警告">
  <p>迁移前请检查下列事项。</p>
  <Admonition type="success" title="备份已完成" type-label="成功">
    当前配置已经导出，可以继续迁移。
  </Admonition>
</Admonition>`
const longTitle = 'configuration_for_the_production_environment_without_spaces_2026_10_30'
const longCode = `<div style="max-width: 24rem">
  <Admonition title="configuration_for_the_production_environment_without_spaces_2026_10_30" type-label="提示">
    <p>很长的标题和正文会在可用宽度内换行。</p>
    <pre tabindex="0" aria-label="配置示例"><code>CONFIGURATION_PATH=/workspace/projects/production/configuration/environment.yaml</code></pre>
  </Admonition>
</div>`
const propsColumns: DocumentationColumn[] = [
  { field: 'name', header: '属性名', rowHeader: true, minWidth: '140px' },
  { field: 'type', header: '类型', minWidth: '200px' },
  { field: 'default', header: '默认值', minWidth: '120px' },
  { field: 'description', header: '说明', minWidth: '260px' },
]
const propsRows = [
  {
    id: 'type',
    name: 'type',
    type: 'info | warning | critical | success | unavailable | upsell',
    default: 'info',
    description: '同时决定语义图标、强调色、边框和背景。',
  },
  {
    id: 'title',
    name: 'title',
    type: 'string',
    default: '—',
    description: '可选的可见标题；title 插槽优先。此属性用于标题内容，不会透传为原生 title。',
  },
  {
    id: 'titleAs',
    name: 'titleAs',
    type: 'div | h1 | h2 | h3 | h4 | h5 | h6',
    default: 'div',
    description: '标题元素。需要加入页面标题层级时，显式选择恰当的 h1–h6。',
  },
  {
    id: 'typeLabel',
    name: 'typeLabel',
    type: 'string',
    default: '按 type 设置英文说明',
    description:
      '向读屏用户说明类型。默认依次为 Information、Warning、Critical、Success、Unavailable、Recommendation。可传本地化文本；正文已清楚表达类型时可传空字符串。',
  },
  {
    id: 'className',
    name: 'className',
    type: 'string',
    default: '—',
    description: '与 Vue class 合并到根 div。',
  },
  {
    id: 'native',
    name: '原生属性',
    type: 'HTMLAttributes',
    default: 'role="note"',
    description:
      'id、dir、style、ARIA、data-* 和原生事件透传到根 div。data-component 和 data-type 由组件设置。',
  },
]
const slotsColumns: DocumentationColumn[] = [
  { field: 'name', header: '插槽名', rowHeader: true, minWidth: '140px' },
  { field: 'description', header: '说明', minWidth: '300px' },
]
const slotsRows = [
  {
    id: 'default',
    name: 'default',
    description: '正文。支持段落、列表、代码、Link 等 Vue 内容；组件不解析 Markdown。',
  },
  {
    id: 'title',
    name: 'title',
    description: '富文本标题，覆盖 title 属性。使用行内内容，避免在标题中嵌入另一个标题元素。',
  },
]
const refRows = [
  {
    id: 'element',
    name: 'element',
    description: '根 HTMLDivElement，挂载前为 null；通过组件模板 ref 访问。',
  },
]
const refColumns: DocumentationColumn[] = [
  { field: 'name', header: '成员', rowHeader: true, minWidth: '140px' },
  { field: 'description', header: '说明', minWidth: '300px' },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Admonition 提示块"
      description="在文档和页面正文中突出补充说明、建议与风险。内容随页面保留，适合需要认真阅读的静态信息。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description>
        标题可选。默认使用 note
        语义，不自动播报或移动焦点；图标与可本地化的类型说明共同传达信息类型。
      </template>
      <ComponentDocsDemoBlock :code="basicCode">
        <Admonition title="开始之前" type-label="提示">请先阅读项目说明，再修改配置。</Admonition>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="语义变体">
      <template #description>
        提供六种类型。unavailable 使用中性色表示服务中断、功能暂不可用或体验降级。
        根据内容选择类型，并在标题或正文中说明具体原因和下一步操作。避免只靠颜色表达含义。
      </template>
      <ComponentDocsDemoBlock :code="variantsCode">
        <div class="admonition-demo-stack">
          <Admonition type="info" title="提示" type-label="提示">配置会应用到当前项目。</Admonition>
          <Admonition type="warning" title="请先备份" type-label="警告"
            >迁移前请导出当前配置。</Admonition
          >
          <Admonition type="critical" title="不可恢复" type-label="重要"
            >删除项目后，相关数据将无法恢复。</Admonition
          >
          <Admonition type="success" title="已就绪" type-label="成功"
            >环境检查已通过，可以继续部署。</Admonition
          >
          <Admonition type="unavailable" title="暂不可用" type-label="不可用"
            >服务正在维护，请稍后重试。</Admonition
          >
          <Admonition type="upsell" title="推荐" type-label="推荐"
            >团队版支持共享项目配置。</Admonition
          >
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="标题层级与富文本">
      <template #description>
        使用 title 插槽加入行内代码；titleAs 只改变标题语义，视觉字号保持一致。 链接使用现有 Link
        组件，键盘顺序保持正文中的自然顺序。
      </template>
      <ComponentDocsDemoBlock :code="richCode">
        <Admonition type="warning" title-as="h3" type-label="警告">
          <template #title>更新 <code>config.yaml</code> 之前</template>
          <p>新的配置格式会影响所有环境，请按以下步骤迁移。</p>
          <ul>
            <li>备份当前文件，并检查环境变量。</li>
            <li>在测试环境中确认配置生效。</li>
          </ul>
          <p><Link href="https://primer.style/" inline>阅读迁移说明</Link></p>
        </Admonition>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="内容组合">
      <template #description>
        嵌套提示块各自管理语义色和排版。通常优先用段落或列表组织信息，仅在确实需要不同语义时嵌套。
      </template>
      <ComponentDocsDemoBlock :code="nestedCode">
        <Admonition type="warning" type-label="警告">
          <p>迁移前请检查下列事项。</p>
          <Admonition type="success" title="备份已完成" type-label="成功">
            当前配置已经导出，可以继续迁移。
          </Admonition>
        </Admonition>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="窄容器与长内容">
      <template #description>
        标题和正文支持长单词换行。需要保持格式的代码在代码块内部滚动，为可滚动区域提供键盘入口与名称。
        边框和内容布局随 dir 自动适配 RTL。
      </template>
      <ComponentDocsDemoBlock :code="longCode">
        <div class="admonition-demo-narrow">
          <Admonition :title="longTitle" type-label="提示">
            <p>很长的标题和正文会在可用宽度内换行。</p>
            <pre
              tabindex="0"
              aria-label="配置示例"
            ><code>CONFIGURATION_PATH=/workspace/projects/production/configuration/environment.yaml</code></pre>
          </Admonition>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="使用建议">
      <ul>
        <li>标题概括重点，正文解释原因、影响以及下一步操作。</li>
        <li>操作结果附近的简短反馈使用 InlineMessage，页面级重要通知使用 Banner。</li>
        <li>
          根据界面语言提供 typeLabel；信息类型已被正文清楚表达时，可以设置为空字符串避免重复。
        </li>
        <li>Admonition 不解析 Markdown；需要展示 Markdown 时，由调用方完成解析与安全处理。</li>
        <li>需要自定义可访问名称时，通过 aria-label 或 aria-labelledby 设置。</li>
      </ul>
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <h4>Props</h4>
      <VisuallyHidden :id="documentationId + '-props'">Admonition 属性</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="documentationId + '-props'"
        :columns="propsColumns"
        :data="propsRows"
      />
      <h4>Slots</h4>
      <VisuallyHidden :id="documentationId + '-slots'">Admonition 插槽</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="documentationId + '-slots'"
        :columns="slotsColumns"
        :data="slotsRows"
      />
      <h4>Ref</h4>
      <VisuallyHidden :id="documentationId + '-ref'">Admonition 实例</VisuallyHidden>
      <ComponentDocsTable
        :aria-labelledby="documentationId + '-ref'"
        :columns="refColumns"
        :data="refRows"
      />
      <p>入口导出 Admonition（默认与具名）、AdmonitionProps 和 AdmonitionType。</p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.admonition-demo-stack {
  display: grid;
  gap: var(--base-size-12);
  inline-size: 100%;
  min-inline-size: 0;
}

.admonition-demo-narrow {
  inline-size: 100%;
  max-inline-size: 24rem;
  min-inline-size: 0;
}
</style>
