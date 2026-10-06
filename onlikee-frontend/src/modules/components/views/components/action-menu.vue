<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { ActionMenu } from '@/components/primer-vue/ActionMenu'
import { ActionList } from '@/components/primer-vue/ActionList'
import { Button } from '@/components/primer-vue/Button'
import Tooltip from '@/components/primer-vue/TooltipV2/Tooltip.vue'
import { CopyIcon, PencilIcon, TrashIcon, KebabHorizontalIcon } from '@/components/octicons-vue3'
import { Table, type TableColumn } from '@/components/primer-vue/Table'
import ComponentDocsDemoBlock from '@/modules/components/components/ComponentDocsPage/ComponentDocsDemoBlock.vue'
import ComponentDocsHeader from '@/modules/components/components/ComponentDocsPage/ComponentDocsHeader.vue'
import ComponentDocsPage from '@/modules/components/components/ComponentDocsPage/ComponentDocsPage.vue'
import ComponentDocsSection from '@/modules/components/components/ComponentDocsPage/ComponentDocsSection.vue'

const selected = shallowRef('尚未选择操作')
const mode = shallowRef('Fast forward')
const wrap = shallowRef(false)
const controlledOpen = shallowRef(false)
const externalOpen = shallowRef(false)
const externalAnchor = shallowRef<HTMLElement | null>(null)
const externalProps = { anchorRef: externalAnchor }
const modes = ['Fast forward', 'Recursive', 'Squash']
const notifications = shallowRef(['Issues'])
const notificationOptions = ['Issues', 'Pull requests', 'Discussions']
const contextEntries = ['First item', 'Second item', 'Third item']
const contextOpen = ref<Record<string, boolean>>({})
function toggleNotification(option: string) {
  notifications.value = notifications.value.includes(option)
    ? notifications.value.filter(value => value !== option) : [...notifications.value, option]
}
const imports = "import { ActionMenu } from '@/components/primer-vue/ActionMenu'\nimport { ActionList } from '@/components/primer-vue/ActionList'"
const loadingCode = `<script setup lang="ts">
${imports}
<\/script>

<template>
  <ActionMenu>
    <ActionMenu.Button>Open menu</ActionMenu.Button>
    <ActionMenu.Overlay>
      <ActionList>
        <ActionList.Item loading>Save</ActionList.Item>
        <ActionList.Item>Copy link</ActionList.Item>
      </ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
</template>`
const inactiveCode = `<script setup lang="ts">
${imports}
<\/script>

<template>
  <ActionMenu>
    <ActionMenu.Button>Open menu</ActionMenu.Button>
    <ActionMenu.Overlay>
      <ActionList>
        <ActionList.Item inactive-text="Unavailable due to an outage">Save</ActionList.Item>
        <ActionList.Item>Copy link</ActionList.Item>
      </ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
</template>`
const singleCode = `<script setup lang="ts">
import { shallowRef } from 'vue'
${imports}
const mode = shallowRef('Fast forward')
const modes = ['Fast forward', 'Recursive', 'Squash']
<\/script>

<template>
  <ActionMenu>
    <ActionMenu.Button>{{ mode }}</ActionMenu.Button>
    <ActionMenu.Overlay>
      <ActionList selection-variant="single">
        <ActionList.Item v-for="option in modes" :key="option" :selected="mode === option" @select="mode = option">
          {{ option }}
        </ActionList.Item>
      </ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
</template>`
const multipleCode = `<script setup lang="ts">
import { shallowRef } from 'vue'
${imports}
const selected = shallowRef(['Issues'])
const options = ['Issues', 'Pull requests', 'Discussions']
function toggle(option: string) {
  selected.value = selected.value.includes(option)
    ? selected.value.filter(value => value !== option) : [...selected.value, option]
}
<\/script>

<template>
  <ActionMenu>
    <ActionMenu.Button>Notifications</ActionMenu.Button>
    <ActionMenu.Overlay>
      <ActionList selection-variant="multiple">
        <ActionList.Item v-for="option in options" :key="option" :selected="selected.includes(option)" @select.prevent="toggle(option)">
          {{ option }}
        </ActionList.Item>
      </ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
</template>`
const dividersCode = `<script setup lang="ts">
${imports}
<\/script>

<template>
  <ActionMenu>
    <ActionMenu.Button>Open menu</ActionMenu.Button>
    <ActionMenu.Overlay>
      <ActionList>
        <ActionList.Item>Copy link</ActionList.Item>
        <ActionList.Item>Edit</ActionList.Item>
        <ActionMenu.Divider />
        <ActionList.Item variant="danger">Delete</ActionList.Item>
      </ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
</template>`
const contextCode = `<script setup lang="ts">
import { ref } from 'vue'
${imports}
import { Button } from '@/components/primer-vue/Button'
const entries = ['First item', 'Second item', 'Third item']
const open = ref<Record<string, boolean>>({})
<\/script>

<template>
  <ul>
    <li v-for="entry in entries" :key="entry" @contextmenu.prevent="open[entry] = true">
      {{ entry }}
      <ActionMenu v-model:open="open[entry]">
        <ActionMenu.Anchor>
          <Button variant="invisible" :aria-label="entry + ' actions'" @click.prevent="open[entry] = true">⋯</Button>
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.Item>Copy</ActionList.Item>
            <ActionList.Item>Edit</ActionList.Item>
            <ActionMenu.Divider />
            <ActionList.Item variant="danger">Delete</ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </li>
  </ul>
</template>`
const basicCode = `<script setup lang="ts">
${imports}
import { CopyIcon, TrashIcon } from '@/components/octicons-vue3'
const copy = () => console.log('Copy link')
<\/script>

<template>
  <ActionMenu>
    <ActionMenu.Button>Open menu</ActionMenu.Button>
    <ActionMenu.Overlay width="medium">
      <ActionList>
        <ActionList.Item aria-keyshortcuts="c" @select="copy">
          <ActionList.LeadingVisual><CopyIcon /></ActionList.LeadingVisual>
          Copy link
          <ActionList.TrailingVisual>⌘C</ActionList.TrailingVisual>
        </ActionList.Item>
        <ActionList.LinkItem href="https://github.com">GitHub</ActionList.LinkItem>
        <ActionMenu.Divider />
        <ActionList.Item disabled>Unavailable action</ActionList.Item>
        <ActionList.Item variant="danger">
          <ActionList.LeadingVisual><TrashIcon /></ActionList.LeadingVisual>
          Delete
        </ActionList.Item>
      </ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
</template>`
const selectionCode = `<script setup lang="ts">
import { shallowRef } from 'vue'
${imports}
const mode = shallowRef('Fast forward')
const wrap = shallowRef(false)
const modes = ['Fast forward', 'Recursive', 'Squash']
<\/script>

<template>
  <ActionMenu>
    <ActionMenu.Button>{{ mode }}</ActionMenu.Button>
    <ActionMenu.Overlay>
      <ActionList>
        <ActionList.Group selection-variant="single">
          <ActionList.GroupHeading>Merge mode</ActionList.GroupHeading>
          <ActionList.Item v-for="option in modes" :key="option" :selected="mode === option" @select="mode = option">
            {{ option }}
          </ActionList.Item>
        </ActionList.Group>
        <ActionMenu.Divider />
        <ActionList.Group selection-variant="multiple">
          <ActionList.Item :selected="wrap" @select.prevent="wrap = !wrap">Wrap lines</ActionList.Item>
        </ActionList.Group>
      </ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
</template>`
const anchorCode = `<script setup lang="ts">
${imports}
import { Button } from '@/components/primer-vue/Button'
import Tooltip from '@/components/primer-vue/TooltipV2/Tooltip.vue'
import { KebabHorizontalIcon } from '@/components/octicons-vue3'
<\/script>

<template>
  <ActionMenu>
    <ActionMenu.Anchor>
      <Tooltip text="更多操作" type="label">
        <Button :leading-visual="KebabHorizontalIcon" variant="invisible" />
      </Tooltip>
    </ActionMenu.Anchor>
    <ActionMenu.Overlay>
      <ActionList><ActionList.Item>Copy link</ActionList.Item></ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
</template>`
const submenuCode = `<script setup lang="ts">
${imports}
<\/script>

<template>
  <ActionMenu>
    <ActionMenu.Button>Export</ActionMenu.Button>
    <ActionMenu.Overlay>
      <ActionList>
        <ActionList.Item>Copy link</ActionList.Item>
        <ActionMenu>
          <ActionMenu.Anchor><ActionList.Item>Export as</ActionList.Item></ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList>
              <ActionList.Item>Markdown</ActionList.Item>
              <ActionList.Item>HTML</ActionList.Item>
              <ActionMenu>
                <ActionMenu.Anchor><ActionList.Item>More formats</ActionList.Item></ActionMenu.Anchor>
                <ActionMenu.Overlay>
                  <ActionList><ActionList.Item>Plain text</ActionList.Item></ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
</template>`
const controlledCode = `<script setup lang="ts">
import { shallowRef } from 'vue'
${imports}
const open = shallowRef(false)
<\/script>

<template>
  <ActionMenu v-model:open="open">
    <ActionMenu.Button>Controlled menu</ActionMenu.Button>
    <ActionMenu.Overlay><ActionList><ActionList.Item>Copy link</ActionList.Item></ActionList></ActionMenu.Overlay>
  </ActionMenu>
</template>`
const externalCode = `<script setup lang="ts">
import { shallowRef } from 'vue'
${imports}
const open = shallowRef(false)
const anchor = shallowRef<HTMLElement | null>(null)
const menuProps = { anchorRef: anchor }
<\/script>

<template>
  <button id="detached-anchor" ref="anchor" type="button" aria-haspopup="true" :aria-expanded="open" @click="open = !open">Detached anchor</button>
  <ActionMenu v-bind="menuProps" v-model:open="open">
    <ActionMenu.Overlay aria-labelledby="detached-anchor"><ActionList><ActionList.Item>Copy link</ActionList.Item></ActionList></ActionMenu.Overlay>
  </ActionMenu>
</template>`
const fullscreenCode = `<script setup lang="ts">
${imports}
<\/script>

<template>
  <ActionMenu>
    <ActionMenu.Button>Responsive menu</ActionMenu.Button>
    <ActionMenu.Overlay :variant="{ regular: 'anchored', narrow: 'fullscreen' }" width="medium">
      <ActionList>
        <ActionList.Item>Copy link</ActionList.Item>
        <ActionList.Item>Edit</ActionList.Item>
      </ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
</template>`
const columns: TableColumn[] = [
  { key: 'name', label: '属性', rowHeader: true }, { key: 'type', label: '类型', wrap: true },
  { key: 'default', label: '默认值' }, { key: 'description', label: '说明', wrap: true }
]
const menuRows = [
  { name: '默认插槽', type: 'VNode', default: '—', description: '组合 Button 或 Anchor，以及 Overlay；自身不渲染包装 DOM。' },
  { name: 'open / v-model:open', type: 'boolean', default: '内部状态 false', description: '不传时内部管理；传入后由父组件决定实际状态。' },
  { name: '@open-change', type: '(open: boolean) => void', default: '—', description: '菜单开关变化时触发，可配合 :open 更新父组件状态。' },
  { name: 'anchorRef', type: 'HTMLElement | Ref<HTMLElement | null>', default: '内部触发器', description: '支持外部触发器；通过包含 Ref 的配置对象传递可以跟踪触发器替换。外部元素负责自身开关事件和 ARIA 属性。' }
]
const buttonRows = [
  { name: '默认插槽', type: 'VNode', default: '—', description: '按钮内容；默认使用 TriangleDownIcon 作为 trailingAction。' },
  { name: '按钮属性', type: 'size, variant, disabled, loading, leadingVisual, trailingVisual, trailingAction, count…', default: '现有按钮默认值', description: '复用 ButtonBase 实现；原生属性和事件透传。disabled / loading / inactive 阻止打开。' },
  { name: 'Anchor 默认插槽', type: '一个可交互元素', default: '—', description: '将现有按钮或 ActionList.Item 作为触发器，也支持 Tooltip 包裹。注入 id、aria-haspopup、aria-expanded 和键盘事件，保留原有事件、class 和 ref。' },
  { name: 'Anchor id / className', type: 'string', default: '自动 ID / —', description: '绑定到交互元素，也可使用原生 class。嵌套菜单中自动增加右箭头。' }
]
const overlayRows = [
  { name: '默认插槽', type: 'VNode', default: '—', description: '建议使用 ActionList；自动提供 menu / menuitem 角色、aria-checked 选择属性和关闭链。' },
  { name: 'side / align', type: 'AnchorSide / AnchorAlignment', default: 'outside-bottom / start', description: '子菜单默认 outside-right；复用现有锚定定位。' },
  { name: 'width / height', type: 'OverlayWidth / OverlayHeight', default: 'auto / auto', description: 'width: auto、small、medium、large、xlarge、xxlarge；height: auto、xsmall、small、medium、large、xlarge、initial、fit-content。' },
  { name: 'maxHeight / maxWidth / overflow', type: '尺寸 token / auto | hidden | scroll | visible', default: '—', description: '控制浮层尺寸和容器滚动；maxHeight 不含 auto / initial，maxWidth 不含 auto。' },
  { name: 'variant', type: '{ regular?: anchored, narrow?: anchored | fullscreen, wide?: anchored }', default: '均 anchored', description: '小于 768px 时可使用 fullscreen，提供关闭按钮和焦点循环，Tab 不关闭；wide 从 1400px 起生效。' },
  { name: 'aria-labelledby', type: 'string', default: '触发器标签', description: '显式指定优先；否则使用触发器 aria-labelledby（含 Tooltip 标签），再回退到触发器 ID。' },
  { name: 'displayInViewport', type: 'boolean', default: '位于 Dialog 内时 true', description: '显式传入可覆盖默认定位约束。' },
  { name: 'onPositionChange', type: '({ position: AnchorPosition }) => void', default: '—', description: '现有定位原语触发回调时传入实际位置。' },
  { name: '其他 Overlay 属性', type: 'as, portalContainerName, preventFocusOnOpen, initialFocusRef, returnFocusRef, ignoreClickRefs, onEscape, onClickOutside, className, style…', default: '现有 Overlay 默认值', description: '透传到浮层；默认关闭后恢复触发器焦点。portalContainerName 需先使用 Portal 模块的 registerPortalRoot 注册。onEscape / onClickOutside 显式传入时接管对应的默认关闭行为。' }
]
</script>

<template>
  <ComponentDocsPage>
    <ComponentDocsHeader
      title="ActionMenu 操作菜单"
      description="使用 ActionList 组合操作、链接、选择项和嵌套菜单。"
    />
    <ComponentDocsSection title="基础用法">
      <template #description>
        选择菜单项后默认关闭；调用事件的 preventDefault() 可保留菜单。
      </template>
      <ComponentDocsDemoBlock :code="basicCode">
        <div data-demo="basic">
          <ActionMenu>
            <ActionMenu.Button>Open menu</ActionMenu.Button>
            <ActionMenu.Overlay width="medium">
              <ActionList>
                <ActionList.Item
                  aria-keyshortcuts="c"
                  @select="selected = 'Copy link'"
                >
                  <ActionList.LeadingVisual><CopyIcon /></ActionList.LeadingVisual>
                  Copy link
                  <ActionList.TrailingVisual>⌘C</ActionList.TrailingVisual>
                </ActionList.Item>
                <ActionList.Item
                  aria-keyshortcuts="e"
                  @select="selected = 'Edit'"
                >
                  <ActionList.LeadingVisual><PencilIcon /></ActionList.LeadingVisual>
                  Edit
                </ActionList.Item>
                <ActionList.LinkItem
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </ActionList.LinkItem>
                <ActionMenu.Divider />
                <ActionList.Item disabled>
                  Unavailable action
                </ActionList.Item>
                <ActionList.Item
                  variant="danger"
                  @select="selected = 'Delete'"
                >
                  <ActionList.LeadingVisual><TrashIcon /></ActionList.LeadingVisual>
                  Delete
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
          <p aria-live="polite">
            {{ selected }}
          </p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="With a loading item · 加载中的菜单项">
      <template #description>
        loading 展示加载指示并阻止选择；其余菜单项仍可操作。
      </template>
      <ComponentDocsDemoBlock :code="loadingCode">
        <div data-demo="loading">
          <ActionMenu>
            <ActionMenu.Button>Open menu</ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item loading>
                  Save
                </ActionList.Item>
                <ActionList.Item @select="selected = 'Copy link'">
                  Copy link
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="With an inactive item · 暂不可用的菜单项">
      <template #description>
        inactiveText 提供不可用原因；菜单项不执行操作，并通过 aria-describedby 提供原因。
      </template>
      <ComponentDocsDemoBlock :code="inactiveCode">
        <div data-demo="inactive">
          <ActionMenu>
            <ActionMenu.Button>Open menu</ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item inactive-text="Unavailable due to an outage">
                  Save
                </ActionList.Item>
                <ActionList.Item @select="selected = 'Copy link'">
                  Copy link
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="Single-select · 单选">
      <template #description>
        选择状态由调用方维护，菜单项使用 menuitemradio 和 aria-checked。
      </template>
      <ComponentDocsDemoBlock :code="singleCode">
        <div data-demo="single">
          <ActionMenu>
            <ActionMenu.Button>{{ mode }}</ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList selection-variant="single">
                <ActionList.Item
                  v-for="option in modes"
                  :key="option"
                  :selected="mode === option"
                  @select="mode = option"
                >
                  {{ option }}
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="Multi-select · 多选">
      <template #description>
        菜单项使用 menuitemcheckbox。此示例通过 @select.prevent 保持菜单打开以连续选择。
      </template>
      <ComponentDocsDemoBlock :code="multipleCode">
        <div data-demo="multiple">
          <ActionMenu>
            <ActionMenu.Button>Notifications</ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList selection-variant="multiple">
                <ActionList.Item
                  v-for="option in notificationOptions"
                  :key="option"
                  :selected="notifications.includes(option)"
                  @select.prevent="toggleNotification(option)"
                >
                  {{ option }}
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="With dividers · 分隔线">
      <ComponentDocsDemoBlock :code="dividersCode">
        <div data-demo="dividers">
          <ActionMenu>
            <ActionMenu.Button>Open menu</ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item>Copy link</ActionList.Item>
                <ActionList.Item>Edit</ActionList.Item>
                <ActionMenu.Divider />
                <ActionList.Item variant="danger">
                  Delete
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="混合选择分组">
      <template #description>
        选择状态由调用方维护。单选使用 menuitemradio，多选使用 menuitemcheckbox；此示例的多选项通过 @select.prevent 保持菜单打开。
      </template>
      <ComponentDocsDemoBlock :code="selectionCode">
        <div data-demo="selection">
          <ActionMenu>
            <ActionMenu.Button>{{ mode }}</ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Group selection-variant="single">
                  <ActionList.GroupHeading>Merge mode</ActionList.GroupHeading>
                  <ActionList.Item
                    v-for="option in modes"
                    :key="option"
                    :selected="mode === option"
                    @select="mode = option"
                  >
                    {{ option }}
                  </ActionList.Item>
                </ActionList.Group>
                <ActionMenu.Divider />
                <ActionList.Group selection-variant="multiple">
                  <ActionList.Item
                    :selected="wrap"
                    @select.prevent="wrap = !wrap"
                  >
                    Wrap lines
                  </ActionList.Item>
                </ActionList.Group>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="自定义图标触发器">
      <ComponentDocsDemoBlock :code="anchorCode">
        <div data-demo="icon">
          <ActionMenu>
            <ActionMenu.Anchor>
              <Tooltip
                text="更多操作"
                type="label"
              >
                <Button
                  :leading-visual="KebabHorizontalIcon"
                  variant="invisible"
                />
              </Tooltip>
            </ActionMenu.Anchor>
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item @select="selected = 'Copy link'">
                  Copy link
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="With submenus · 嵌套菜单">
      <template #description>
        子菜单自动定位在右侧。向右打开，向左或 Escape 返回上一层；选择叶子项或按 Tab 关闭整条菜单链。
      </template>
      <ComponentDocsDemoBlock :code="submenuCode">
        <div data-demo="submenu">
          <ActionMenu>
            <ActionMenu.Button>Export</ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item @select="selected = 'Copy link'">
                  Copy link
                </ActionList.Item>
                <ActionMenu>
                  <ActionMenu.Anchor><ActionList.Item>Export as</ActionList.Item></ActionMenu.Anchor>
                  <ActionMenu.Overlay>
                    <ActionList>
                      <ActionList.Item @select="selected = 'Markdown'">
                        Markdown
                      </ActionList.Item>
                      <ActionList.Item @select="selected = 'HTML'">
                        HTML
                      </ActionList.Item>
                      <ActionMenu>
                        <ActionMenu.Anchor><ActionList.Item>More formats</ActionList.Item></ActionMenu.Anchor>
                        <ActionMenu.Overlay>
                          <ActionList>
                            <ActionList.Item @select="selected = 'Plain text'">
                              Plain text
                            </ActionList.Item>
                          </ActionList>
                        </ActionMenu.Overlay>
                      </ActionMenu>
                    </ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="As a context menu · 右键菜单">
      <template #description>
        在任意一行右键打开对应菜单，也可点击该行操作按钮；菜单锚定在按钮上。
      </template>
      <ComponentDocsDemoBlock :code="contextCode">
        <ul
          class="action-menu-context-list"
          data-demo="context"
        >
          <li
            v-for="entry in contextEntries"
            :key="entry"
            @contextmenu.prevent="contextOpen[entry] = true"
          >
            <span>{{ entry }}</span>
            <ActionMenu v-model:open="contextOpen[entry]">
              <ActionMenu.Anchor>
                <Button
                  variant="invisible"
                  :aria-label="entry + ' actions'"
                  @click.prevent="contextOpen[entry] = true"
                >
                  ⋯
                </Button>
              </ActionMenu.Anchor>
              <ActionMenu.Overlay>
                <ActionList>
                  <ActionList.Item @select="selected = entry + ': Copy'">
                    Copy
                  </ActionList.Item>
                  <ActionList.Item @select="selected = entry + ': Edit'">
                    Edit
                  </ActionList.Item>
                  <ActionMenu.Divider />
                  <ActionList.Item
                    variant="danger"
                    @select="selected = entry + ': Delete'"
                  >
                    Delete
                  </ActionList.Item>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </li>
        </ul>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="受控状态">
      <ComponentDocsDemoBlock :code="controlledCode">
        <div data-demo="controlled">
          <ActionMenu v-model:open="controlledOpen">
            <ActionMenu.Button>Controlled menu</ActionMenu.Button>
            <ActionMenu.Overlay><ActionList><ActionList.Item>Copy link</ActionList.Item></ActionList></ActionMenu.Overlay>
          </ActionMenu>
          <Button @click="controlledOpen = !controlledOpen">
            从外部切换
          </Button>
          <p>open: {{ controlledOpen }}</p>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="外部触发器">
      <ComponentDocsDemoBlock :code="externalCode">
        <div data-demo="external">
          <button
            id="external-demo-anchor"
            ref="externalAnchor"
            class="action-menu-external-anchor"
            type="button"
            aria-haspopup="true"
            :aria-expanded="externalOpen"
            @click="externalOpen = !externalOpen"
          >
            Detached anchor
          </button>
          <ActionMenu
            v-bind="externalProps"
            v-model:open="externalOpen"
          >
            <ActionMenu.Overlay aria-labelledby="external-demo-anchor">
              <ActionList><ActionList.Item>Copy link</ActionList.Item></ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="窄屏全屏菜单">
      <template #description>
        将窗口缩窄至 768px 以下查看；默认 variant 在窄屏仍为锚定菜单。
      </template>
      <ComponentDocsDemoBlock :code="fullscreenCode">
        <div data-demo="fullscreen">
          <ActionMenu>
            <ActionMenu.Button>Responsive menu</ActionMenu.Button>
            <ActionMenu.Overlay
              :variant="{ regular: 'anchored', narrow: 'fullscreen' }"
              width="medium"
            >
              <ActionList><ActionList.Item>Copy link</ActionList.Item><ActionList.Item>Edit</ActionList.Item></ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      </ComponentDocsDemoBlock>
    </ComponentDocsSection>
    <ComponentDocsSection title="键盘交互">
      <p>浮层启用焦点陷阱；鼠标打开后由浮层接管焦点。Enter、Space、↓ 打开并聚焦第一项，↑ 聚焦最后一项。↑ / ↓、Home / End 在菜单中移动焦点。</p>
      <p>字母或数字匹配 aria-keyshortcuts，未设置时使用菜单项 textContent 的首字符（含空白）；Vue 模板建议显式设置 aria-keyshortcuts。重复按相同键循环匹配项，输入框内保持正常输入。</p>
      <p>Escape 关闭当前层并返回触发器。Tab / Shift+Tab 默认关闭菜单后按页面顺序移动焦点；全屏菜单及窄屏 open 为 true 的受控菜单保留打开并循环焦点。</p>
    </ComponentDocsSection>
    <ComponentDocsSection title="ActionMenu API">
      <Table
        :columns="columns"
        :data="menuRows"
      />
    </ComponentDocsSection>
    <ComponentDocsSection title="Button / Anchor API">
      <Table
        :columns="columns"
        :data="buttonRows"
      />
    </ComponentDocsSection>
    <ComponentDocsSection title="Overlay API">
      <Table
        :columns="columns"
        :data="overlayRows"
      />
    </ComponentDocsSection>
    <ComponentDocsSection title="导出与 Divider">
      <p>支持 ActionMenu.Button / Anchor / Overlay / Divider，也可单独导入 ActionMenuButton、ActionMenuAnchor、ActionMenuOverlay、ActionMenuDivider。Divider 复用 ActionList.Divider，菜单项 API 参见 ActionList。</p>
    </ComponentDocsSection>
  </ComponentDocsPage>
</template>

<style scoped>
.action-menu-external-anchor { padding: 6px 12px; color: var(--fgColor-default); background: var(--button-default-bgColor-rest, #f6f8fa); border: 1px solid var(--borderColor-default); border-radius: 6px; cursor: pointer; }
.action-menu-context-list { width: 100%; margin: 0; padding: 0; list-style: none; }
.action-menu-context-list > li { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid var(--borderColor-muted); }
</style>
