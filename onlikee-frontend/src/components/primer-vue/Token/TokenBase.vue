<script lang="ts">
import { defineComponent, h, ref, type PropType } from 'vue'
import type { NodeProp } from '../internal/renderNode'
import { isTokenInteractive, unknownAttrValue } from './utils'
import { defaultTokenSize, type TokenSizeKeys } from './types'

export default defineComponent({
  name: 'TokenBase',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<'button' | 'a' | 'span'>, default: 'span' },
    text: { type: null as unknown as PropType<NodeProp>, required: true },
    id: { type: [Number, String] as PropType<string | number | undefined>, default: undefined },
    size: { type: String as PropType<TokenSizeKeys>, default: defaultTokenSize },
    isSelected: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    className: { type: [String, Array, Object] as PropType<string | unknown[] | Record<string, unknown> | undefined>, default: undefined },
    disabled: { type: Boolean as PropType<boolean | undefined>, default: undefined }
  },
  emits: { remove: () => true },
  setup(props, { attrs, slots, emit, expose }) {
    const element = ref<HTMLElement | null>(null)
    expose({ element })
    return () => {
      const tabIndex = Number(attrs.tabindex ?? attrs.tabIndex ?? -1)
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
        text: unknownAttrValue(props.text),
        disabled: props.disabled ? '' : undefined,
        ...restAttrs,
        ref: element,
        class: ['token-base', props.className, restAttrs.class],
        onKeydown: (event: KeyboardEvent) => {
          if (typeof consumerOnKeydown === 'function') consumerOnKeydown(event)
          if (event.key === 'Backspace' || event.key === 'Delete') {
            emit('remove')
          }
        }
      }, slots.default?.())
    }
  }
})
</script>

<style scoped>
.token-base { position: relative; display: inline-flex; font-family: inherit; font-weight: var(--base-text-weight-semibold, 600); text-decoration: none; white-space: nowrap; border-radius: var(--borderRadius-full, 624.9375rem); align-items: center; line-height: 1; }
.token-base:where([data-cursor-is-interactive='true']) { cursor: pointer; }
.token-base:where([data-cursor-is-interactive='false']) { cursor: auto; }
.token-base:where([data-size='small']) { width: auto; height: var(--base-size-16, 16px); padding-right: var(--base-size-4, 4px); padding-left: var(--base-size-4, 4px); font-size: var(--text-body-size-small, 12px); }
.token-base:where([data-size='medium']) { width: auto; height: var(--base-size-20, 20px); padding-right: var(--base-size-6, 6px); padding-left: var(--base-size-6, 6px); font-size: var(--text-body-size-small, 12px); }
.token-base[data-size='large'] { width: auto; height: var(--base-size-24, 24px); padding-right: var(--base-size-8, 8px); padding-left: var(--base-size-8, 8px); font-size: var(--text-body-size-medium, 14px); }
.token-base[data-size='xlarge'] { width: auto; height: var(--base-size-32, 32px); padding-top: 0; padding-right: var(--base-size-12, 12px); padding-bottom: 0; padding-left: var(--base-size-12, 12px); font-size: var(--text-body-size-medium, 14px); }
</style>
