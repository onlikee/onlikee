<script lang="ts">
import { computed, defineComponent, getCurrentInstance, h, ref, type PropType, useCssModule } from 'vue'
import { renderNode, type NodeProp } from '../internal/renderNode'
import TokenBase from './TokenBase.vue'
import TokenTextContainer from './_TokenTextContainer.vue'
import RemoveTokenButton from './_RemoveTokenButton.vue'
import { parseToHsla, parseToRgba } from './color2k'
import { isTokenInteractive } from './utils'
import { defaultTokenSize, type TokenSizeKeys } from './types'

export default defineComponent({
  name: 'IssueLabelToken',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<'button' | 'a' | 'span'>, default: 'span' },
    text: { type: null as unknown as PropType<NodeProp>, required: true },
    id: { type: [Number, String], default: undefined },
    size: { type: String as PropType<TokenSizeKeys>, default: defaultTokenSize },
    disabled: { type: Boolean, default: undefined },
    hideRemoveButton: { type: Boolean, default: undefined },
    // undefined 时 data-selected 属性省略（Boolean 默认 false 会渲染 "false"）
    isSelected: { type: Boolean, default: undefined },
    fillColor: { type: String, default: '#999' },
    href: { type: String, default: undefined },
    className: { type: String, default: undefined }
  },
  emits: { remove: () => true },
  setup(props, { attrs, emit, expose }) {
    const classes = useCssModule()
    const instance = getCurrentInstance()!
    const base = ref<{ element: HTMLElement | null } | null>(null)
    expose({
      element: computed(() => base.value?.element ?? null),
      focus: (options?: FocusOptions) => base.value?.element?.focus(options),
      blur: () => base.value?.element?.blur()
    })
    const customProperties = computed(() => {
      const [r, g, b] = parseToRgba(props.fillColor)
      const [hue, s, l] = parseToHsla(props.fillColor)
      return {
        '--label-r': String(r),
        '--label-g': String(g),
        '--label-b': String(b),
        '--label-h': String(Math.round(hue)),
        '--label-s': String(Math.round(s * 100)),
        '--label-l': String(Math.round(l * 100))
      }
    })
    return () => {
      const removable = !!instance.vnode.props?.onRemove
      const tabIndex = Number(attrs.tabindex ?? attrs.tabIndex ?? -1)
      const interactive = isTokenInteractive({
        as: props.as, onClick: attrs.onClick, onFocus: attrs.onFocus, tabIndex, disabled: props.disabled
      })
      const multipleTargets = interactive && removable && !props.hideRemoveButton
      const interactiveTokenProps = { as: props.as, href: props.href, onClick: attrs.onClick }
      const { onClick: _onClick, class: _cls, ...restAttrs } = attrs
      return h(TokenBase, {
        ref: base,
        ...(removable ? { onRemove: () => emit('remove') } : {}),
        id: props.id?.toString(),
        isSelected: props.isSelected,
        className: [classes['issue-label'], props.className, _cls],
        text: props.text,
        size: props.size,
        disabled: props.disabled,
        style: customProperties.value,
        'data-has-remove-button': !props.hideRemoveButton && removable,
        'data-selected': props.isSelected,
        ...(!multipleTargets ? interactiveTokenProps : {}),
        ...restAttrs
      }, {
        default: () => [
          h(TokenTextContainer, { ...(multipleTargets ? interactiveTokenProps : {}) }, {
            default: () => [renderNode(props.text)]
          }),
          !props.hideRemoveButton && removable ? h(RemoveTokenButton, {
            borderOffset: 1,
            onClick: (event: MouseEvent) => { event.stopPropagation(); emit('remove') },
            size: props.size,
            'aria-hidden': multipleTargets ? 'true' : 'false',
            isParentInteractive: interactive,
            'data-has-multiple-action-targets': multipleTargets,
            className: [classes['issue-label__remove']]
          }) : null
        ]
      })
    }
  }
})
</script>

<style module src="./IssueLabelToken.module.css"></style>
