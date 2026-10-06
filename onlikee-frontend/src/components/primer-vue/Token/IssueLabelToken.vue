<script lang="ts">
import { computed, defineComponent, getCurrentInstance, h, ref, type PropType } from 'vue'
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
        className: ['issue-label', props.className, _cls],
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
            className: 'issue-label__remove'
          }) : null
        ]
      })
    }
  }
})
</script>

<style scoped>
.issue-label {
  /* Color variables - dynamically set via inline CSS custom properties */
  --label-r: 153;
  --label-g: 153;
  --label-b: 153;
  --label-h: 0;
  --label-s: 0;
  --label-l: 60;
  --perceived-lightness: calc(((var(--label-r, 153) * 0.2126) + (var(--label-g, 153) * 0.7152) + (var(--label-b, 153) * 0.0722)) / 255);
  --lightness-switch: max(0, min(calc(1 / (var(--lightness-threshold, 0.6) - var(--perceived-lightness, 0.6))), 1));
  position: relative;
  border-width: var(--borderWidth-thin, 1px);
  border-style: solid;
}
@media (prefers-color-scheme: light) {
  [data-color-mode='auto'][data-light-theme*='light'] .issue-label {
    --lightness-threshold: 0.453;
    --border-threshold: 0.96;
    --border-alpha: max(0, min(calc((var(--perceived-lightness, 0.6) - var(--border-threshold, 0.96)) * 100), 1));
    background: rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153));
    color: hsl(0deg, 0%, calc(var(--lightness-switch, 1) * 100%));
    border-color: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) - 25) * 1%), var(--border-alpha, 0));
  }
  [data-color-mode='auto'][data-light-theme*='light'] .issue-label:where([data-selected='true']) { background: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) - 5) * 1%)); }
  [data-color-mode='auto'][data-light-theme*='light'] .issue-label:where([data-selected='true'])::after { box-shadow: 0 0 0 2px rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153)); }
  [data-color-mode='auto'][data-light-theme*='light'] .issue-label:where([data-cursor-is-interactive='true']:hover) {
    background-image: linear-gradient(rgb(0, 0, 0, 0.15), rgb(0, 0, 0, 0.15)), linear-gradient(rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153)), rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153)));
    box-shadow: var(--shadow-resting-medium, 0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f);
  }
  [data-color-mode='auto'][data-light-theme*='dark'] .issue-label {
    --lightness-threshold: 0.6;
    --background-alpha: 0.18;
    --border-alpha: 0.3;
    --lighten-by: calc(((var(--lightness-threshold, 0.6) - var(--perceived-lightness, 0.6)) * 100) * var(--lightness-switch, 1));
    background: rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153), var(--background-alpha, 0.18));
    color: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) + var(--lighten-by, 0)) * 1%));
    border-color: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) + var(--lighten-by, 0)) * 1%), var(--border-alpha, 0));
  }
  [data-color-mode='auto'][data-light-theme*='dark'] .issue-label:where([data-selected='true'])::after { box-shadow: 0 0 0 2px hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) + var(--lighten-by, 0)) * 1%)); }
  [data-color-mode='auto'][data-light-theme*='dark'] .issue-label:where([data-cursor-is-interactive='true']:hover) {
    background: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc(calc(var(--label-l, 60) + 10) * 1%), 0.3);
    box-shadow: var(--shadow-resting-medium, 0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f);
  }
}
@media (prefers-color-scheme: dark) {
  [data-color-mode='auto'][data-dark-theme*='light'] .issue-label {
    --lightness-threshold: 0.453;
    --border-threshold: 0.96;
    --border-alpha: max(0, min(calc((var(--perceived-lightness, 0.6) - var(--border-threshold, 0.96)) * 100), 1));
    background: rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153));
    color: hsl(0deg, 0%, calc(var(--lightness-switch, 1) * 100%));
    border-color: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) - 25) * 1%), var(--border-alpha, 0));
  }
  [data-color-mode='auto'][data-dark-theme*='light'] .issue-label:where([data-selected='true']) { background: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) - 5) * 1%)); }
  [data-color-mode='auto'][data-dark-theme*='light'] .issue-label:where([data-selected='true'])::after { box-shadow: 0 0 0 2px rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153)); }
  [data-color-mode='auto'][data-dark-theme*='light'] .issue-label:where([data-cursor-is-interactive='true']:hover) {
    background-image: linear-gradient(rgb(0, 0, 0, 0.15), rgb(0, 0, 0, 0.15)), linear-gradient(rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153)), rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153)));
    box-shadow: var(--shadow-resting-medium, 0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f);
  }
  [data-color-mode='auto'][data-dark-theme*='dark'] .issue-label {
    --lightness-threshold: 0.6;
    --background-alpha: 0.18;
    --border-alpha: 0.3;
    --lighten-by: calc(((var(--lightness-threshold, 0.6) - var(--perceived-lightness, 0.6)) * 100) * var(--lightness-switch, 1));
    background: rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153), var(--background-alpha, 0.18));
    color: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) + var(--lighten-by, 0)) * 1%));
    border-color: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) + var(--lighten-by, 0)) * 1%), var(--border-alpha, 0));
  }
  [data-color-mode='auto'][data-dark-theme*='dark'] .issue-label:where([data-selected='true'])::after { box-shadow: 0 0 0 2px hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) + var(--lighten-by, 0)) * 1%)); }
  [data-color-mode='auto'][data-dark-theme*='dark'] .issue-label:where([data-cursor-is-interactive='true']:hover) {
    background: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc(calc(var(--label-l, 60) + 10) * 1%), 0.3);
    box-shadow: var(--shadow-resting-medium, 0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f);
  }
}
/* Light mode styles */
[data-color-mode='light'] .issue-label {
  --lightness-threshold: 0.453;
  --border-threshold: 0.96;
  --border-alpha: max(0, min(calc((var(--perceived-lightness, 0.6) - var(--border-threshold, 0.96)) * 100), 1));
  background: rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153));
  color: hsl(0deg, 0%, calc(var(--lightness-switch, 1) * 100%));
  border-color: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) - 25) * 1%), var(--border-alpha, 0));
}
[data-color-mode='light'] .issue-label:where([data-selected='true']) { background: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) - 5) * 1%)); }
[data-color-mode='light'] .issue-label:where([data-selected='true'])::after { box-shadow: 0 0 0 2px rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153)); }
[data-color-mode='light'] .issue-label:where([data-cursor-is-interactive='true']:hover) {
  background-image: linear-gradient(rgb(0, 0, 0, 0.15), rgb(0, 0, 0, 0.15)), linear-gradient(rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153)), rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153)));
  box-shadow: var(--shadow-resting-medium, 0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f);
}
/* Dark mode styles */
[data-color-mode='dark'] .issue-label {
  --lightness-threshold: 0.6;
  --background-alpha: 0.18;
  --border-alpha: 0.3;
  --lighten-by: calc(((var(--lightness-threshold, 0.6) - var(--perceived-lightness, 0.6)) * 100) * var(--lightness-switch, 1));
  background: rgb(var(--label-r, 153), var(--label-g, 153), var(--label-b, 153), var(--background-alpha, 0.18));
  color: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) + var(--lighten-by, 0)) * 1%));
  border-color: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) + var(--lighten-by, 0)) * 1%), var(--border-alpha, 0));
}
[data-color-mode='dark'] .issue-label:where([data-selected='true'])::after { box-shadow: 0 0 0 2px hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc((var(--label-l, 60) + var(--lighten-by, 0)) * 1%)); }
[data-color-mode='dark'] .issue-label:where([data-cursor-is-interactive='true']:hover) {
  background: hsl(var(--label-h, 0), calc(var(--label-s, 0) * 1%), calc(calc(var(--label-l, 60) + 10) * 1%), 0.3);
  box-shadow: var(--shadow-resting-medium, 0 1px 1px 0 #25292e1a, 0 3px 6px 0 #25292e1f);
}
/* Selected state */
.issue-label:where([data-selected='true']) { outline: none; }
.issue-label:where([data-selected='true'])::after { content: ''; position: absolute; z-index: 1; top: calc(var(--base-size-2, 2px) * -1); right: calc(var(--base-size-2, 2px) * -1); bottom: calc(var(--base-size-2, 2px) * -1); left: calc(var(--base-size-2, 2px) * -1); display: block; pointer-events: none; border-radius: var(--borderRadius-full, 624.9375rem); }
/* Remove button styling */
.issue-label:where([data-has-remove-button='true']) { padding-right: 0; }
.issue-label__remove:where([data-has-multiple-action-targets='true']) { position: relative; z-index: 1; }
</style>
