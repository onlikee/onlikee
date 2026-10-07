<script lang="ts">
import { defineComponent, h, ref, type PropType, useCssModule } from 'vue'
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
    const classes = useCssModule()
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
        class: [classes['token-base'], props.className, restAttrs.class],
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

<style module src="./TokenBase.module.css"></style>
