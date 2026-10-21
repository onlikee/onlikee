<script lang="ts">
import { defineComponent, h, provide, shallowRef, toRef, type PropType } from 'vue'
import { useSlots } from '../composables/useSlots'
import { normalizeReactStyle } from '../internal/style'
import PageLayoutHeader from './PageLayoutHeader.vue'
import PageLayoutFooter from './PageLayoutFooter.vue'
import PageLayoutSidebar from './PageLayoutSidebar.vue'
import { pageLayoutContextKey } from './context'
import classes from './PageLayout.module.css'
import type { PageLayoutProps } from './types'

export default defineComponent({
  name: 'PageLayout',
  inheritAttrs: false,
  props: {
    containerWidth: {
      type: String as PropType<PageLayoutProps['containerWidth']>,
      default: 'xlarge',
    },
    padding: { type: String as PropType<PageLayoutProps['padding']>, default: 'normal' },
    rowGap: { type: String as PropType<PageLayoutProps['rowGap']>, default: 'normal' },
    columnGap: { type: String as PropType<PageLayoutProps['columnGap']>, default: 'normal' },
    className: { type: String, default: undefined },
    // eslint-disable-next-line vue/prop-name-casing -- Private source contract used by SplitPageLayout.
    _slotsConfig: { type: Object as PropType<PageLayoutProps['_slotsConfig']>, default: undefined },
  },
  setup(props, { attrs, slots }) {
    const sidebarContentWrapperRef = shallowRef<HTMLDivElement | null>(null)
    provide(pageLayoutContextKey, {
      padding: toRef(props, 'padding'),
      rowGap: toRef(props, 'rowGap'),
      columnGap: toRef(props, 'columnGap'),
      paneRef: shallowRef(null),
      contentWrapperRef: shallowRef(null),
      sidebarRef: shallowRef(null),
      sidebarContentWrapperRef,
    })
    return () => {
      const [regions, rest] = useSlots(
        slots.default?.(),
        props._slotsConfig ?? {
          header: PageLayoutHeader,
          footer: PageLayoutFooter,
          sidebar: PageLayoutSidebar,
        },
      )
      return h(
        'div',
        {
          class: [classes.PageLayoutRoot, props.className, attrs.class],
          'data-component': attrs['data-component'] ?? 'PageLayout',
          'data-has-sidebar': regions.sidebar ? true : undefined,
          style: [
            { '--spacing': `var(--spacing-${props.padding})` },
            normalizeReactStyle(attrs.style),
          ],
        },
        [
          regions.sidebar,
          h(
            'div',
            {
              ref: sidebarContentWrapperRef,
              class: classes.PageLayoutWrapper,
              'data-width': props.containerWidth,
            },
            [regions.header, h('div', { class: classes.PageLayoutContent }, rest), regions.footer],
          ),
        ],
      )
    }
  },
})
</script>
