<template>
  <li
    class="action-list-item"
    :data-item-variant="variant"
    :data-size="size"
    :data-selected="selected || undefined"
    :data-active="active || undefined"
    :data-disabled="disabled || undefined"
    :data-loading="loading || undefined"
    :data-has-selection="hasSelection || undefined"
    :data-has-leading-visual="hasLeadingArea || undefined"
    :data-has-trailing-visual="hasTrailingArea || undefined"
    :data-has-description="hasDescription || undefined"
    :role="presentationRole"
  >
    <component
      :is="controlTag"
      v-bind="$attrs"
      class="action-list-content"
      data-action-list-control
      :type="buttonType"
      :href="linkHref"
      :target="linkTarget"
      :rel="linkRel"
      :role="role"
      :disabled="controlTag === 'button' ? disabled || loading : undefined"
      :aria-disabled="controlTag === 'a' && (disabled || loading) ? 'true' : undefined"
      :aria-busy="loading ? 'true' : undefined"
      :aria-selected="ariaSelected"
      :aria-checked="ariaChecked"
      :tabindex="controlTag === 'a' && (disabled || loading) ? -1 : undefined"
      :data-size="size"
      @click="handleClick"
    >
      <span
        v-if="hasSelection"
        class="action-list-selection"
        aria-hidden="true"
      >
        <span
          v-if="selectionVariant === 'multiple'"
          class="action-list-checkbox"
        >
          <CheckIcon
            class="action-list-checkbox-icon"
            :size="12"
          />
        </span>
        <CheckIcon
          v-else
          class="action-list-checkmark"
        />
      </span>

      <span
        v-if="hasLeadingArea"
        class="action-list-leading-visual"
        aria-hidden="true"
      >
        <SpinnerIcon
          v-if="loading && !parsedChildren.leading.length"
          class="action-list-spinner"
        />
        <RenderNodes
          v-else
          :nodes="parsedChildren.leading"
        />
      </span>

      <span class="action-list-sub-content">
        <span
          class="action-list-description-wrap"
          :data-description-variant="hasDescription ? parsedChildren.descriptionVariant : undefined"
        >
          <span class="action-list-label">
            <RenderNodes :nodes="parsedChildren.label" />
          </span>
          <span
            v-if="hasDescription"
            class="action-list-description"
            :data-truncate="parsedChildren.truncateDescription || undefined"
          >
            <RenderNodes :nodes="parsedChildren.description" />
          </span>
        </span>

        <span
          v-if="hasTrailingArea"
          class="action-list-trailing-visual"
          aria-hidden="true"
        >
          <SpinnerIcon
            v-if="loading && parsedChildren.leading.length"
            class="action-list-spinner"
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
import { Comment, Fragment, Text, computed, useSlots, type VNode } from 'vue'
import { CheckIcon, SpinnerIcon } from '@/components/octicons-vue3'
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

const emit = defineEmits<{
  select: [event: MouseEvent]
}>()

const slots = useSlots()
const context = useContext()

interface ActionListMarkerType {
  name?: string
  __name?: string
}

interface ParsedActionListChildren {
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

  const marker = type as ActionListMarkerType
  return marker.name ?? marker.__name ?? ''
}

function readSlotChildren(node: VNode) {
  if (typeof node.children === 'object' && node.children && 'default' in node.children) {
    const slot = node.children.default
    return typeof slot === 'function' ? slot() : []
  }

  return []
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

function parseActionListChildren(nodes: VNode[]): ParsedActionListChildren {
  const parsed: ParsedActionListChildren = {
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
      const props = node.props as { variant?: ActionListDescriptionVariant, truncate?: boolean } | null

      parsed.description.push(...readSlotChildren(node))
      parsed.descriptionVariant = props?.variant ?? 'inline'
      parsed.truncateDescription = props?.truncate ?? false
      continue
    }

    parsed.label.push(node)
  }

  return parsed
}

const controlTag = computed(() => props.as)
const selectionVariant = computed(() => context?.selectionVariant.value)
const compositeListRoles = new Set(['grid', 'listbox', 'menu', 'menubar', 'tree'])
const presentationRole = computed(() => {
  const role = context?.listRole.value
  return role && compositeListRoles.has(role) ? 'none' : undefined
})
const hasSelection = computed(() => Boolean(selectionVariant.value))
const parsedChildren = computed(() => parseActionListChildren(slots.default?.() ?? []))
const hasDescription = computed(() => Boolean(parsedChildren.value.description.length))
const hasLeadingArea = computed(() => Boolean(parsedChildren.value.leading.length) || (props.loading && !parsedChildren.value.leading.length))
const hasTrailingArea = computed(() => Boolean(parsedChildren.value.trailing.length) || (props.loading && Boolean(parsedChildren.value.leading.length)))
const buttonType = computed(() => controlTag.value === 'button' ? props.type : undefined)
const linkHref = computed(() => controlTag.value === 'a' ? props.href : undefined)
const linkTarget = computed(() => {
  if (controlTag.value !== 'a') return undefined
  return props.target ?? (props.newTab ? '_blank' : undefined)
})
const linkRel = computed(() => {
  if (controlTag.value !== 'a') return undefined
  if (props.rel) return props.rel
  return props.newTab ? 'noopener noreferrer' : undefined
})
const ariaSelected = computed(() => props.role === 'option' ? String(props.selected) : undefined)
const ariaChecked = computed(() => {
  if (props.role !== 'menuitemcheckbox' && props.role !== 'menuitemradio') return undefined
  return String(props.selected)
})

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  emit('select', event)
}
</script>

<style>
.action-list-item {
  position: relative;
  list-style: none;
  background-color: var(--control-transparent-bgColor-rest, transparent);
  border-radius: var(--action-list-item-radius, 6px);
}

.action-list-item[data-active='true'] {
  background: var(--control-transparent-bgColor-selected, #818b9826);
  outline: 2px solid transparent;
}

.action-list-item[data-active='true']::after {
  content: '';
  position: absolute;
  left: -8px;
  top: 4px;
  bottom: 0;
  width: 4px;
  height: calc(100% - 8px);
  background-color: var(--bgColor-accent-emphasis , #0969da);
  border-radius: 6px;
}

.action-list-content {
  box-sizing: border-box;
  display: grid;
  width: 100%;
  min-width: 0;
  padding: var(--action-list-item-padding-block, 6px) var(--action-list-item-padding-inline, 8px);
  color: var(--control-fgColor-rest, var(--fgColor-default, #1f2328));
  text-align: left;
  text-decoration: none;
  user-select: none;
  touch-action: manipulation;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: var(--action-list-item-radius, 6px);
  grid-template-areas: 'content';
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  font: inherit;
  -webkit-tap-highlight-color: transparent;
}

.action-list-item[data-size='large'] .action-list-content {
  padding-block: 10px;
}

.action-list-item[data-has-selection='true'] .action-list-content {
  column-gap: var(--action-list-gap, 8px);
  grid-template-areas: 'selection content';
  grid-template-columns: min-content minmax(0, 1fr);
}

.action-list-item[data-has-leading-visual='true'] .action-list-content {
  column-gap: var(--action-list-gap, 8px);
  grid-template-areas: 'visual content';
  grid-template-columns: min-content minmax(0, 1fr);
}

.action-list-item[data-has-selection='true'][data-has-leading-visual='true'] .action-list-content {
  column-gap: var(--action-list-gap, 8px);
  grid-template-areas: 'selection visual content';
  grid-template-columns: min-content min-content minmax(0, 1fr);
}

.action-list-content:focus {
  outline: none;
}

.action-list-content:focus-visible {
  outline: 2px solid var(--focus-outlineColor, #0969da);
  outline-offset: -2px;
}

.action-list-item:not([data-disabled='true'], [data-loading='true']) .action-list-content:hover {
  text-decoration: none;
}

@media (hover: hover) {
  .action-list-item:not([data-disabled='true'], [data-loading='true']):hover {
    background-color: var(--control-transparent-bgColor-hover, #818b981a);
    box-shadow: inset 0 0 0 1px var(--control-transparent-borderColor-active, transparent);
  }
}

.action-list-item:not([data-disabled='true'], [data-loading='true']):active {
  background-color: var(--control-transparent-bgColor-active, #818b9826);
  box-shadow: inset 0 0 0 1px var(--control-transparent-borderColor-active, transparent);
}

.action-list-selection,
.action-list-leading-visual,
.action-list-trailing-visual {
  display: inline-flex;
  min-width: max-content;
  min-height: var(--action-list-row-height, 20px);
  align-items: center;
  color: var(--fgColor-muted, #59636e);
  line-height: var(--action-list-row-height, 20px);
  pointer-events: none;
}

.action-list-selection {
  grid-area: selection;
}

.action-list-leading-visual {
  grid-area: visual;
}

.action-list-trailing-visual {
  grid-area: trailing;
  font-size: 14px;
}

.action-list-sub-content {
  position: relative;
  display: grid;
  width: 100%;
  min-width: 0;
  column-gap: var(--action-list-gap, 8px);
  grid-area: content;
  grid-template-areas: 'label';
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
}

.action-list-item[data-has-trailing-visual='true'] .action-list-sub-content {
  grid-template-areas: 'label trailing';
  grid-template-columns: minmax(0, 1fr) min-content;
}

.action-list-description-wrap {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
  grid-area: label;
}

.action-list-description-wrap[data-description-variant='inline'] {
  flex-direction: row;
  align-items: baseline;
  gap: 8px;
}

.action-list-description-wrap[data-description-variant='inline'] .action-list-label {
  flex: 0 0 auto;
  overflow-wrap: normal;
  white-space: nowrap;
}

.action-list-description-wrap[data-description-variant='inline'] .action-list-description {
  flex: 1 1 auto;
}

.action-list-label {
  position: relative;
  min-width: 0;
  color: var(--fgColor-default, #1f2328);
  font-size: 14px;
  font-weight: 400;
  line-height: var(--action-list-row-height, 20px);
  overflow-wrap: anywhere;
}

.action-list-item[data-has-description='true'] .action-list-label,
.action-list-item[data-active='true'] .action-list-label {
  font-weight: 600;
}

.action-list-description {
  min-width: 0;
  color: var(--fgColor-muted, #59636e);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.action-list-description[data-truncate='true'] {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-list-checkmark {
  color: var(--fgColor-default, #1f2328);
  visibility: hidden;
}

.action-list-checkbox {
  position: relative;
  display: inline-grid;
  width: 16px;
  height: 16px;
  place-content: center;
  background: var(--bgColor-default, #ffffff);
  border: 1px solid var(--control-borderColor-emphasis, #818b98);
  border-radius: var(--borderRadius-small, 4px);
}

.action-list-checkbox-icon {
  color: var(--control-checked-fgColor-rest, #ffffff);
  visibility: hidden;
}

.action-list-item[data-selected='true'] .action-list-checkmark,
.action-list-item[data-selected='true'] .action-list-checkbox-icon {
  visibility: visible;
}

.action-list-item[data-selected='true'] .action-list-checkbox {
  background: var(--control-checked-bgColor-rest, var(--bgColor-accent-emphasis, #0969da));
  border-color: var(--control-checked-borderColor-rest, var(--bgColor-accent-emphasis, #0969da));
}

.action-list-spinner {
  animation: action-list-spin 1s linear infinite;
}

.action-list-item[data-loading='true'] .action-list-label,
.action-list-item[data-loading='true'] .action-list-description,
.action-list-item[data-loading='true'] .action-list-leading-visual,
.action-list-item[data-loading='true'] .action-list-trailing-visual,
.action-list-item[data-loading='true'] .action-list-selection {
  color: var(--fgColor-muted, #59636e);
}

.action-list-item[data-disabled='true'] .action-list-content,
.action-list-item[data-loading='true'] .action-list-content {
  cursor: not-allowed;
}

.action-list-item[data-disabled='true'] .action-list-label,
.action-list-item[data-disabled='true'] .action-list-description,
.action-list-item[data-disabled='true'] .action-list-leading-visual,
.action-list-item[data-disabled='true'] .action-list-trailing-visual,
.action-list-item[data-disabled='true'] .action-list-selection {
  color: var(--control-fgColor-disabled, #818b98);
}

.action-list-item[data-disabled='true'] .action-list-checkbox {
  background-color: var(--control-bgColor-disabled, #f6f8fa);
  border-color: var(--control-borderColor-disabled, #d0d7de);
}

.action-list-item[data-item-variant='danger']:not([data-disabled='true'], [data-loading='true']) .action-list-selection,
.action-list-item[data-item-variant='danger']:not([data-disabled='true'], [data-loading='true']) .action-list-leading-visual,
.action-list-item[data-item-variant='danger']:not([data-disabled='true'], [data-loading='true']) .action-list-label {
  color: var(--control-danger-fgColor-rest, var(--fgColor-danger, #d1242f));
}

@media (hover: hover) {
  .action-list-item[data-item-variant='danger']:not([data-disabled='true'], [data-loading='true']):hover {
    background: var(--control-danger-bgColor-hover, var(--bgColor-danger-muted, #ffebe9));
  }

  .action-list-item[data-item-variant='danger']:not([data-disabled='true'], [data-loading='true']):hover .action-list-selection,
  .action-list-item[data-item-variant='danger']:not([data-disabled='true'], [data-loading='true']):hover .action-list-leading-visual,
  .action-list-item[data-item-variant='danger']:not([data-disabled='true'], [data-loading='true']):hover .action-list-label {
    color: var(--control-danger-fgColor-hover, var(--fgColor-danger, #d1242f));
  }
}

.action-list-item[data-item-variant='danger']:not([data-disabled='true'], [data-loading='true']):active {
  background: var(--control-danger-bgColor-active, #ffebe966);
}

@keyframes action-list-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
