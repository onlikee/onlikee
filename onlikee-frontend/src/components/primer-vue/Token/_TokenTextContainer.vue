<script lang="ts">
import { defineComponent, h, type PropType, useCssModule } from 'vue'

export default defineComponent({
  name: 'TokenTextContainer',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<'button' | 'a' | 'span'>, default: 'span' },
    id: { type: [Number, String], default: undefined },
  },
  setup(props, { attrs, slots }) {
    const classes = useCssModule()
    return () => {
      const { class: cls, ...restAttrs } = attrs
      return h(
        props.as,
        {
          id: props.id?.toString(),
          ...restAttrs,
          class: [classes['token__text'], cls],
        },
        slots.default?.(),
      )
    }
  },
})
</script>

<style module src="./_TokenTextContainer.module.css"></style>
