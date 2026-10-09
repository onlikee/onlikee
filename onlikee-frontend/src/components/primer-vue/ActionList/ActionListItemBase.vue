<script lang="ts">
/* eslint-disable vue/prop-name-casing -- Keep React source-compatible private prop aliases. */
import classes from './ActionList.module.css'
/* eslint-disable vue/one-component-per-file -- Internal provider resets tooltips within each item. */
import {
  computed,
  defineComponent,
  h,
  provide,
  ref,
  useId,
  type Component,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue'
import { CheckIcon } from '@/components/octicons-vue3'
import Radio from '../Radio/Radio.vue'
import Tooltip from '../TooltipV2/Tooltip.vue'
import { TOOLTIP_CONTEXT_KEY } from '../TooltipV2/TooltipContext'
import VisuallyHidden from '../internal/components/VisuallyHidden.vue'
import { normalizeReactStyle } from '../internal/style'
import { useSlots } from '../composables/useSlots'
import {
  actionListItemContextKey,
  exposeElement,
  useContainerContext,
  useContext,
  useGroupContext,
} from './context'
import type {
  ActionListItemProps,
  ActionListItemSize,
  ActionListItemVariant,
  SelectEvent,
} from './types'
import Description from './ActionListDescription.vue'
import LeadingVisual from './ActionListLeadingVisual.vue'
import TrailingVisual from './ActionListTrailingVisual.vue'
import TrailingAction from './ActionListTrailingAction.vue'
import SubItem from './ActionListSubItem.vue'
import VisualOrIndicator from './ActionListVisualOrIndicator.vue'

// Reset an outer item tooltip without suppressing the tooltips on its children.
const ItemContents = defineComponent({
  name: 'ActionListItemContents',
  setup(_props, { slots }) {
    provide(TOOLTIP_CONTEXT_KEY, {})
    return () => slots.default?.()
  },
})
export default defineComponent({
  name: 'ActionListItem',
  __SLOT__: Symbol('ActionList.Item'),
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<ActionListItemVariant>, default: 'default' },
    size: { type: String as PropType<ActionListItemSize>, default: 'medium' },
    disabled: Boolean,
    inactiveText: { type: String, default: undefined },
    selected: { type: Boolean, default: undefined },
    active: Boolean,
    id: { type: String, default: undefined },
    role: { type: String, default: undefined },
    loading: { type: Boolean, default: undefined },
    className: { type: String, default: undefined },
    as: { type: [String, Object, Function] as PropType<string | Component>, default: undefined },
    groupId: { type: String, default: undefined },
    renderItem: { type: Function, default: undefined },
    handleAddItem: { type: Function, default: undefined },
    privateItemWrapper: {
      type: Function as PropType<NonNullable<ActionListItemProps['privateItemWrapper']>>,
      default: undefined,
    },
    privateTooltipText: { type: String, default: undefined },
    _PrivateItemWrapper: {
      type: Function as PropType<NonNullable<ActionListItemProps['_PrivateItemWrapper']>>,
      default: undefined,
    },
    _PrivateTooltipText: { type: String, default: undefined },
  },
  emits: { select: (_event: SelectEvent) => true },
  setup(props, { slots, attrs, emit, expose }) {
    const list = useContext(),
      group = useGroupContext(),
      container = useContainerContext()
    const generatedId = useId()
    const itemId = computed(() => props.id || generatedId)
    const labelId = computed(() => itemId.value + '--label')
    const inlineDescriptionId = computed(() => itemId.value + '--inline-description')
    const blockDescriptionId = computed(() => itemId.value + '--block-description')
    const trailingVisualId = computed(() => itemId.value + '--trailing-visual')
    const listRole = computed(() => list?.listRole.value)
    const itemWrapper = computed(() => props.privateItemWrapper ?? props._PrivateItemWrapper)
    const privateTooltipText = computed(() => props.privateTooltipText ?? props._PrivateTooltipText)
    // Item and Selection intentionally use the source's different false-override rules.
    const selectionVariant = computed(() => group.selectionVariant || list?.selectionVariant.value)
    const visualSelectionVariant = computed(() =>
      group.selectionVariant !== undefined ? group.selectionVariant : list?.selectionVariant.value,
    )
    const itemRole = computed(
      () =>
        props.role ||
        (container.container === 'ActionMenu'
          ? selectionVariant.value === 'single'
            ? 'menuitemradio'
            : selectionVariant.value === 'multiple'
              ? 'menuitemcheckbox'
              : 'menuitem'
          : listRole.value === 'listbox' && selectionVariant.value !== undefined
            ? 'option'
            : listRole.value === 'tablist'
              ? 'tab'
              : undefined),
    )
    const inactive = computed(() => Boolean(props.inactiveText))
    const listSemantics = computed(
      () =>
        Boolean(listRole.value && ['listbox', 'menu', 'list', 'tree'].includes(listRole.value)) ||
        inactive.value ||
        Boolean(
          itemRole.value &&
          ['option', 'menuitem', 'menuitemradio', 'menuitemcheckbox', 'tab'].includes(
            itemRole.value,
          ),
        ),
    )
    const buttonSemantics = computed(() => !listSemantics.value && !itemWrapper.value)
    const truncatedText = ref<string>()
    provide(actionListItemContextKey, {
      variant: computed(() => props.variant),
      size: computed(() => props.size),
      disabled: computed(() => props.disabled),
      inactive,
      inlineDescriptionId,
      blockDescriptionId,
      trailingVisualId,
      // Read this during render so switching roles also switches truncation ownership.
      get setTruncatedText() {
        return buttonSemantics.value
          ? (text: string | undefined) => {
              if (truncatedText.value !== text) truncatedText.value = text
            }
          : undefined
      },
    })
    const element = ref<HTMLElement | null>(null)
    expose(exposeElement(element))
    function select(event: SelectEvent) {
      emit('select', event)
      if (!event.defaultPrevented) container.afterSelect?.(event)
    }
    function click(event: MouseEvent) {
      if (props.disabled || inactive.value || props.loading) return
      select(event)
    }
    function keypress(event: KeyboardEvent) {
      if (props.disabled || inactive.value || props.loading) return
      if (event.key === ' ' || event.key === 'Enter') {
        // 原生事件的 defaultPrevented 只读；先通知调用方，再阻止空格键的默认行为。
        select(event)
        if (event.key === ' ') event.preventDefault()
      }
    }
    return () => {
      const [matched, rest] = useSlots(slots.default?.(), {
        leadingVisual: LeadingVisual,
        trailingVisual: TrailingVisual,
        trailingAction: TrailingAction,
        subItem: SubItem,
        description: Description,
      })
      const menuContext = ['ActionMenu', 'SelectPanel', 'FilteredActionList'].includes(
        container.container ?? '',
      )
      if (matched.trailingAction && menuContext)
        throw new Error(
          'ActionList.TrailingAction can not be used within a list with an ARIA role of "menu" or "listbox".',
        )
      const showInactiveIndicator =
        inactive.value &&
        !(listRole.value !== undefined && ['menu', 'listbox'].includes(listRole.value))
      const warningId =
        inactive.value && !showInactiveIndicator ? itemId.value + '--warning-message' : undefined
      const descriptionVariant = matched.description?.props?.variant ?? 'inline'
      const selectionAttribute =
        container.selectionAttribute ||
        (itemRole.value === 'menuitemradio' || itemRole.value === 'menuitemcheckbox'
          ? 'aria-checked'
          : itemRole.value === 'option'
            ? 'aria-selected'
            : undefined)
      const includeSelection =
        selectionAttribute &&
        itemRole.value &&
        ['menuitemradio', 'menuitemcheckbox', 'option', 'treeitem'].includes(itemRole.value)
      const menuItemProps = {
        onClick: click,
        onKeypress: buttonSemantics.value ? undefined : keypress,
        'aria-disabled': props.disabled ? true : undefined,
        'data-inactive': inactive.value ? true : undefined,
        'data-loading': props.loading && !inactive.value ? true : undefined,
        tabindex: showInactiveIndicator ? undefined : 0,
        'aria-labelledby': [
          labelId.value,
          matched.trailingVisual ? trailingVisualId.value : undefined,
        ]
          .filter(Boolean)
          .join(' '),
        'aria-describedby':
          [
            matched.description
              ? descriptionVariant === 'block'
                ? blockDescriptionId.value
                : inlineDescriptionId.value
              : undefined,
            warningId,
          ]
            .filter(Boolean)
            .join(' ') || undefined,
        ...(includeSelection ? { [selectionAttribute]: props.selected } : {}),
        role: itemRole.value,
        id: itemId.value,
      }
      const { class: classAttr, style, ...restAttrs } = attrs
      const nativeAttrs = { ...restAttrs, style: normalizeReactStyle(style) }
      const containerProps = itemWrapper.value
        ? { role: itemRole.value ? 'none' : undefined, ...nativeAttrs }
        : listSemantics.value
          ? { ...menuItemProps, ...nativeAttrs }
          : {}
      const wrapperProps = itemWrapper.value
        ? menuItemProps
        : !listSemantics.value
          ? { ...menuItemProps, ...nativeAttrs }
          : {}
      const visualVariant = visualSelectionVariant.value
      if (import.meta.env.DEV && !visualVariant && props.selected)
        console.warn(
          'Warning:',
          'For Item to be selected, ActionList or ActionList.Group should have a selectionVariant defined.',
        )
      const selection = visualVariant
        ? h(
            'span',
            {
              class: [classes['action-list-visual-wrap'], classes['action-list-selection']],
              'data-component': 'ActionList.Selection',
            },
            [
              visualVariant === 'radio'
                ? h(Radio, {
                    value: 'unused',
                    checked: props.selected,
                    ariaHidden: true,
                    tabindex: -1,
                  })
                : visualVariant === 'single' || listRole.value === 'menu'
                  ? h(CheckIcon, {
                      'data-component': 'Octicon',
                      'data-octicon': undefined,
                      display: 'inline-block',
                      overflow: 'visible',
                      class: classes['action-list-checkmark'],
                      style: { overflow: 'visible', verticalAlign: 'text-bottom' },
                    })
                  : h('div', { class: [classes['action-list-checkbox']] }),
            ],
          )
        : null
      const trailingVisual =
        matched.trailingVisual ??
        (container.defaultTrailingVisual
          ? h(TrailingVisual, null, { default: () => container.defaultTrailingVisual })
          : null)
      const label = h(
        'span',
        {
          id: labelId.value,
          class: [classes['action-list-label']],
          'data-component': 'ActionList.Item.Label',
        },
        [
          ...rest,
          props.loading === true && !inactive.value
            ? h(VisuallyHidden, null, { default: () => 'Loading' })
            : null,
        ],
      )
      const contents: VNodeChild[] = [
        h('span', { class: [classes['action-list-spacer']] }),
        selection,
        h(
          VisualOrIndicator,
          {
            inactiveText: showInactiveIndicator ? props.inactiveText : undefined,
            itemHasLeadingVisual: Boolean(matched.leadingVisual),
            labelId: labelId.value,
            loading: props.loading,
            position: 'leading',
          },
          { default: () => matched.leadingVisual },
        ),
        h(
          'span',
          {
            class: [classes['action-list-sub-content']],
            'data-component': 'ActionList.Item--DividerContainer',
          },
          [
            matched.description
              ? h(
                  'div',
                  {
                    class: [classes['action-list-description-wrap']],
                    'data-description-variant': descriptionVariant,
                  },
                  [label, matched.description],
                )
              : label,
            h(
              VisualOrIndicator,
              {
                inactiveText: showInactiveIndicator ? props.inactiveText : undefined,
                itemHasLeadingVisual: Boolean(matched.leadingVisual),
                labelId: labelId.value,
                loading: props.loading,
                position: 'trailing',
              },
              { default: () => trailingVisual },
            ),
            !showInactiveIndicator && props.inactiveText
              ? h(
                  'span',
                  { class: [classes['action-list-inactive-warning']], id: warningId },
                  props.inactiveText,
                )
              : null,
          ],
        ),
      ]
      const child = h(ItemContents, null, { default: () => contents })
      const wrapperBindings = {
        ...wrapperProps,
        class: [classes['action-list-content']],
        'data-size': props.size,
      }
      const setElement = (node: unknown) => {
        const instance = node as { element?: HTMLElement; $el?: HTMLElement } | null
        element.value =
          node instanceof HTMLElement ? node : (instance?.element ?? instance?.$el ?? null)
      }
      let wrapper: VNode = itemWrapper.value
        ? itemWrapper.value(
            { ...wrapperBindings, ref: listSemantics.value ? undefined : setElement },
            [child],
          )
        : h(
            listSemantics.value ? 'div' : 'button',
            {
              ...(listSemantics.value ? {} : { type: 'button' }),
              ...wrapperBindings,
              ref: listSemantics.value ? undefined : setElement,
            },
            [child],
          )
      const tooltipText = privateTooltipText.value ?? truncatedText.value
      if (buttonSemantics.value && tooltipText) {
        const trigger = wrapper
        wrapper = h(
          Tooltip,
          { text: tooltipText, direction: 'e', delay: 'medium' },
          { default: () => trigger },
        )
      }
      const trailingActionRendered =
        !inactive.value && !props.loading && !menuContext && Boolean(matched.trailingAction)
      return h(
        'li',
        {
          ...containerProps,
          ref: listSemantics.value ? setElement : undefined,
          'data-component': 'ActionList.Item',
          'data-variant': props.variant === 'danger' ? props.variant : undefined,
          'data-active': props.active ? true : undefined,
          'data-inactive': inactive.value ? true : undefined,
          'data-is-disabled': props.disabled ? true : undefined,
          'data-has-subitem': matched.subItem ? true : undefined,
          'data-has-description': Boolean(matched.description),
          'data-has-trailing-action': trailingActionRendered ? true : undefined,
          'data-trailing-action-loading':
            trailingActionRendered && matched.trailingAction?.props?.loading ? true : undefined,
          class: [classes['action-list-item'], props.className, classAttr],
        },
        [wrapper, trailingActionRendered ? matched.trailingAction : null, matched.subItem],
      )
    }
  },
})
</script>
