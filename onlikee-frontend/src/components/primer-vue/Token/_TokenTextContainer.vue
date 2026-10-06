<script lang="ts">
import { defineComponent, h, type PropType } from 'vue'

export default defineComponent({
  name: 'TokenTextContainer',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<'button' | 'a' | 'span'>, default: 'span' },
    id: { type: [Number, String], default: undefined }
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { class: cls, ...restAttrs } = attrs
      return h(props.as, {
        id: props.id?.toString(),
        ...restAttrs,
        class: ['token__text', cls]
      }, slots.default?.())
    }
  }
})
</script>

<style scoped>
.token__text { width: auto; min-width: 0; padding: 0; margin: 0; overflow: hidden; font: inherit; line-height: var(--base-text-lineHeight-normal, 1.5); color: inherit; color: currentColor; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; background: transparent; border: none; flex-grow: 1; -webkit-font-smoothing: inherit; -moz-osx-font-smoothing: inherit; appearance: none; }
.token__text:is(a, button, [tabindex='0']) { cursor: pointer; }
.token__text:is(a, button, [tabindex='0'])::after { position: absolute; top: 0; right: 0; bottom: 0; left: 0; content: ''; }
</style>
