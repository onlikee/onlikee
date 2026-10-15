<script setup lang="ts">
import { Tooltip, type TooltipDirection } from '@/components/primer-vue/Tooltip'
import { Button, IconButton } from '@/components/primer-vue/Button'
import { ActionMenu } from '@/components/primer-vue/ActionMenu'
import { ActionList } from '@/components/primer-vue/ActionList'
import { XIcon } from '@onlikee/octicons-vue'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const directions: TooltipDirection[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
const delays = ['short', 'medium', 'long'] as const
const trigger = { current: null as HTMLElement | null }
const imports =
  "import { Tooltip } from '@/components/primer-vue/Tooltip'\nimport { Button } from '@/components/primer-vue/Button'"
function example(body: string, extraImports = '') {
  return (
    '<script setup lang="ts">\n' +
    imports +
    extraImports +
    '\n<\/script>\n\n<template>\n' +
    body +
    '\n</template>'
  )
}
const basicCode = example(
  '  <Tooltip text="补充说明">\n    <Button>悬停或聚焦查看</Button>\n  </Tooltip>',
)
const directionsCode = example(
  directions
    .map(
      (direction) =>
        '  <Tooltip text="' +
        direction +
        ' 提示" direction="' +
        direction +
        '">\n    <Button>' +
        direction +
        '</Button>\n  </Tooltip>',
    )
    .join('\n'),
)
const typesCode = example(
  '  <Tooltip text="关闭" type="label">\n    <IconButton :icon="XIcon" aria-labelledby="close-tooltip" />\n  </Tooltip>\n  <Tooltip text="此操作无法撤销" direction="n">\n    <Button>删除</Button>\n  </Tooltip>',
  "\nimport { IconButton } from '@/components/primer-vue/Button'\nimport { XIcon } from '@onlikee/octicons-vue'",
).replace('text="关闭" type="label"', 'id="close-tooltip" text="关闭" type="label"')
const delayCode = example(
  delays
    .map(
      (delay) =>
        '  <Tooltip text="' +
        delay +
        ' 延迟" delay="' +
        delay +
        '">\n    <Button>' +
        delay +
        '</Button>\n  </Tooltip>',
    )
    .join('\n'),
)
const hintsCode = example(
  '  <Tooltip text="打开命令面板" :keybinding-hint="[\'Mod+K\', \'Mod+Shift+P\']">\n    <Button>命令面板</Button>\n  </Tooltip>',
)
const menuCode = example(
  '  <ActionMenu>\n    <ActionMenu.Anchor>\n      <Tooltip text="切换分支">\n        <Button>main</Button>\n      </Tooltip>\n    </ActionMenu.Anchor>\n    <ActionMenu.Overlay>\n      <ActionList>\n        <ActionList.Item>main</ActionList.Item>\n        <ActionList.Item>feature</ActionList.Item>\n      </ActionList>\n    </ActionMenu.Overlay>\n  </ActionMenu>',
  "\nimport { ActionMenu } from '@/components/primer-vue/ActionMenu'\nimport { ActionList } from '@/components/primer-vue/ActionList'",
)
const refCode =
  '<script setup lang="ts">\n' +
  imports +
  '\nconst trigger = { current: null as HTMLElement | null }\n<\/script>\n\n<template>\n  <Tooltip text="获取触发元素" :forwarded-ref="trigger">\n    <Button>触发元素</Button>\n  </Tooltip>\n</template>'
const apiCols: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '150px' },
  { key: 'type', label: '类型', minWidth: '240px', wrap: true },
  { key: 'default', label: '默认值', minWidth: '100px' },
  { key: 'description', label: '说明', minWidth: '240px', wrap: true },
]
const apiRows = [
  { name: 'text', type: 'string', default: '必填', description: '提示文字' },
  {
    name: 'direction',
    type: "'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'",
    default: "'s'",
    description: '首选方向，空间不足时重新定位',
  },
  {
    name: 'type',
    type: "'label' | 'description'",
    default: "'description'",
    description: '提供名称或补充描述',
  },
  {
    name: 'delay',
    type: "'short' | 'medium' | 'long'",
    default: "'short'",
    description: '鼠标延迟：50 / 400 / 1200ms；键盘焦点立即显示',
  },
  {
    name: 'keybindingHint',
    type: 'string | string[]',
    default: '[]',
    description: '快捷键，多个提示以 or 分隔',
  },
  { name: 'id', type: 'string', default: '自动生成', description: '用于关联触发元素与提示的 ID' },
  { name: 'className', type: 'string', default: '—', description: '提示节点的附加类名' },
  {
    name: 'forwardedRef',
    type: '{ current: HTMLElement | null } | ((element: HTMLElement | null) => void | (() => void))',
    default: '—',
    description: 'Vue 对应的 React forwardedRef；回调可以返回清理函数',
  },
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Tooltip 文字提示"
      description="为交互元素提供名称或补充描述，支持鼠标悬停、键盘焦点和快捷键提示。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description
        >使用 text 设置文字，默认 description 模式，方向为
        s（下方）。触发节点必须包含交互内容。</template
      >
      <ComponentDocsDemoBlock :code="basicCode"
        ><Tooltip text="补充说明"><Button>悬停或聚焦查看</Button></Tooltip></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="八个方向">
      <template #description
        >direction 指定首选方向。提示使用锚点定位，空间不足时调整方向。</template
      >
      <ComponentDocsDemoBlock :code="directionsCode"
        ><div class="demo-row">
          <Tooltip
            v-for="direction in directions"
            :key="direction"
            :text="direction + ' 提示'"
            :direction="direction"
            ><Button>{{ direction }}</Button></Tooltip
          >
        </div></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="名称与补充描述">
      <template #description
        >label 使用 aria-labelledby 提供名称；description 追加 aria-describedby。外层 Tooltip 会抑制
        IconButton 自带的重复提示。label 触发元素不要再设置 aria-label。</template
      >
      <ComponentDocsDemoBlock :code="typesCode"
        ><div class="demo-row">
          <Tooltip id="close-tooltip" text="关闭" type="label"
            ><IconButton :icon="XIcon" aria-labelledby="close-tooltip" /></Tooltip
          ><Tooltip text="此操作无法撤销" direction="n"><Button>删除</Button></Tooltip>
        </div></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="显示延迟">
      <template #description
        >鼠标悬停延迟分为 short（50ms）、medium（400ms）、long（1200ms）。键盘焦点仅在 focus-visible
        时立即显示；失焦或移出时关闭。</template
      >
      <ComponentDocsDemoBlock :code="delayCode"
        ><div class="demo-row">
          <Tooltip v-for="delay in delays" :key="delay" :text="delay + ' 延迟'" :delay="delay"
            ><Button>{{ delay }}</Button></Tooltip
          >
        </div></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="快捷键提示">
      <template #description
        >keybindingHint 支持一个或多个快捷键，并生成对应的无障碍文字。Mod 按当前平台显示。</template
      >
      <ComponentDocsDemoBlock :code="hintsCode"
        ><Tooltip text="打开命令面板" :keybinding-hint="['Mod+K', 'Mod+Shift+P']"
          ><Button>命令面板</Button></Tooltip
        ></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="与 ActionMenu 组合">
      <template #description
        >Tooltip 可以放在 ActionMenu.Anchor 内包裹 Button，菜单的 ARIA、ref
        和键盘事件传递到交互触发节点。</template
      >
      <ComponentDocsDemoBlock :code="menuCode"
        ><ActionMenu
          ><ActionMenu.Anchor
            ><Tooltip text="切换分支"><Button>main</Button></Tooltip></ActionMenu.Anchor
          ><ActionMenu.Overlay
            ><ActionList
              ><ActionList.Item>main</ActionList.Item
              ><ActionList.Item>feature</ActionList.Item></ActionList
            ></ActionMenu.Overlay
          ></ActionMenu
        ></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="触发节点与 ref">
      <template #description
        >默认插槽只允许一个原始元素 VNode，不过滤注释、不展开结构性
        Fragment。文本或多个节点会报错；Fragment
        会警告并原样返回。自定义组件需要将属性传到交互元素，并暴露 element 或具有单一 HTML
        根节点。</template
      >
      <p>
        组件实例的 .element 指向触发 DOM。forwardedRef 使用 current
        对象或回调。primer_react_merged_forwarded_refs 开启时合并所有 ref；关闭时对外 forwardedRef
        优先于子节点 ref。卸载时清空对象或执行回调清理。
      </p>
      <ComponentDocsDemoBlock :code="refCode"
        ><Tooltip text="获取触发元素" :forwarded-ref="trigger"
          ><Button>触发元素</Button></Tooltip
        ></ComponentDocsDemoBlock
      >
    </ComponentDocsSection>
    <ComponentDocsSection title="API" variant="api">
      <Table :columns="apiCols" :data="apiRows" row-key="name" compact :hoverable="false" />
      <p>
        HTML 属性传到提示节点；关联触发节点的属性由 Tooltip 注入。_privateDisableTooltip
        是内部接口，用于菜单等组合场景，不作为通用 disabled 属性使用。
      </p>
      <p>模块入口导出 Tooltip、TooltipProps 和 TooltipDirection。默认插槽承载唯一的触发元素。</p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.demo-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
