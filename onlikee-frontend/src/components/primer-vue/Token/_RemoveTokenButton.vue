<script lang="ts">
import { defineComponent, h, type PropType } from 'vue'
import { defaultTokenSize, type TokenSizeKeys } from './types'

const X_ICON_PATHS: Record<12 | 16, string> = {
  12: 'M2.22 2.22a.749.749 0 0 1 1.06 0L6 4.939 8.72 2.22a.749.749 0 1 1 1.06 1.06L7.061 6 9.78 8.72a.749.749 0 1 1-1.06 1.06L6 7.061 3.28 9.78a.749.749 0 1 1-1.06-1.06L4.939 6 2.22 3.28a.749.749 0 0 1 0-1.06Z',
  16: 'M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z'
}
function renderXIcon(size: 12 | 16) {
  return h('svg', {
    'data-component': 'Octicon', 'aria-hidden': 'true', focusable: 'false',
    class: 'octicon octicon-x', viewBox: `0 0 ${size} ${size}`, width: size, height: size,
    fill: 'currentColor', display: 'inline-block', overflow: 'visible',
    style: { verticalAlign: 'text-bottom' }
  }, [h('path', { d: X_ICON_PATHS[size] })])
}

export default defineComponent({
  name: 'RemoveTokenButton',
  inheritAttrs: false,
  props: {
    borderOffset: { type: Number, default: 0 },
    size: { type: String as PropType<TokenSizeKeys>, default: defaultTokenSize },
    isParentInteractive: { type: Boolean, default: undefined },
    className: { type: [String, Array, Object] as PropType<string | unknown[] | Record<string, unknown> | undefined>, default: undefined }
  },
  setup(props, { attrs }) {
    return () => {
      const { class: cls, 'aria-label': ariaLabel, ...restAttrs } = attrs
      const icon = renderXIcon(props.size === 'small' || props.size === 'medium' ? 12 : 16)
      const style = { transform: `translate(${props.borderOffset}px, -${props.borderOffset}px)` }
      const classList = ['token__remove', props.className, cls]
      if (props.isParentInteractive) {
        return h('span', {
          ...restAttrs,
          tabindex: -1,
          'aria-label': ariaLabel,
          'data-size': props.size,
          class: classList,
          style
        }, [icon])
      }
      return h('button', {
        ...restAttrs,
        'aria-label': 'Remove token',
        'data-size': props.size,
        class: classList,
        style,
        type: 'button'
      }, [icon])
    }
  }
})
</script>

<style scoped>
.token__remove { display: inline-flex; padding: 0; margin-left: var(--base-size-4, 4px); font-family: inherit; color: currentColor; text-decoration: none; cursor: pointer; user-select: none; background-color: transparent; border: 0; border-radius: var(--borderRadius-full, 624.9375rem); justify-content: center; align-items: center; appearance: none; align-self: baseline; }
.token__remove[data-size='small'] { width: var(--base-size-16, 16px); height: var(--base-size-16, 16px); }
.token__remove[data-size='medium'] { width: var(--base-size-20, 20px); height: var(--base-size-20, 20px); }
.token__remove[data-size='large'] { width: var(--base-size-24, 24px); height: var(--base-size-24, 24px); margin-left: var(--base-size-6, 6px); }
.token__remove[data-size='xlarge'] { width: var(--base-size-32, 32px); height: var(--base-size-32, 32px); margin-left: var(--base-size-6, 6px); }
.token__remove:hover, .token__remove:focus { background-color: var(--control-transparent-bgColor-hover, #818b981a); }
.token__remove:active { background-color: var(--control-transparent-bgColor-active, #818b9826); }
</style>
