<script lang="ts">
import { computed, defineComponent, getCurrentInstance, h, ref, type PropType } from 'vue'
import { renderNode, type NodeProp } from '../internal/renderNode'
import { normalizeReactStyle } from '../internal/style'
import VisuallyHidden from '../internal/components/VisuallyHidden.vue'
import TokenBase from './TokenBase.vue'
import TokenTextContainer from './_TokenTextContainer.vue'
import RemoveTokenButton from './_RemoveTokenButton.vue'
import { isTokenInteractive } from './utils'
import { defaultTokenSize, type TokenSizeKeys } from './types'


const tokenBorderWidthPx = 1

export default defineComponent({
  name: 'Token',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<'button' | 'a' | 'span'>, default: 'span' },
    text: { type: null as unknown as PropType<NodeProp>, required: true },
    id: { type: [Number, String], default: undefined },
    size: { type: String as PropType<TokenSizeKeys>, default: defaultTokenSize },
    disabled: { type: Boolean, default: undefined },
    hideRemoveButton: { type: Boolean, default: undefined },
    isSelected: { type: Boolean, default: undefined },
    leadingVisual: { type: null as unknown as PropType<NodeProp>, default: undefined },
    href: { type: String, default: undefined },
    className: { type: String, default: undefined }
  },
  emits: { remove: () => true, keydown: (_event: KeyboardEvent) => true },
  setup(props, { attrs, slots, emit, expose }) {
    const instance = getCurrentInstance()!
    const base = ref<{ element: HTMLElement | null } | null>(null)
    expose({
      element: computed(() => base.value?.element ?? null),
      focus: (options?: FocusOptions) => base.value?.element?.focus(options),
      blur: () => base.value?.element?.blur()
    })
    // Vue listeners for declared emits are not included in attrs. The VNode has the listener.
    return () => {
      const removable = !!instance.vnode.props?.onRemove
      const tabIndex = Number(attrs.tabindex ?? attrs.tabIndex ?? -1)
      const interactive = isTokenInteractive({
        as: props.as, onClick: attrs.onClick, onFocus: attrs.onFocus, tabIndex, disabled: props.disabled
      })
      const multipleTargets = interactive && removable && !props.hideRemoveButton
      const interactiveTokenProps = { as: props.as, href: props.href, onClick: attrs.onClick }
      const { onClick: _onClick, class: _cls, style: _stl, ...restAttrs } = attrs
      return h(TokenBase, {
        ref: base,
        ...(removable ? { onRemove: () => emit('remove') } : {}),
        id: props.id?.toString(),
        className: ['token', props.className, _cls],
        text: props.text,
        size: props.size,
        disabled: props.disabled,
        'data-is-selected': props.isSelected,
        'data-is-remove-btn': !(props.hideRemoveButton || !removable),
        ...(!multipleTargets ? interactiveTokenProps : {}),
        ...restAttrs,
        onKeydown: (event: KeyboardEvent) => emit('keydown', event),
        style: normalizeReactStyle([{ borderWidth: `${tokenBorderWidthPx}px` }, _stl])
      }, {
        default: () => [
          (props.leadingVisual || slots.leadingVisual) && props.size !== 'small'
            ? h('div', {
              class: ['token__leading', props.size && ['large', 'xlarge'].includes(props.size) ? 'token__leading--large' : '']
            }, [props.leadingVisual ? renderNode(props.leadingVisual) : slots.leadingVisual?.()])
            : null,
          h(TokenTextContainer, { ...(multipleTargets ? interactiveTokenProps : {}) }, {
            default: () => [
              renderNode(props.text),
              removable ? h(VisuallyHidden, null, { default: () => ' (press backspace or delete to remove)' }) : null
            ]
          }),
          !props.hideRemoveButton && removable ? h(RemoveTokenButton, {
            borderOffset: tokenBorderWidthPx,
            onClick: (event: MouseEvent) => { event.stopPropagation(); emit('remove') },
            size: props.size,
            isParentInteractive: interactive,
            'aria-hidden': multipleTargets ? 'true' : 'false'
          }) : null
        ]
      })
    }
  }
})
</script>

<style scoped>
.token { max-width: 100%; color: var(--fgColor-muted, #59636e); background-color: var(--bgColor-neutral-muted, #818b981f); border-color: var(--borderColor-muted, #d1d9e0b3); border-style: solid; }
.token:where([data-interactive='true']):hover { color: var(--fgColor-default, #1f2328); background-color: var(--bgColor-neutral-muted, #818b981f); box-shadow: var(--shadow-resting-medium, 0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f); }
.token:where([data-is-selected='true']) { color: var(--fgColor-default, #1f2328); border-style: solid; border-color: var(--borderColor-emphasis, #818b98); }
.token[data-is-remove-btn='true'] { padding-right: 0; }
.token__leading { margin-right: var(--base-size-4, 4px); line-height: 0; flex-shrink: 0; }
.token__leading--large { margin-right: var(--base-size-6, 6px); }
</style>
