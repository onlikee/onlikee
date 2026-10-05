<script lang="ts">
import { defineComponent, h, ref, type PropType } from 'vue'
import type { NodeProp } from '../internal/renderNode'
import { isTokenInteractive, unknownAttrValue } from './utils'
import { defaultTokenSize, type TokenSizeKeys } from './types'

/* Primer React 8c0b708 Token/TokenBase.tsx 直译（内部组件，index 不导出——源同样只导出
   Token/IssueLabelToken）。
   React JSX 属性覆盖序（后写胜前）：
     1. TokenBase 层：onKeyDown(包装)/className/data-cursor-is-interactive/data-size/id
     2. {...rest} 层：text(泄漏属性)/data-is-selected/data-is-remove-btn/
        [interactiveTokenProps(!multipleTargets 时)]/消费者属性(disabled、tabindex、style 等)
     3. ref
   因此 data-* 计算值可被消费者同名属性覆盖（源怪癖，审计 G1-9），Vue 以对象字面量键序镜像。 */
export default defineComponent({
  name: 'TokenBase',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<'button' | 'a' | 'span'>, default: 'span' },
    // 源不解构 text → 经 rest 泄漏为 DOM 属性（React 未知属性序列化，见 utils.unknownAttrValue）
    text: { type: null as unknown as PropType<NodeProp>, required: true },
    id: { type: [Number, String] as PropType<string | number | undefined>, default: undefined },
    size: { type: String as PropType<TokenSizeKeys>, default: defaultTokenSize },
    // 源解构 isSelected: _isSelected 后丢弃（仅 Token 层的 data-is-selected 落 DOM）
    isSelected: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    // 源解构 className 并 clsx(classes.TokenBase, className) 合并
    className: { type: [String, Array, Object] as PropType<string | unknown[] | Record<string, unknown> | undefined>, default: undefined },
    disabled: { type: Boolean as PropType<boolean | undefined>, default: undefined }
  },
  emits: { remove: () => true },
  setup(props, { attrs, slots, emit, expose }) {
    const element = ref<HTMLElement | null>(null)
    expose({ element })
    return () => {
      const tabIndex = Number(attrs.tabindex ?? attrs.tabIndex ?? -1)
      // 源解构 onKeyDown 并包装（先调消费者处理器，再 Backspace/Delete 触发 onRemove，
      // 无 disabled 守卫——disabled token 仍可键盘移除，源怪癖）；其余 attrs 即 rest 层。
      const { onKeydown: consumerOnKeydown, ...restAttrs } = attrs
      return h(props.as, {
        // TokenBase 层（rest 之前，可被消费者同名属性覆盖）：
        'data-cursor-is-interactive': isTokenInteractive({
          as: props.as,
          onClick: restAttrs.onClick,
          onFocus: restAttrs.onFocus,
          tabIndex,
          disabled: props.disabled
        }),
        'data-size': props.size,
        id: props.id?.toString(),
        // rest 层（源 {...rest} 位序；disabled 为 BOOLEAN 属性，React 对任意标签输出
        // disabled=""，Vue 以空串镜像；text 泄漏见 unknownAttrValue）：
        text: unknownAttrValue(props.text),
        disabled: props.disabled ? '' : undefined,
        ...restAttrs,
        // 显式层（源中 ref/包装 onKeyDown 后置于 rest；class 为两层 clsx 合并的 Vue 胶水）：
        ref: element,
        class: ['token-base', props.className, restAttrs.class],
        onKeydown: (event: KeyboardEvent) => {
          if (typeof consumerOnKeydown === 'function') consumerOnKeydown(event)
          if (event.key === 'Backspace' || event.key === 'Delete') {
            // 源：onRemove 存在才调用；Vue emit 无监听者时为 no-op，观测等价。
            emit('remove')
          }
        }
      }, slots.default?.())
    }
  }
})
</script>

<style scoped>
/* Primer React 8c0b708 Token/TokenBase.module.css 直译。
   源不一致忠实保留：cursor 与 small/medium 用 :where()（特异度归零），large/xlarge 为
   普通属性选择器（审计 G1-5）。兜底值=primitives 11.5.1 light 实值（§6.3-20；px≡rem
   数值等价族见 §6.3-5 登记）。--borderRadius-full 624.9375rem=radius.css 实值。 */
.token-base { position: relative; display: inline-flex; font-family: inherit; font-weight: var(--base-text-weight-semibold, 600); text-decoration: none; white-space: nowrap; border-radius: var(--borderRadius-full, 624.9375rem); align-items: center; line-height: 1; }
.token-base:where([data-cursor-is-interactive='true']) { cursor: pointer; }
.token-base:where([data-cursor-is-interactive='false']) { cursor: auto; }
.token-base:where([data-size='small']) { width: auto; height: var(--base-size-16, 16px); padding-right: var(--base-size-4, 4px); padding-left: var(--base-size-4, 4px); font-size: var(--text-body-size-small, 12px); }
.token-base:where([data-size='medium']) { width: auto; height: var(--base-size-20, 20px); padding-right: var(--base-size-6, 6px); padding-left: var(--base-size-6, 6px); font-size: var(--text-body-size-small, 12px); }
.token-base[data-size='large'] { width: auto; height: var(--base-size-24, 24px); padding-right: var(--base-size-8, 8px); padding-left: var(--base-size-8, 8px); font-size: var(--text-body-size-medium, 14px); }
.token-base[data-size='xlarge'] { width: auto; height: var(--base-size-32, 32px); padding-top: 0; padding-right: var(--base-size-12, 12px); padding-bottom: 0; padding-left: var(--base-size-12, 12px); font-size: var(--text-body-size-medium, 14px); }
</style>
