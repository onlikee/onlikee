<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="Button 按钮"
      description="用于触发操作、提交表单，以及在文本前后承载轻量视觉元素。"
    />

    <ComponentDocsSection title="基础用法">
      <template #description>
        使用默认插槽承载按钮文案。<code>Button</code> 默认渲染为
        <code>type=&quot;button&quot;</code> 的原生按钮。
      </template>

      <ComponentDocsDemoBlock :code="basicDemoCode">
        <div class="button-row">
          <Button>保存更改</Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="不同变体">
      <template #description>
        通过
        <code>variant</code> 调整按钮的视觉强调层级，覆盖默认、主操作、危险操作、透明和链接样式。
      </template>

      <ComponentDocsDemoBlock :code="variantDemoCode">
        <div class="button-row">
          <Button variant="default"> Default </Button>
          <Button variant="primary"> Primary </Button>
          <Button variant="danger"> Danger </Button>
          <Button variant="invisible"> Invisible </Button>
          <Button variant="link"> Link </Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="不同尺寸">
      <template #description>
        使用 <code>size</code> 控制按钮高度与内边距，适配紧凑、默认和更高强调度的操作场景。
      </template>

      <ComponentDocsDemoBlock :code="sizeDemoCode">
        <div class="button-row button-row--align-end">
          <Button size="small"> Small </Button>
          <Button size="medium"> Medium </Button>
          <Button size="large"> Large </Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="状态">
      <template #description>
        设置
        <code>loading</code> 时保留焦点并移除点击回调；有视觉元素时替换相应视觉，否则隐藏文案并显示
        spinner。设置 <code>disabled</code> 时保留禁用态样式。
      </template>

      <ComponentDocsDemoBlock :code="stateDemoCode">
        <div class="button-row">
          <Button loading> Saving </Button>
          <Button variant="primary" loading> Publishing </Button>
          <Button disabled> Disabled </Button>
          <Button variant="danger" disabled> Disabled Danger </Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="前后视觉元素">
      <template #description>
        通过 <code>leadingVisual</code> 和
        <code>trailingVisual</code>
        属性传入组件或 VNode，在按钮文案前后显示。默认插槽承载文案；需要自定义图标参数时，可传入
        <code>h()</code> 创建的 VNode。
      </template>

      <ComponentDocsDemoBlock :code="visualDemoCode">
        <div class="button-row">
          <Button :leading-visual="BellIcon"> 通知设置 </Button>
          <Button variant="primary" :trailing-visual="ArrowUpRightIcon"> 继续前往 </Button>
          <Button variant="invisible" :leading-visual="SearchIcon" :trailing-visual="CheckIcon">
            搜索项目
          </Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="图标颜色与变体">
      <template #description>
        前后图标使用相同的颜色规则。默认按钮的图标使用弱化色，与文字区分；其他变体使用对应颜色。悬停或按下按钮可查看交互态。
      </template>

      <ComponentDocsDemoBlock :code="visualVariantDemoCode">
        <div class="button-row">
          <Button variant="default" :leading-visual="BellIcon" :trailing-visual="ArrowUpRightIcon">
            Default
          </Button>
          <Button variant="primary" :leading-visual="BellIcon" :trailing-visual="ArrowUpRightIcon">
            Primary
          </Button>
          <Button variant="danger" :leading-visual="BellIcon" :trailing-visual="ArrowUpRightIcon">
            Danger
          </Button>
          <Button
            variant="invisible"
            :leading-visual="BellIcon"
            :trailing-visual="ArrowUpRightIcon"
          >
            Invisible
          </Button>
          <Button variant="link" :leading-visual="BellIcon" :trailing-visual="ArrowUpRightIcon">
            Link
          </Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="带图标的禁用与加载状态">
      <template #description>
        禁用时，前后图标跟随按钮的禁用文字颜色；加载时优先替换前置图标，文案和其他视觉元素继续显示。
      </template>

      <ComponentDocsDemoBlock :code="visualStateDemoCode">
        <div class="button-type-demo">
          <div class="button-row">
            <Button
              variant="default"
              :leading-visual="BellIcon"
              :trailing-visual="ArrowUpRightIcon"
              disabled
            >
              Default
            </Button>
            <Button
              variant="primary"
              :leading-visual="BellIcon"
              :trailing-visual="ArrowUpRightIcon"
              disabled
            >
              Primary
            </Button>
            <Button
              variant="danger"
              :leading-visual="BellIcon"
              :trailing-visual="ArrowUpRightIcon"
              disabled
            >
              Danger
            </Button>
            <Button
              variant="invisible"
              :leading-visual="BellIcon"
              :trailing-visual="ArrowUpRightIcon"
              disabled
            >
              Invisible
            </Button>
            <Button
              variant="link"
              :leading-visual="BellIcon"
              :trailing-visual="ArrowUpRightIcon"
              disabled
            >
              Link
            </Button>
          </div>
          <div class="button-row">
            <Button
              variant="default"
              :leading-visual="BellIcon"
              :trailing-visual="ArrowUpRightIcon"
              loading
            >
              Default
            </Button>
            <Button
              variant="primary"
              :leading-visual="BellIcon"
              :trailing-visual="ArrowUpRightIcon"
              loading
            >
              Primary
            </Button>
            <Button
              variant="danger"
              :leading-visual="BellIcon"
              :trailing-visual="ArrowUpRightIcon"
              loading
            >
              Danger
            </Button>
            <Button
              variant="invisible"
              :leading-visual="BellIcon"
              :trailing-visual="ArrowUpRightIcon"
              loading
            >
              Invisible
            </Button>
            <Button
              variant="link"
              :leading-visual="BellIcon"
              :trailing-visual="ArrowUpRightIcon"
              loading
            >
              Link
            </Button>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="原生按钮类型">
      <template #description>
        通过 <code>type</code> 透传原生按钮类型，在表单中分别用于普通操作、提交和重置。
      </template>

      <ComponentDocsDemoBlock :code="typeDemoCode">
        <div class="button-type-demo">
          <div class="button-row">
            <Button type="button"> 普通操作 </Button>
            <Button type="submit" variant="primary"> 提交表单 </Button>
            <Button type="reset" variant="invisible"> 重置输入 </Button>
          </div>
          <p class="button-note">
            默认值为 <code>button</code>，在表单上下文中可直接切换为 <code>submit</code> 或
            <code>reset</code>。
          </p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="内容布局与计数">
      <template #description>
        alignContent 控制内容对齐，block 填满容器，labelWrap 允许文案换行。count
        支持数字和字符串；trailingVisual 优先于计数。 inactive 仅改变外观，保留点击和键盘操作。
      </template>
      <ComponentDocsDemoBlock :code="layoutDemoCode">
        <div class="button-type-demo">
          <Button :leading-visual="BellIcon" :count="0">通知</Button>
          <Button :leading-visual="BellIcon" :count="8" align-content="start" block>收件箱</Button>
          <Button :trailing-action="ArrowUpRightIcon">更多操作</Button>
          <Button label-wrap style="max-width: 180px">这是一段可以换行的较长按钮文案</Button>
          <Button inactive>暂不可用的外观</Button>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="通知标记">
      <template #description>
        notificationIndicator 支持按钮边界、前置视觉或图标位置；前置视觉位置需要 leadingVisual。
        使用可访问名称或描述说明标记含义。
      </template>
      <ComponentDocsDemoBlock :code="notificationDemoCode">
        <div class="button-row">
          <Button notification-indicator="button" aria-label="通知，有新消息">通知</Button>
          <Button
            :leading-visual="BellIcon"
            notification-indicator="leadingVisual"
            aria-label="收件箱，有新消息"
            >收件箱</Button
          >
          <IconButton :icon="BellIcon" notification-indicator="icon" aria-label="通知，有新消息" />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="IconButton 图标按钮">
      <template #description>
        icon 必填，aria-label 与 aria-labelledby 二选一。默认 Tooltip 用作标签；description
        提供描述。 外部 Tooltip、disabled 或 unsafeDisableTooltip 会关闭内部 Tooltip；keybindingHint
        支持一个或多个快捷键提示。
      </template>
      <ComponentDocsDemoBlock :code="iconDemoCode">
        <div class="button-row">
          <IconButton :icon="SearchIcon" aria-label="搜索" keybinding-hint="Mod+K" />
          <IconButton
            :icon="BellIcon"
            aria-label="通知"
            description="查看全部通知"
            tooltip-direction="n"
          />
          <IconButton :icon="CheckIcon" aria-label="确认" unsafe-disable-tooltip />
          <IconButton :icon="SearchIcon" aria-label="正在搜索" loading />
          <IconButton :icon="BellIcon" aria-label="通知" disabled />
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="Tooltip 与快捷键提示">
      <template #description>
        Button 可将 <code>KeybindingHint</code> 作为尾随视觉；IconButton 的
        <code>keybindingHint</code> 可传单个快捷键或数组。description 模式会保留按钮名称；外部
        Tooltip 会关闭 IconButton 的内部 Tooltip。
      </template>
      <ComponentDocsDemoBlock :code="keybindingDemoCode">
        <div class="button-row">
          <Button :trailing-visual="saveKeybinding">保存</Button>
          <IconButton :icon="SearchIcon" aria-label="搜索" keybinding-hint="Mod+K" />
          <IconButton
            :icon="BellIcon"
            aria-label="通知"
            description="查看通知"
            :keybinding-hint="['Mod+N', 'Mod+Shift+N']"
          />
          <Tooltip text="打开通知">
            <IconButton :icon="BellIcon" aria-label="打开通知" />
          </Tooltip>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="交互状态与加载播报">
      <template #description>
        <code>inactive</code> 保留操作能力，可与说明 Tooltip 组合；<code>aria-expanded</code>
        控制展开外观。加载状态可由外部状态切换，并用 <code>loadingAnnouncement</code> 设置播报文本。
      </template>
      <ComponentDocsDemoBlock :code="interactionDemoCode">
        <div class="button-type-demo">
          <div class="button-row">
            <Button
              :loading="isSaving"
              loading-announcement="正在保存更改"
              @click="isSaving = true"
            >
              保存更改
            </Button>
            <button type="button" @click="isSaving = false">结束加载</button>
            <Tooltip text="服务暂不可用，请稍后重试">
              <Button inactive>暂不可用</Button>
            </Tooltip>
            <Button aria-expanded="true">已展开</Button>
          </div>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="LinkButton 与 ButtonBase">
      <template #description>
        LinkButton 默认渲染 a，透传 href、target 等原生链接属性；variant=link 只决定视觉样式。
        ButtonBase 提供共享布局与状态，默认渲染 button，但不设置 type；表单中按需显式指定。 as
        支持元素标签和 Vue 组件。组件引用通过 element 访问真实元素，并提供 focus 与 blur。
      </template>
      <ComponentDocsDemoBlock :code="linkDemoCode">
        <div class="button-row">
          <LinkButton href="#" :trailing-visual="ArrowUpRightIcon">查看详情</LinkButton>
          <LinkButton href="#" variant="primary">主要链接操作</LinkButton>
          <LinkButton href="#" variant="danger">危险链接操作</LinkButton>
          <LinkButton href="#" variant="link">文本样式链接</LinkButton>
          <LinkButton href="#" size="small">小尺寸链接</LinkButton>
          <LinkButton href="#" loading loading-announcement="正在打开链接">加载中的链接</LinkButton>
          <ButtonBase type="button" :leading-visual="CheckIcon">基础按钮</ButtonBase>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>

    <ComponentDocsSection title="API" variant="api">
      <h3>属性</h3>
      <Table
        :columns="apiTableColumns"
        :data="apiTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />

      <h3>插槽</h3>
      <Table
        :columns="contentTableColumns"
        :data="contentTableRows"
        row-key="name"
        compact
        :hoverable="false"
      />
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { Button, IconButton, LinkButton, ButtonBase } from '@/components/primer-vue/Button'
import { BellIcon, ArrowUpRightIcon, SearchIcon, CheckIcon } from '@onlikee/octicons-vue'
import { KeybindingHint } from '@/components/primer-vue/KeybindingHint'
import { Tooltip } from '@/components/primer-vue/Tooltip'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const saveKeybinding = h(KeybindingHint, { keys: 'Mod+S' })
const isSaving = ref(false)

const basicDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
<\/script>

<template>
  <Button>保存更改</Button>
</template>`

const variantDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
<\/script>

<template>
  <div class="button-row">
    <Button variant="default">Default</Button>
    <Button variant="primary">Primary</Button>
    <Button variant="danger">Danger</Button>
    <Button variant="invisible">Invisible</Button>
    <Button variant="link">Link</Button>
  </div>
</template>

<style scoped>
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
</style>`

const sizeDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
<\/script>

<template>
  <div class="button-row button-row--align-end">
    <Button size="small">Small</Button>
    <Button size="medium">Medium</Button>
    <Button size="large">Large</Button>
  </div>
</template>

<style scoped>
.button-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}
</style>`

const stateDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
<\/script>

<template>
  <div class="button-row">
    <Button loading>Saving</Button>
    <Button variant="primary" loading>Publishing</Button>
    <Button disabled>Disabled</Button>
    <Button variant="danger" disabled>Disabled Danger</Button>
  </div>
</template>

<style scoped>
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
</style>`

const visualDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
import { BellIcon, ArrowUpRightIcon, SearchIcon, CheckIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <div class="button-row">
    <Button :leading-visual="BellIcon">
      通知设置
    </Button>

    <Button
      variant="primary"
      :trailing-visual="ArrowUpRightIcon"
    >
      继续前往
    </Button>

    <Button
      variant="invisible"
      :leading-visual="SearchIcon"
      :trailing-visual="CheckIcon"
    >
      搜索项目
    </Button>
  </div>
</template>

<style scoped>
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
</style>`

const visualVariantDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
import { BellIcon, ArrowUpRightIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <div class="button-row">
    <Button
      variant="default"
      :leading-visual="BellIcon"
      :trailing-visual="ArrowUpRightIcon"
    >
      Default
    </Button>
    <Button
      variant="primary"
      :leading-visual="BellIcon"
      :trailing-visual="ArrowUpRightIcon"
    >
      Primary
    </Button>
    <Button
      variant="danger"
      :leading-visual="BellIcon"
      :trailing-visual="ArrowUpRightIcon"
    >
      Danger
    </Button>
    <Button
      variant="invisible"
      :leading-visual="BellIcon"
      :trailing-visual="ArrowUpRightIcon"
    >
      Invisible
    </Button>
    <Button
      variant="link"
      :leading-visual="BellIcon"
      :trailing-visual="ArrowUpRightIcon"
    >
      Link
    </Button>
  </div>
</template>

<style scoped>
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
</style>`

const visualStateDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
import { BellIcon, ArrowUpRightIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <div class="button-states">
    <div class="button-row">
      <Button
        variant="default"
        :leading-visual="BellIcon"
        :trailing-visual="ArrowUpRightIcon"
        disabled
      >
        Default
      </Button>
      <Button
        variant="primary"
        :leading-visual="BellIcon"
        :trailing-visual="ArrowUpRightIcon"
        disabled
      >
        Primary
      </Button>
      <Button
        variant="danger"
        :leading-visual="BellIcon"
        :trailing-visual="ArrowUpRightIcon"
        disabled
      >
        Danger
      </Button>
      <Button
        variant="invisible"
        :leading-visual="BellIcon"
        :trailing-visual="ArrowUpRightIcon"
        disabled
      >
        Invisible
      </Button>
      <Button
        variant="link"
        :leading-visual="BellIcon"
        :trailing-visual="ArrowUpRightIcon"
        disabled
      >
        Link
      </Button>
    </div>
    <div class="button-row">
      <Button
        variant="default"
        :leading-visual="BellIcon"
        :trailing-visual="ArrowUpRightIcon"
        loading
      >
        Default
      </Button>
      <Button
        variant="primary"
        :leading-visual="BellIcon"
        :trailing-visual="ArrowUpRightIcon"
        loading
      >
        Primary
      </Button>
      <Button
        variant="danger"
        :leading-visual="BellIcon"
        :trailing-visual="ArrowUpRightIcon"
        loading
      >
        Danger
      </Button>
      <Button
        variant="invisible"
        :leading-visual="BellIcon"
        :trailing-visual="ArrowUpRightIcon"
        loading
      >
        Invisible
      </Button>
      <Button
        variant="link"
        :leading-visual="BellIcon"
        :trailing-visual="ArrowUpRightIcon"
        loading
      >
        Link
      </Button>
    </div>
  </div>
</template>

<style scoped>
.button-states {
  display: grid;
  gap: 0.75rem;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
</style>`

const typeDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
<\/script>

<template>
  <div class="button-type-demo">
    <div class="button-row">
      <Button type="button">普通操作</Button>
      <Button type="submit" variant="primary">提交表单</Button>
      <Button type="reset" variant="invisible">重置输入</Button>
    </div>
    <p class="button-note">
      默认值为 button，在表单上下文中可直接切换为 submit 或 reset。
    </p>
  </div>
</template>

<style scoped>
.button-type-demo {
  display: grid;
  gap: 0.75rem;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.button-note {
  margin: 0;
  color: var(--fgColor-muted);
  font-size: 0.875rem;
}
</style>`

const layoutDemoCode = `<script setup lang="ts">
import { Button } from '@/components/primer-vue/Button'
import { BellIcon, ArrowUpRightIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <Button :leading-visual="BellIcon" :count="0">通知</Button>
  <Button :leading-visual="BellIcon" :count="8" align-content="start" block>收件箱</Button>
  <Button :trailing-action="ArrowUpRightIcon">更多操作</Button>
  <Button label-wrap style="max-width: 180px">这是一段可以换行的较长按钮文案</Button>
  <Button inactive>暂不可用的外观</Button>
</template>`

const notificationDemoCode = `<script setup lang="ts">
import { Button, IconButton } from '@/components/primer-vue/Button'
import { BellIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <Button notification-indicator="button" aria-label="通知，有新消息">通知</Button>
  <Button :leading-visual="BellIcon" notification-indicator="leadingVisual" aria-label="收件箱，有新消息">收件箱</Button>
  <IconButton :icon="BellIcon" notification-indicator="icon" aria-label="通知，有新消息" />
</template>`

const iconDemoCode = `<script setup lang="ts">
import { IconButton } from '@/components/primer-vue/Button'
import { SearchIcon, BellIcon, CheckIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <IconButton :icon="SearchIcon" aria-label="搜索" keybinding-hint="Mod+K" />
  <IconButton :icon="BellIcon" aria-label="通知" description="查看全部通知" tooltip-direction="n" />
  <IconButton :icon="CheckIcon" aria-label="确认" unsafe-disable-tooltip />
  <IconButton :icon="SearchIcon" aria-label="正在搜索" loading />
  <IconButton :icon="BellIcon" aria-label="通知" disabled />
</template>`

const keybindingDemoCode = `<script setup lang="ts">
import { h } from 'vue'
import { Button, IconButton } from '@/components/primer-vue/Button'
import { KeybindingHint } from '@/components/primer-vue/KeybindingHint'
import { Tooltip } from '@/components/primer-vue/Tooltip'
import { BellIcon, SearchIcon } from '@onlikee/octicons-vue'

const saveKeybinding = h(KeybindingHint, { keys: 'Mod+S' })
<\\/script>

<template>
  <Button :trailing-visual="saveKeybinding">保存</Button>
  <IconButton :icon="SearchIcon" aria-label="搜索" keybinding-hint="Mod+K" />
  <IconButton
    :icon="BellIcon"
    aria-label="通知"
    description="查看通知"
    :keybinding-hint="['Mod+N', 'Mod+Shift+N']"
  />
  <Tooltip text="打开通知">
    <IconButton :icon="BellIcon" aria-label="打开通知" />
  </Tooltip>
</template>`

const interactionDemoCode = `<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/primer-vue/Button'
import { Tooltip } from '@/components/primer-vue/Tooltip'

const isSaving = ref(false)
<\\/script>

<template>
  <Button :loading="isSaving" loading-announcement="正在保存更改" @click="isSaving = true">
    保存更改
  </Button>
  <button type="button" @click="isSaving = false">结束加载</button>
  <Tooltip text="服务暂不可用，请稍后重试">
    <Button inactive>暂不可用</Button>
  </Tooltip>
  <Button aria-expanded="true">已展开</Button>
</template>`

const linkDemoCode = `<script setup lang="ts">
import { LinkButton, ButtonBase } from '@/components/primer-vue/Button'
import { ArrowUpRightIcon, CheckIcon } from '@onlikee/octicons-vue'
<\/script>

<template>
  <LinkButton href="#" :trailing-visual="ArrowUpRightIcon">查看详情</LinkButton>
  <LinkButton href="#" variant="primary">主要链接操作</LinkButton>
  <LinkButton href="#" variant="danger">危险链接操作</LinkButton>
  <LinkButton href="#" variant="link">文本样式链接</LinkButton>
  <LinkButton href="#" size="small">小尺寸链接</LinkButton>
  <LinkButton href="#" loading loading-announcement="正在打开链接">加载中的链接</LinkButton>
  <ButtonBase type="button" :leading-visual="CheckIcon">基础按钮</ButtonBase>
</template>`

const apiTableColumns: TableColumn[] = [
  { key: 'name', label: '属性名', rowHeader: true, minWidth: '140px' },
  { key: 'default', label: '默认值', minWidth: '120px' },
  { key: 'type', label: '类型', minWidth: '200px', wrap: true },
  { key: 'options', label: '可选值', minWidth: '240px', wrap: true },
  { key: 'description', label: '说明', minWidth: '220px', wrap: true },
]

const apiTableRows = [
  {
    name: 'as',
    type: 'string | Component',
    default: "'button' / LinkButton: 'a'",
    options: '—',
    description:
      "渲染原生标签或 Vue 组件。Vue 的 h() 接受开放的原生 props 字典；在 TypeScript 中用 h() 组合多态组件时，请先将 props 对象标注为 ButtonProps<'a'> 或 ButtonProps<typeof C>。ButtonBase、IconButton 和 LinkButton 使用各自的多态 props 类型。",
  },
  { name: 'block', type: 'boolean', default: 'false', options: '—', description: '填满容器宽度。' },
  {
    name: 'alignContent',
    type: "'start' | 'center'",
    default: "'center'",
    options: '—',
    description: '视觉元素与内容的对齐。',
  },
  {
    name: 'count',
    type: 'number | string',
    default: 'undefined',
    options: '—',
    description: '计数徽标；trailingVisual 存在时不显示。',
  },
  {
    name: 'trailingAction',
    type: 'Component | string | null',
    default: 'undefined',
    options: '—',
    description: '位于内容区域之外的末尾动作视觉。',
  },
  {
    name: 'icon',
    type: 'Component | VNode | string | null',
    default: 'undefined',
    options: '—',
    description: 'Button 的独立图标内容；图标按钮布局使用 IconButton。',
  },
  {
    name: 'loadingAnnouncement',
    type: 'string',
    default: "'Loading'",
    options: '—',
    description: '加载状态的辅助技术播报。',
  },
  {
    name: 'inactive',
    type: 'boolean',
    default: 'undefined',
    options: '—',
    description: '仅呈现不可用外观，保留交互。',
  },
  {
    name: 'labelWrap',
    type: 'boolean',
    default: 'undefined',
    options: '—',
    description: '允许文案换行。',
  },
  {
    name: 'notificationIndicator',
    type: "'button' | 'leadingVisual'",
    default: 'undefined',
    options: '—',
    description: 'Button / LinkButton 的通知标记位置。',
  },
  {
    name: 'className / id',
    type: 'string',
    default: 'undefined',
    options: '—',
    description: '附加样式类与元素 ID；也可使用原生 class/style。',
  },
  {
    name: 'IconButton.icon',
    type: 'Component | string',
    default: '必填',
    options: '—',
    description: '图标组件或元素标签。',
  },
  {
    name: 'IconButton.aria-label / aria-labelledby',
    type: 'string',
    default: '二选一',
    options: '—',
    description: '图标按钮的可访问名称。',
  },
  {
    name: 'IconButton.notificationIndicator',
    type: "'button' | 'icon'",
    default: 'undefined',
    options: '—',
    description: '图标按钮的通知标记位置。',
  },
  {
    name: 'IconButton.description',
    type: 'string',
    default: 'undefined',
    options: '—',
    description: 'Tooltip 描述，独立于可访问名称。',
  },
  {
    name: 'IconButton.tooltipDirection',
    type: "'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'",
    default: "'s'",
    options: '—',
    description: 'Tooltip 方向。',
  },
  {
    name: 'IconButton.unsafeDisableTooltip',
    type: 'boolean',
    default: 'false',
    options: '—',
    description: '关闭内部 Tooltip。',
  },
  {
    name: 'IconButton.keybindingHint',
    type: 'string | string[]',
    default: 'undefined',
    options: '—',
    description: 'Tooltip 内的快捷键提示。',
  },
  {
    name: 'IconButton.keyshortcuts',
    type: 'string',
    default: 'undefined',
    options: '—',
    description: '已弃用；传入时设置 aria-keyshortcuts，提示优先使用 keybindingHint。',
  },
  {
    name: 'LinkButton 原生属性',
    type: 'AnchorHTMLAttributes & ButtonHTMLAttributes',
    default: 'undefined',
    options: '—',
    description:
      'href、target、rel、download、hreflang、media、ping、referrerpolicy，以及 ButtonHTMLAttributes。',
  },
  {
    name: 'type',
    description: '透传原生 type；LinkButton 与 Button 一致，仅接受 button、submit 或 reset。',
    type: "Button / IconButton / LinkButton: 'button' | 'submit' | 'reset'",
    options: 'button / submit / reset',
    default: "Button / IconButton: 'button'; ButtonBase / LinkButton: undefined",
  },
  {
    name: 'variant',
    description: '控制按钮的视觉变体。',
    type: "'default' | 'primary' | 'invisible' | 'danger' | 'link'",
    options: 'default / primary / invisible / danger / link',
    default: "'default'",
  },
  {
    name: 'size',
    description: '控制按钮高度与内边距。',
    type: "'small' | 'medium' | 'large'",
    options: 'small / medium / large',
    default: "'medium'",
  },
  {
    name: 'loading',
    description:
      '保留焦点并移除点击回调，按视觉元素顺序显示 spinner；通过 loadingAnnouncement 提供播报。',
    type: 'boolean',
    options: 'true / false',
    default: 'undefined',
  },
  {
    name: 'disabled',
    description: '透传原生 disabled；禁用 button 的交互并展示禁用态样式。',
    type: 'boolean',
    options: 'true / false',
    default: 'undefined',
  },
  {
    name: 'leadingVisual',
    description: '前置视觉组件，模板中使用 :leading-visual 传入；支持 Vue 单文件组件和函数式组件。',
    type: 'Component | VNode | string | null',
    options: '组件、VNode 或元素标签',
    default: 'undefined',
  },
  {
    name: 'trailingVisual',
    description: '后置视觉组件或 VNode，模板中使用 :trailing-visual 传入。',
    type: 'Component | VNode | string | null',
    options: '组件、VNode 或元素标签',
    default: 'undefined',
  },
]

const contentTableColumns: TableColumn[] = [
  { key: 'name', label: '名称', rowHeader: true, minWidth: '180px' },
  { key: 'description', label: '说明', minWidth: '320px', wrap: true },
]

const contentTableRows = [
  {
    name: 'default',
    description:
      'Button、LinkButton 和 ButtonBase 的主文案通过默认插槽提供；仅含视觉元素的操作使用 IconButton。',
  },
]
</script>

<style scoped>
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.button-row--align-end {
  align-items: flex-end;
}

.button-type-demo {
  display: grid;
  gap: 0.75rem;
}

.button-note {
  margin: 0;
  color: var(--fgColor-muted);
  font-size: 0.875rem;
  line-height: 1.6;
}

.button-note code {
  padding: 0.125rem 0.375rem;
  background: var(--bgColor-muted);
  border: 1px solid var(--borderColor-default);
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875em;
  color: var(--fgColor-default);
}

@media (max-width: 768px) {
  .button-row {
    gap: 0.75rem;
  }
}
</style>
