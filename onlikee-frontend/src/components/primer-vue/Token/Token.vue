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

/* Primer React 8c0b708 Token/Token.tsx 直译（TokenBase/_TokenTextContainer/
   _RemoveTokenButton 已按源结构拆分为内部组件）。 */

// 源 tokenBorderWidthPx = 1
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
    // React isSelected?: boolean——undefined 时 data-is-selected 属性省略；
    // Boolean 默认 false 会渲染 "false"（审计 G1-1）。
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
      // 源：hasMultipleActionTargets = isTokenInteractive(props) && Boolean(onRemove) && !hideRemoveButton
      const multipleTargets = interactive && removable && !props.hideRemoveButton
      // 源 interactiveTokenProps = {as, href, onClick}：!multipleTargets 时给 TokenBase
      // （经 rest 层落根元素），multipleTargets 时给 TokenTextContainer。
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
        // 源：onKeyDown 不解构、随 rest 进 TokenBase 的包装器；Vue 声明了 keydown emit，
        // 监听器被抽出 attrs，故显式转发给 TokenBase（包装器先调它再处理移除键）。
        onKeydown: (event: KeyboardEvent) => emit('keydown', event),
        // 源：style={{borderWidth: '1px', ...style}} 显式后置于 rest（消费者 style 已合并）
        style: normalizeReactStyle([{ borderWidth: `${tokenBorderWidthPx}px` }, _stl])
      }, {
        default: () => [
          // 源：LeadingVisual && size !== 'small'（truthy 检查，undefined/null/'' 均不渲染，
          // 审计 G1-8）；leadingVisual 插槽为 Vue 胶水。LargeLeadingVisual 为自身修饰类
          // （非后代选择器，审计 G1-7）。
          (props.leadingVisual || slots.leadingVisual) && props.size !== 'small'
            ? h('div', {
              class: ['token__leading', props.size && ['large', 'xlarge'].includes(props.size) ? 'token__leading--large' : '']
            }, [props.leadingVisual ? renderNode(props.leadingVisual) : slots.leadingVisual?.()])
            : null,
          h(TokenTextContainer, { ...(multipleTargets ? interactiveTokenProps : {}) }, {
            default: () => [
              renderNode(props.text),
              // 源：{onRemove && <VisuallyHidden> (press backspace or delete to remove)</VisuallyHidden>}
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
/* Primer React 8c0b708 Token/Token.module.css 直译（根元素同时挂 TokenBase.vue 的
   .token-base；源两 module 同特异度规则由样式表顺序决胜——Vue 注入顺序 TokenBase 在前、
   Token 在后，与源构建产物一致，padding-right:0 等大尺寸覆盖关系同源）。
   兜底值=primitives 11.5.1 light 实值（§6.3-20，审计 G1-4：#656d76/#afb8c133/#d0d7de
   旧代际值更正为 #59636e/#818b981f/#d1d9e0b3）。
   :where() 归零与源一致（data-is-selected 用 :where，data-is-remove-btn 为普通属性
   选择器——源不一致忠实保留，审计 G1-5）。 */
.token { max-width: 100%; color: var(--fgColor-muted, #59636e); background-color: var(--bgColor-neutral-muted, #818b981f); border-color: var(--borderColor-muted, #d1d9e0b3); border-style: solid; }
/* 源 Token.module.css:9-13 死规则：全仓无 data-interactive 输出路径，按用户指令忠实镜像
   （审计 G1-6）。--shadow-resting-medium 兜底=primitives 实值。 */
.token:where([data-interactive='true']):hover { color: var(--fgColor-default, #1f2328); background-color: var(--bgColor-neutral-muted, #818b981f); box-shadow: var(--shadow-resting-medium, 0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f); }
.token:where([data-is-selected='true']) { color: var(--fgColor-default, #1f2328); border-style: solid; border-color: var(--borderColor-emphasis, #818b98); }
.token[data-is-remove-btn='true'] { padding-right: 0; }
/* 源 LeadingVisualContainer：div + line-height 0（stylelint-disable 注释在源中）。 */
.token__leading { margin-right: var(--base-size-4, 4px); line-height: 0; flex-shrink: 0; }
/* 源 LargeLeadingVisual：自身修饰类（clsx 条件挂同类元素），非后代选择器（审计 G1-7）。 */
.token__leading--large { margin-right: var(--base-size-6, 6px); }
</style>
