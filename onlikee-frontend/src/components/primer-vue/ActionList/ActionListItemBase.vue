<template>
  <!-- Item.tsx:321-401 —— li = ActionListItem；{...containerProps}（:324）在前，显式 data-*（:326-335）
       与 className（:335 clsx(ActionListItem, className)）恒后获胜。 -->
  <li v-bind="containerBindings">
    <!-- Item.tsx:338-395 —— ItemWrapper：listSemantics→div（DivItemContainer :63-71）、
         buttonSemantics→button（ButtonItemContainer :53-61）、LinkItem→a（_PrivateItemWrapper，
         LinkItem.tsx:48-86）；className/data-size 在 {...wrapperProps} 之后（Item.tsx:340-341）。 -->
    <component
      :is="wrapperTag"
      v-bind="wrapperBindings"
    >
      <!-- Item.tsx:348 —— Spacer（module CSS :612-616 display:none） -->
      <span class="action-list-spacer" />

      <!-- Item.tsx:349 —— Selection（Selection.tsx:12-52），外层 = VisualContainer(VisualWrap) -->
      <span
        v-if="hasSelection"
        class="action-list-selection"
        data-component="ActionList.Selection"
      >
        <!-- Selection.tsx:31-38 —— radio：Radio value="unused" checked aria-hidden tabIndex=-1
             （ariaHidden prop + 原生 aria-hidden 双写沿用 FAL 先例 FilteredActionList.vue:267） -->
        <Radio
          v-if="selectionVariant === 'radio'"
          v-bind="{ value: 'unused', checked: selected, ariaHidden: true, 'aria-hidden': 'true', tabindex: -1 }"
        />
        <!-- Selection.tsx:40-46 —— single 或 listRole==='menu'：CheckIcon.SingleSelectCheckmark -->
        <CheckIcon
          v-else-if="selectionVariant === 'single' || listRole === 'menu'"
          class="action-list-checkmark"
        />
        <!-- Selection.tsx:48-52 —— multiple：div.MultiSelectCheckbox（空元素，勾选由 ::before mask 绘制） -->
        <div
          v-else
          class="action-list-checkbox"
        />
      </span>

      <!-- Item.tsx:350-358 —— VisualOrIndicator leading（Visuals.tsx:59-86）：
           loading 且有 leading slot 时 Spinner 替换 leading visual（Visuals.tsx:64-70 条件取反后落入 :83-85） -->
      <span
        v-if="parsedChildren.leading.length"
        class="action-list-leading-visual"
        data-component="ActionList.LeadingVisual"
      >
        <Spinner
          v-if="loading"
          size="small"
        />
        <RenderNodes
          v-else
          :nodes="parsedChildren.leading"
        />
      </span>

      <!-- Item.tsx:359-360 —— ActionListSubContent -->
      <span
        class="action-list-sub-content"
        data-component="ActionList.Item--DividerContainer"
      >
        <!-- Item.tsx:361-365 —— ConditionalWrapper（internal/components/ConditionalWrapper.tsx:8 条件为真渲染 div）：
             仅当存在 description slot 时包裹 label + description；无 description 时 label 直接落位（:9） -->
        <div
          v-if="hasDescription"
          class="action-list-description-wrap"
          :data-description-variant="parsedChildren.descriptionVariant"
        >
          <span
            :id="labelId"
            class="action-list-label"
            data-component="ActionList.Item.Label"
          >
            <RenderNodes :nodes="parsedChildren.label" />
            <!-- Item.tsx:370 —— loading === true（严格）且非 inactive：VisuallyHidden "Loading" -->
            <VisuallyHidden v-if="loading === true">Loading</VisuallyHidden>
          </span>
          <!-- Description.tsx:58-68 —— span.Description，id = block/inlineDescriptionId（:61），
               data-component="ActionList.Description"（:64）；data-truncate 为端口 Truncate 替身（登记） -->
          <span
            :id="descriptionId"
            class="action-list-description"
            data-component="ActionList.Description"
            :data-truncate="parsedChildren.truncateDescription || undefined"
          >
            <RenderNodes :nodes="parsedChildren.description" />
          </span>
        </div>
        <span
          v-else
          :id="labelId"
          class="action-list-label"
          data-component="ActionList.Item.Label"
        >
          <RenderNodes :nodes="parsedChildren.label" />
          <VisuallyHidden v-if="loading === true">Loading</VisuallyHidden>
        </span>

        <!-- Item.tsx:374-382 —— VisualOrIndicator trailing：loading 且无 leading 时 Spinner 落 trailing
             位（Visuals.tsx:64-70,83-85）并携带 trailingVisualId（Visuals.tsx:36） -->
        <span
          v-if="hasTrailingArea"
          :id="trailingVisualId"
          class="action-list-trailing-visual"
          data-component="ActionList.TrailingVisual"
        >
          <Spinner
            v-if="loading && !parsedChildren.leading.length"
            size="small"
          />
          <RenderNodes
            v-else
            :nodes="parsedChildren.trailing"
          />
        </span>
      </span>
    </component>
  </li>
</template>

<script setup lang="ts">
import { Comment, Fragment, Text, computed, useAttrs, useId, useSlots, watch, type VNode } from 'vue'
import { CheckIcon } from '@/components/octicons-vue3'
import { Radio } from '../Radio'
import { Spinner } from '../Spinner'
import VisuallyHidden from '../internal/components/VisuallyHidden.vue'
import { useContext } from './context'
import type { ActionListDescriptionVariant, ActionListItemSize, ActionListItemVariant } from './context'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    as?: 'button' | 'a'
    href?: string
    newTab?: boolean
    target?: string
    rel?: string
    type?: 'button' | 'submit' | 'reset'
    selected?: boolean
    active?: boolean
    variant?: ActionListItemVariant
    disabled?: boolean
    loading?: boolean
    size?: ActionListItemSize
    role?: string
  }>(),
  {
    as: 'button',
    href: '',
    newTab: false,
    target: undefined,
    rel: undefined,
    type: 'button',
    selected: false,
    active: false,
    variant: 'default',
    disabled: false,
    loading: false,
    size: 'medium',
    role: undefined
  }
)

// shared.ts:20 —— onSelect 同时接收 click 与 keyboard 事件
const emit = defineEmits<{
  select: [event: MouseEvent | KeyboardEvent]
}>()

const attrs = useAttrs()
const context = useContext()

// Item.tsx:82-84 —— 预分配角色表（源为模块级常量）
const selectableRoles = ['menuitemradio', 'menuitemcheckbox', 'option', 'treeitem']
const listRoleTypes = ['listbox', 'menu', 'list', 'tree']

const listRole = computed(() => context?.listRole.value)
// Selection.tsx:13-20 —— groupSelectionVariant 可覆盖 listSelectionVariant；
// 端口 GroupContext 未移植（ActionListGroup 不提供）→ 恒取 list 级（登记）。
const selectionVariant = computed(() => context?.selectionVariant.value)

// Item.tsx:124 —— const inactive = Boolean(inactiveText)；inactiveText 未移植 → 恒 false（登记）
const inactive = false
// Item.tsx:127-129 —— menuContext 来自 ActionListContainerContext（端口无容器上下文）；
// showInactiveIndicator 公式照抄 :129（inactive 恒 false → 恒 false，登记）
const showInactiveIndicator = inactive && !(listRole.value !== undefined && ['menu', 'listbox'].includes(listRole.value))

// Item.tsx:148-160 —— inferredItemRole
const inferredItemRole = computed(() => {
  // Item.tsx:149-153 —— container === 'ActionMenu' 分支：端口无容器上下文，死分支（登记）
  if (listRole.value === 'listbox') {
    // Item.tsx:154-157
    if (selectionVariant.value !== undefined && !props.role) return 'option'
  } else if (listRole.value === 'tablist') {
    // Item.tsx:158-160
    return 'tab'
  }
  return undefined
})
// Item.tsx:161
const itemRole = computed(() => props.role || inferredItemRole.value)

// Item.tsx:169-174 —— inferredSelectionAttribute
const inferredSelectionAttribute = computed(() => {
  if (itemRole.value === 'menuitemradio' || itemRole.value === 'menuitemcheckbox') return 'aria-checked' as const
  else if (itemRole.value === 'option') return 'aria-selected' as const
  return undefined
})
// Item.tsx:168 —— selectionAttribute（容器上下文）优先；端口无容器 → 恒取 inferred
const itemSelectionAttribute = computed(() => inferredSelectionAttribute.value)

// Item.tsx:175-184
const listItemSemantics = computed(() =>
  Boolean(itemRole.value && ['option', 'menuitem', 'menuitemradio', 'menuitemcheckbox', 'tab'].includes(itemRole.value)))
const listSemantics = computed(() =>
  Boolean(listRole.value && listRoleTypes.includes(listRole.value)) || inactive || listItemSemantics.value)
// LinkItem 设置 _PrivateItemWrapper（LinkItem.tsx:48）→ 走 Item.tsx:279-280/285 的 _PrivateItemWrapper 分支
const isLink = computed(() => props.as === 'a')
const buttonSemantics = computed(() => !listSemantics.value && !isLink.value)

// Item.tsx:185 —— includeSelectionAttribute
const includeSelectionAttribute = computed(() =>
  Boolean(itemSelectionAttribute.value && itemRole.value && selectableRoles.includes(itemRole.value)))

// hooks/useId.ts:12 —— if (id) return id；否则用生成 id
const generatedId = useId()
const itemId = computed(() => (attrs.id as string | undefined) || generatedId)
const labelId = computed(() => `${itemId.value}--label`)                            // Item.tsx:211
const inlineDescriptionId = computed(() => `${itemId.value}--inline-description`)   // Item.tsx:212
const blockDescriptionId = computed(() => `${itemId.value}--block-description`)     // Item.tsx:213
const trailingVisualId = computed(() => `${itemId.value}--trailing-visual`)         // Item.tsx:214

interface MarkerType {
  name?: string
  __name?: string
  __SLOT__?: symbol
}

interface ParsedChildren {
  label: VNode[]
  leading: VNode[]
  trailing: VNode[]
  description: VNode[]
  descriptionVariant: ActionListDescriptionVariant
  truncateDescription: boolean
}

const RenderNodes = (props: { nodes: VNode[] }) => props.nodes

function getComponentName(type: VNode['type']) {
  if (typeof type !== 'object' && typeof type !== 'function') return ''
  const marker = type as MarkerType
  return marker.name ?? marker.__name ?? ''
}

function isWhitespaceNode(node: VNode) {
  return node.type === Text && typeof node.children === 'string' && node.children.trim() === ''
}

function flattenChildren(nodes: VNode[]): VNode[] {
  return nodes.flatMap(node => {
    if (node.type === Fragment && Array.isArray(node.children)) {
      return flattenChildren(node.children as VNode[])
    }
    return [node]
  })
}

function parseChildren(nodes: VNode[]): ParsedChildren {
  const parsed: ParsedChildren = {
    label: [],
    leading: [],
    trailing: [],
    description: [],
    descriptionVariant: 'inline',
    truncateDescription: false
  }

  for (const node of flattenChildren(nodes)) {
    if (node.type === Comment || isWhitespaceNode(node)) continue

    const componentName = getComponentName(node.type)
    if (componentName === 'ActionListLeadingVisual') {
      parsed.leading.push(...readSlotChildren(node))
      continue
    }
    if (componentName === 'ActionListTrailingVisual') {
      parsed.trailing.push(...readSlotChildren(node))
      continue
    }
    if (componentName === 'ActionListDescription') {
      const marker = node.type as MarkerType & { variant?: ActionListDescriptionVariant; truncate?: boolean }
      parsed.description.push(...readSlotChildren(node))
      parsed.descriptionVariant = node.props?.variant ?? marker.variant ?? 'inline'
      parsed.truncateDescription = node.props?.truncate ?? marker.truncate ?? false
      continue
    }

    parsed.label.push(node)
  }

  return parsed
}

function readSlotChildren(node: VNode) {
  const slot = node.children as { default?: () => VNode[] }
  return slot.default?.() ?? []
}

const slots = useSlots()
const parsedChildren = computed(() => parseChildren(slots.default?.() ?? []))

// Item.tsx:332 —— data-has-description 按 description slot 是否存在渲染字面量 "true"/"false"
const hasDescription = computed(() => Boolean(parsedChildren.value.description.length))
// Selection.tsx:22-29 —— 无 selectionVariant → null（不渲染）
const hasSelection = computed(() => Boolean(selectionVariant.value))
// Visuals.tsx:62-70 —— 非 loading 时按 slot 渲染；leading 位仅在 slot 存在时出现
const hasLeadingArea = computed(() => Boolean(parsedChildren.value.leading.length))
// Visuals.tsx:64-70,82-86 —— loading 且无 leading slot 时 Spinner 占据 trailing 位
const hasTrailingArea = computed(() =>
  Boolean(parsedChildren.value.trailing.length) || (props.loading && !parsedChildren.value.leading.length))
// Item.tsx:232 —— hasTrailingVisualSlot（spinner 占位不计入 aria-labelledby）
const hasTrailingVisualSlot = computed(() => Boolean(parsedChildren.value.trailing.length))

// Item.tsx:233-237 —— aria-labelledby = labelId + trailingVisualId（仅当 trailing visual slot 实际存在）
const ariaLabelledBy = computed(() =>
  [labelId.value, hasTrailingVisualSlot.value ? trailingVisualId.value : undefined].filter(Boolean).join(' '))

// Item.tsx:239-245 —— aria-describedby：block/inline description id；inactiveWarningId（:244）未移植恒缺席
const ariaDescribedBy = computed(() => {
  const describedBy: string[] = []
  if (hasDescription.value && parsedChildren.value.descriptionVariant === 'block') describedBy.push(blockDescriptionId.value)
  if (hasDescription.value && parsedChildren.value.descriptionVariant === 'inline') describedBy.push(inlineDescriptionId.value)
  return describedBy.length > 0 ? describedBy.join(' ') : undefined
})

// Description.tsx:61 —— variant === 'block' ? blockDescriptionId : inlineDescriptionId
const descriptionId = computed(() =>
  parsedChildren.value.descriptionVariant === 'block' ? blockDescriptionId.value : inlineDescriptionId.value)

// Item.tsx:186-192 —— clickHandler：disabled/inactive/loading → 仅 return（源无 preventDefault/stopPropagation）
function clickHandler(event: MouseEvent) {
  if (props.disabled || inactive || props.loading) return
  emit('select', event)
}

// Item.tsx:194-208 —— keyPressHandler；源对 Space 先 preventDefault 再重置 defaultPrevented，
// 使 onSelect 看到未 prevent 的事件 —— 等价实现：先 emit 再 preventDefault（FAL 同款，FilteredActionList.vue:226-228）
function keyPressHandler(event: KeyboardEvent) {
  if (props.disabled || inactive || props.loading) return
  if (event.key === ' ' || event.key === 'Enter') {
    emit('select', event)
    if (event.key === ' ') event.preventDefault() // prevent Space from scrolling down the page
  }
}

// Item.tsx:104/282/289 —— ...props：消费者透传属性；className 与 id 被源解构消费（:100,95）→ 此处同样摘出
const restAttrs = computed(() => {
  const { class: _class, id: _id, ...rest } = attrs
  return rest
})

// Item.tsx:257 —— { ...(includeSelectionAttribute && { [itemSelectionAttribute]: selected }) }
const selectionAttrs = computed(() => {
  const attribute = itemSelectionAttribute.value
  if (!includeSelectionAttribute.value || !attribute || !itemRole.value) return {}
  return { [attribute]: props.selected }
})

// Item.tsx:247-260 —— menuItemProps（键序 = 源 JSX 序）
const menuItemProps = computed(() => ({
  onClick: clickHandler,                                            // :249
  onKeypress: buttonSemantics.value ? undefined : keyPressHandler,  // :250 !buttonSemantics ? keyPressHandler : undefined
  'aria-disabled': props.disabled ? true : undefined,               // :251
  'data-inactive': undefined,                                       // :252 inactiveText 未移植 → 恒 undefined
  'data-loading': props.loading ? true : undefined,                 // :253 loading && !inactive
  tabindex: showInactiveIndicator ? undefined : 0,                  // :254 focusable ? undefined : 0
  'aria-labelledby': ariaLabelledBy.value,                          // :255
  'aria-describedby': ariaDescribedBy.value,                        // :256
  ...selectionAttrs.value,                                          // :257
  role: itemRole.value,                                             // :258
  id: itemId.value                                                  // :259
}))

// Item.tsx:279-282 —— containerProps
const containerProps = computed(() => {
  if (isLink.value) {
    // _PrivateItemWrapper 分支：{ role: itemRole ? 'none' : undefined, ...props }；
    // LinkItem.tsx:44-46 传入的 Item 级 props 仅 data-inactive（未移植 → 恒 undefined）
    return { role: itemRole.value ? 'none' : undefined }
  }
  if (listSemantics.value) {
    // { ...menuItemProps, ...props } —— 消费者属性后置获胜（源 JSX spread 序）
    return { ...menuItemProps.value, ...restAttrs.value }
  }
  return {} // buttonSemantics：listSemantics && {...} || {} → {}（Item.tsx:281）
})

// Item.tsx:323-335 —— li 显式属性层（位于 {...containerProps} 之后 → 恒获胜）
const containerBindings = computed(() => ({
  ...containerProps.value, // :324
  // 端口专用 focus-zone 标记（ActionList.vue focusableSelector）：落在承载 menuItemProps 的元素上
  'data-action-list-control': !isLink.value && listSemantics.value ? '' : undefined,
  'data-component': 'ActionList.Item',                                     // :326
  'data-variant': props.variant === 'danger' ? props.variant : undefined,   // :327
  'data-active': props.active ? true : undefined,                           // :328
  'data-inactive': undefined,                                               // :329 inactiveText 未移植
  'data-is-disabled': props.disabled ? true : undefined,                    // :330
  'data-has-subitem': undefined,                                            // :331 subItem 未移植
  'data-has-description': hasDescription.value ? 'true' : 'false',          // :332 恒渲染字面量
  'data-has-trailing-action': undefined,                                    // :333 trailingAction 未移植
  'data-trailing-action-loading': undefined,                                // :334
  // 端口 CSS 网格区域驱动钩子（源用固定 grid-template-areas + margin-right，module CSS :501-529；登记）
  'data-has-selection': hasSelection.value ? true : undefined,
  'data-has-leading-visual': hasLeadingArea.value ? true : undefined,
  'data-has-trailing-visual': hasTrailingArea.value ? true : undefined,
  class: ['action-list-item', attrs.class]                                  // :335 clsx(ActionListItem, className)
}))

// Item.tsx:219 —— DefaultItemWrapper = listSemantics ? DivItemContainer : ButtonItemContainer；
// LinkItem → _PrivateItemWrapper（a，LinkItem.tsx:61-72）
const wrapperTag = computed(() => (isLink.value ? 'a' : listSemantics.value ? 'div' : 'button'))

const linkHref = computed(() => (isLink.value ? props.href : undefined))
const linkTarget = computed(() => {
  if (!isLink.value) return undefined
  return props.newTab ? '_blank' : props.target
})
const linkRel = computed(() => {
  if (!isLink.value) return undefined
  return props.newTab ? props.rel ?? 'noopener noreferrer' : props.rel
})

// Item.tsx:284-290 + :338-343 —— wrapperProps；className/data-size 在 {...wrapperProps} 之后恒获胜
const wrapperBindings = computed(() => {
  const tail = {
    class: 'action-list-content', // :340
    'data-size': props.size       // :341
  }
  if (isLink.value) {
    // Item.tsx:285 —— wrapperProps = menuItemProps；LinkItem.tsx:48-72 ——
    // InternalLink {...rest(menuItemProps 去 onClick)} {...props(消费者链接属性)} onClick={组合}
    const { onClick: itemOnClick, ...rest } = menuItemProps.value
    const { onClick: consumerOnClick, ...linkAttrs } =
      restAttrs.value as Record<string, unknown> & { onClick?: (event: MouseEvent) => void }
    return {
      ...rest,
      href: linkHref.value,
      target: linkTarget.value,
      rel: linkRel.value,
      ...linkAttrs,
      // LinkItem.tsx:49-52 —— Item 的 onClick（含 guard）与消费者 onClick 依次触发
      onClick: (event: MouseEvent) => {
        itemOnClick(event)
        consumerOnClick?.(event)
      },
      ...tail,
      'data-action-list-control': ''
    }
  }
  if (listSemantics.value) {
    // Item.tsx:284 —— wrapperProps = false → DivItemContainer（:63-71）仅得 className/data-size
    return { ...tail }
  }
  // Item.tsx:286-290 —— ButtonItemContainer（:53-61）：<button type="button" {...props}>；
  // type 基底可被 props spread 覆盖 → 端口 type prop 即消费者层（默认 'button'，等价覆盖结果）
  return {
    ...menuItemProps.value,
    ...restAttrs.value,
    type: props.type,
    ...tail,
    'data-action-list-control': ''
  }
})

// Selection.tsx:22-28 —— 无 selectionVariant 但 selected 时开发告警（utils/warning.ts:6 'Warning:' 前缀）
if (import.meta.env.DEV) {
  watch(
    () => [selectionVariant.value, props.selected] as const,
    ([variant, selected]) => {
      if (!variant && selected) {
        console.warn('Warning:', 'For Item to be selected, ActionList or ActionList.Group should have a selectionVariant defined.')
      }
    },
    { immediate: true }
  )
}
</script>

<style>
.action-list-item {
  position: relative;
  list-style: none;
  background-color: var(--control-transparent-bgColor-rest, #ffffff00);
  border-radius: var(--action-list-item-radius, 0.375rem);
}

.action-list-item[data-active='true'] {
  background-color: var(--control-transparent-bgColor-selected, #818b9826);
}

.action-list-item[data-active='true']::after {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 100%;
  content: '';
  background-color: var(--bgColor-accent-emphasis, #0969da);
  border-radius: var(--action-list-item-radius, 0.375rem);
  transform: translateY(-50%);
  animation: action-list-active-line 200ms cubic-bezier(0.33, 1, 0.68, 1) forwards;
  mix-blend-mode: overlay;
  opacity: 0.5;
  pointer-events: none;
}

@keyframes action-list-active-line {
  from {
    clip-path: inset(0 100% 0 0 round var(--action-list-item-radius, 0.375rem));
    opacity: 0.5;
  }
  to {
    clip-path: inset(0 0 0 0 round var(--action-list-item-radius, 0.375rem));
    opacity: 0.5;
  }
}

/* button or a tag —— 源 module CSS :501-529（.ActionListContent） */
.action-list-content {
  --subitem-depth: 0px; /* module CSS :502 */

  position: relative;
  display: grid;
  width: 100%;
  color: var(--control-fgColor-rest, #25292e); /* primitives 11.5.1 light：control-fgColor-rest = #25292e */
  text-align: left;
  user-select: none;
  background-color: transparent;
  border: 0;
  border-radius: var(--action-list-item-radius, 0.375rem);
  font: inherit;
  padding: var(--action-list-item-padding-block, 6px) var(--action-list-item-padding-inline, 8px);
  transition: background 33.333ms linear;
  grid-template-rows: min-content;
  grid-template-areas: 'content';
  grid-template-columns: minmax(0, auto);
  align-items: start;
}

/* module CSS :538-540 —— .ActionListContent[data-size='large'] */
.action-list-content[data-size='large'] {
  padding-block: var(--control-large-paddingBlock, 0.625rem);
}

.action-list-item[data-has-selection='true'] .action-list-content {
  grid-template-areas: 'selection content';
  grid-template-columns: min-content minmax(0, auto);
}

.action-list-item[data-has-leading-visual='true'] .action-list-content {
  grid-template-areas: 'visual content';
  grid-template-columns: min-content minmax(0, auto);
}

.action-list-item[data-has-selection='true'][data-has-leading-visual='true'] .action-list-content {
  grid-template-areas: 'selection visual content';
  grid-template-columns: min-content min-content minmax(0, auto);
}

.action-list-content:focus {
  outline: none;
}

.action-list-content:focus-visible {
  outline: 2px solid var(--focus-outline-color, var(--focus-outlineColor, #0969da));
  outline-offset: -2px;
}

/* module CSS :166-173 —— li 级 focus-visible（listSemantics 时 li 为焦点元素）：@mixin focusOutline 0 */
.action-list-item:not([data-is-disabled], [data-has-subitem='true']):focus-visible {
  outline: 2px solid var(--focus-outline-color, var(--focus-outlineColor, #0969da));
  outline-offset: 0;
  box-shadow: none;
}

/* module CSS :531-534 —— .ActionListContent:hover（无条件） */
.action-list-content:hover {
  text-decoration: none;
  cursor: pointer;
}

/* module CSS :136-152 —— li hover（排除 disabled/subitem；loading 不排除，源怪癖） */
@media (hover: hover) {
  .action-list-item:not([data-is-disabled], [data-has-subitem='true']):hover {
    background-color: var(--control-transparent-bgColor-hover, #818b981a);
    box-shadow: inset 0 0 0 1px var(--control-transparent-borderColor-active, #ffffff00);
  }
}

/* module CSS :154-164 */
.action-list-item:not([data-is-disabled], [data-has-subitem='true']):active {
  background-color: var(--control-transparent-bgColor-active, #818b9826);
}

.action-list-content:active {
  background-color: var(--control-transparent-bgColor-active, #818b9826);
}

.action-list-sub-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--action-list-description-gap, 0px);
  grid-area: content;
}

.action-list-item[data-has-trailing-visual='true'] .action-list-sub-content {
  gap: var(--control-medium-gap, 0.5rem);
  grid-template-areas: 'label trailing';
  grid-template-columns: minmax(0, auto) min-content;
}

.action-list-description-wrap {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--action-list-description-gap, 0px);
  grid-area: content;
}

.action-list-description-wrap[data-description-variant='inline'] {
  flex-direction: row;
  align-items: baseline;
}

.action-list-description-wrap[data-description-variant='inline'] .action-list-description {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-list-label {
  min-width: 0;
  color: var(--fgColor-default, #1f2328);
  grid-area: label;
  overflow-wrap: anywhere;
}

/* module CSS :648-649 + :223-226 —— description/active 时 label semibold；active 时 color control-fgColor-rest */
.action-list-item[data-has-description='true'] .action-list-label,
.action-list-item[data-active='true'] .action-list-label {
  font-weight: var(--base-text-weight-semibold, 600);
}

.action-list-item[data-active='true'] .action-list-label {
  color: var(--control-fgColor-rest, #25292e);
}

/* module CSS（List）:102-106 —— 混合 description 列表将 label 字重还原 normal（List.tsx:95-107 写入该属性） */
.action-list[data-mixed-descriptions='true'] .action-list-label {
  font-weight: var(--base-text-weight-normal, 400);
}

.action-list-description {
  /* module CSS :674-684 —— .Description：text-body-size-small + line-height 16px */
  font-size: var(--text-body-size-small, 0.75rem);
  font-weight: var(--base-text-weight-normal, 400);
  line-height: 16px;
  color: var(--fgColor-muted, #59636e);
}

.action-list-description[data-truncate='true'] {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* VisualWrap —— module CSS :688-699；三个视觉容器共享（Selection=LeadingAction :618-620） */
.action-list-selection,
.action-list-leading-visual,
.action-list-trailing-visual {
  display: flex;
  min-width: max-content;
  min-height: var(--action-list-row-height, 20px);
  line-height: 20px;
  color: var(--fgColor-muted, #59636e);
  pointer-events: none;
  align-items: center;
}

.action-list-selection {
  grid-area: selection;
}

.action-list-leading-visual {
  grid-area: leading;
}

.action-list-trailing-visual {
  grid-area: trailing;
  font-size: var(--text-body-size-medium, 0.875rem); /* module CSS :627-630 */
}

/* module CSS :612-616 —— .Spacer */
.action-list-spacer {
  display: none;
  width: max(0px, var(--subitem-depth) * 8px);
  grid-area: spacer;
}

/* module CSS :493-496 —— SingleSelectCheckmark 仅 visibility 切换（颜色继承 VisualWrap fgColor-muted） */
.action-list-checkmark {
  visibility: hidden;
}

/* module CSS :407-448 —— MultiSelectCheckbox（空 div + ::before mask 勾选） */
.action-list-checkbox {
  position: relative;
  display: grid;
  width: var(--base-size-16, 1rem);
  height: var(--base-size-16, 1rem);
  margin: 0;
  cursor: pointer;
  background-color: var(--bgColor-default, #ffffff);
  border: var(--borderWidth-thin, 0.0625rem) solid var(--control-borderColor-emphasis, #818b98);
  border-radius: var(--borderRadius-small, 0.1875rem);
  transition:
    background-color,
    border-color 80ms cubic-bezier(0.33, 1, 0.68, 1);
  place-content: center;
}

.action-list-checkbox::before {
  width: var(--base-size-16, 1rem);
  height: var(--base-size-16, 1rem);
  content: '';
  background-color: var(--control-checked-fgColor-rest, #ffffff);
  transition: visibility 0s linear 230ms;
  clip-path: inset(var(--base-size-16, 1rem) 0 0 0);
  mask-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDEyIDkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTEuNzgwMyAwLjIxOTYyNUMxMS45MjEgMC4zNjA0MjcgMTIgMC41NTEzMDUgMTIgMC43NTAzMTNDMTIgMC45NDkzMjEgMTEuOTIxIDEuMTQwMTkgMTEuNzgwMyAxLjI4MUw0LjUxODYgOC41NDA0MkM0LjM3Nzc1IDguNjgxIDQuMTg2ODIgOC43NiAzLjk4Nzc0IDguNzZDMy43ODg2NyA4Ljc2IDMuNTk3NzMgOC42ODEgMy40NTY4OSA4LjU0MDQyTDAuMjAxNjIyIDUuMjg2MkMwLjA2ODkyNzcgNS4xNDM4MyAtMC4wMDMzMDkwNSA0Ljk1NTU1IDAuMDAwMTE2NDkzIDQuNzYwOThDMC4wMDM1NTIwNSA0LjU2NjQzIDAuMDgyMzg5NCA0LjM4MDgxIDAuMjIwMDMyIDQuMjQzMjFDMC4zNTc2NjUgNC4xMDM1OSA0LjEwMjMxIDAuMjI0ODM4IDQuMTAyMzEgMC4yMjQ4MzhMMy45ODc3NCA2Ljk0ODM1TDEwLjcxODYgMC4yMTk2MjVDMTAuODU5NSAwLjA3ODk5MjMgMTEuMDUwNCAwIDExLjI0OTUgMEMxMS40NDg1IDAgMTEuNjM5NSAwLjA3ODk5MjMgMTEuNzgwMyAwLjIxOTYyNVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==');
  mask-size: 75%;
  mask-repeat: no-repeat;
  mask-position: center;
  animation: action-list-checkmark-out 80ms cubic-bezier(0.65, 0, 0.35, 1);
}

/* module CSS :450-477 —— checked/selected 态（aria-* 位于 li，listSemantics 模式） */
.action-list-item[aria-checked='true'] .action-list-checkbox,
.action-list-item[aria-selected='true'] .action-list-checkbox {
  background-color: var(--control-checked-bgColor-rest, #0969da);
  border-color: var(--control-checked-borderColor-rest, #0969da);
  transition:
    background-color,
    border-color 80ms cubic-bezier(0.32, 0.67, 0) 0ms;
}

.action-list-item[aria-checked='true'] .action-list-checkbox::before,
.action-list-item[aria-selected='true'] .action-list-checkbox::before {
  visibility: visible;
  transition: visibility 0s linear 0s;
  animation: action-list-checkmark-in 80ms cubic-bezier(0.65, 0, 0.35, 1) forwards 80ms;
}

/* module CSS :479-490 */
.action-list-item[aria-checked='false'] .action-list-checkbox::before,
.action-list-item[aria-selected='false'] .action-list-checkbox::before {
  visibility: hidden;
}

.action-list-item[aria-checked='true'] .action-list-checkmark,
.action-list-item[aria-selected='true'] .action-list-checkmark {
  visibility: visible;
}

.action-list-item[aria-checked='false'] .action-list-checkmark,
.action-list-item[aria-selected='false'] .action-list-checkmark {
  visibility: hidden;
}

/* module CSS :291-300 —— loading：li 自身或直接子控件携带 data-loading 时文本 muted */
.action-list-item:where([data-loading='true']) .action-list-label,
.action-list-item:where([data-loading='true']) .action-list-description,
.action-list-item:where([data-loading='true']) .action-list-leading-visual,
.action-list-item:where([data-loading='true']) .action-list-trailing-visual,
.action-list-item:where([data-loading='true']) .action-list-selection,
.action-list-item > [data-loading='true'] .action-list-label,
.action-list-item > [data-loading='true'] .action-list-description,
.action-list-item > [data-loading='true'] .action-list-leading-visual,
.action-list-item > [data-loading='true'] .action-list-trailing-visual,
.action-list-item > [data-loading='true'] .action-list-selection {
  color: var(--fgColor-muted, #59636e);
}

/* module CSS :344-363 —— disabled（aria-disabled 位于承载 menuItemProps 的元素；data-is-disabled 恒在 li） */
.action-list-item[aria-disabled='true'] .action-list-content *,
.action-list-item[data-is-disabled] .action-list-content * {
  color: var(--control-fgColor-disabled, #818b98);
}

@media (hover: hover) {
  .action-list-item[aria-disabled='true'] .action-list-content:hover,
  .action-list-item[data-is-disabled] .action-list-content:hover {
    cursor: not-allowed;
    background-color: transparent;
  }

  .action-list-item[aria-disabled='true']:hover,
  .action-list-item[data-is-disabled]:hover {
    background-color: transparent;
  }
}

/* module CSS :365-382 —— disabled 复选框 */
.action-list-item[aria-disabled='true'] .action-list-checkbox,
.action-list-item[data-is-disabled] .action-list-checkbox {
  background-color: var(--control-bgColor-disabled, #eff2f5);
  border-color: var(--control-borderColor-disabled, #818b981a);
}

.action-list-item[aria-disabled='true'][aria-checked='true'] .action-list-checkbox,
.action-list-item[aria-disabled='true'][aria-selected='true'] .action-list-checkbox,
.action-list-item[data-is-disabled][aria-checked='true'] .action-list-checkbox,
.action-list-item[data-is-disabled][aria-selected='true'] .action-list-checkbox {
  background-color: var(--control-checked-bgColor-disabled, #818b98);
  border-color: var(--control-checked-bgColor-disabled, #818b98);
}

.action-list-item[aria-disabled='true'][aria-checked='true'] .action-list-checkbox::before,
.action-list-item[aria-disabled='true'][aria-selected='true'] .action-list-checkbox::before,
.action-list-item[data-is-disabled][aria-checked='true'] .action-list-checkbox::before,
.action-list-item[data-is-disabled][aria-selected='true'] .action-list-checkbox::before {
  background-color: var(--control-checked-fgColor-disabled, #ffffff);
}

/* module CSS :176-208 —— danger（嵌于 :not([data-is-disabled],[data-has-subitem]) 块内） */
.action-list-item[data-variant='danger']:not([data-is-disabled], [data-has-subitem='true']) .action-list-selection,
.action-list-item[data-variant='danger']:not([data-is-disabled], [data-has-subitem='true']) .action-list-leading-visual,
.action-list-item[data-variant='danger']:not([data-is-disabled], [data-has-subitem='true']) .action-list-label {
  color: var(--control-danger-fgColor-rest, var(--fgColor-danger, #d1242f));
}

@media (hover: hover) {
  .action-list-item[data-variant='danger']:not([data-is-disabled], [data-has-subitem='true']):hover {
    background: var(--control-danger-bgColor-hover, var(--bgColor-danger-muted, #ffebe9));
  }

  .action-list-item[data-variant='danger']:not([data-is-disabled], [data-has-subitem='true']):hover .action-list-selection,
  .action-list-item[data-variant='danger']:not([data-is-disabled], [data-has-subitem='true']):hover .action-list-leading-visual,
  .action-list-item[data-variant='danger']:not([data-is-disabled], [data-has-subitem='true']):hover .action-list-label {
    color: var(--control-danger-fgColor-hover, var(--fgColor-danger, #d1242f));
  }
}

.action-list-item[data-variant='danger']:not([data-is-disabled], [data-has-subitem='true']):active {
  background: var(--control-danger-bgColor-active, #ffebe966);
}

/* module CSS :796-814 */
@keyframes action-list-checkmark-in {
  from {
    clip-path: inset(var(--base-size-16, 1rem) 0 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes action-list-checkmark-out {
  from {
    clip-path: inset(0 0 0 0);
  }
  to {
    clip-path: inset(var(--base-size-16, 1rem) 0 0 0);
  }
}
</style>
